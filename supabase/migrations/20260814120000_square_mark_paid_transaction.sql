-- Square mark-paid: one transaction for ledger insert + booking status,
-- plus a staff-visible queue when Square COMPLETED but the booking did not update.

-- ----------------------------------------------------------------------------
-- 1. payment_reconciliation_issues — staff queue (service-role only)
-- ----------------------------------------------------------------------------
create table if not exists public.payment_reconciliation_issues (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  resolve_note text null,
  booking_id uuid null references public.tour_bookings (id) on delete set null,
  booking_reference text not null,
  external_payment_id text not null,
  amount_cents integer null,
  payment_method text null,
  reason text not null,
  detail text null,
  source text null
);

create index if not exists payment_reconciliation_issues_open_idx
  on public.payment_reconciliation_issues (created_at desc)
  where resolved_at is null;

create unique index if not exists payment_reconciliation_issues_open_payment_reason_uidx
  on public.payment_reconciliation_issues (external_payment_id, reason)
  where resolved_at is null;

alter table public.payment_reconciliation_issues enable row level security;
revoke all on public.payment_reconciliation_issues from anon, authenticated;

comment on table public.payment_reconciliation_issues is
  'Open Square (or gateway) charges that did not land on tour_bookings. Staff-api + Edge Functions only.';

-- ----------------------------------------------------------------------------
-- 2. apply_square_payment — insert ledger + update booking in one transaction
-- ----------------------------------------------------------------------------
create or replace function public.apply_square_payment(
  p_booking_ref text,
  p_amount_cents integer,
  p_payment_id text,
  p_payment_method text default 'square'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref text;
  v_method text;
  v_booking public.tour_bookings%rowtype;
  v_price numeric := 0;
  v_amount numeric;
  v_paid_total numeric := 0;
  v_new_status text;
  v_installment_no integer;
  v_invoice text;
  v_label text;
  v_existing_id uuid;
  v_status_before text;
  v_amount_before numeric;
  v_repaired boolean := false;
  v_skipped boolean := false;
begin
  v_ref := upper(trim(coalesce(p_booking_ref, '')));
  v_method := nullif(trim(coalesce(p_payment_method, '')), '');
  if v_method is null then
    v_method := 'square';
  end if;

  if v_ref = '' or coalesce(p_payment_id, '') = '' then
    return json_build_object('ok', false, 'error', 'invalid_params');
  end if;

  v_amount := round(p_amount_cents::numeric) / 100.0;
  if v_amount is null or v_amount <= 0 then
    return json_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  select * into v_booking
  from public.tour_bookings
  where booking_reference ilike v_ref
  limit 1;

  if not found then
    return json_build_object('ok', false, 'error', 'booking_not_found');
  end if;

  select coalesce(price_aud, 0) into v_price
  from public.tours
  where id = v_booking.tour_id;

  select id into v_existing_id
  from public.booking_payments
  where external_payment_id = p_payment_id
  limit 1;

  if v_existing_id is null then
    select count(*)::int into v_installment_no
    from public.booking_payments
    where booking_id = v_booking.id;
    v_installment_no := coalesce(v_installment_no, 0) + 1;
    v_invoice := 'T2T-INV-' || coalesce(v_booking.booking_reference, left(v_booking.id::text, 8)) || '-' || v_installment_no;
    if v_installment_no = 1 then
      v_label := 'Deposit';
    else
      v_label := 'Installment ' || v_installment_no::text;
      if v_booking.payment_plan_installments is not null then
        v_label := v_label || '/' || v_booking.payment_plan_installments::text;
      end if;
    end if;

    begin
      insert into public.booking_payments (
        booking_id,
        amount_aud,
        payment_method,
        installment_no,
        label,
        status,
        paid_at,
        receipt_invoice_number,
        external_payment_id,
        recorded_by_staff_id
      ) values (
        v_booking.id,
        v_amount,
        v_method,
        v_installment_no,
        v_label,
        'paid',
        now(),
        v_invoice,
        p_payment_id,
        null
      );
    exception
      when unique_violation then
        v_skipped := true;
    end;
  else
    v_skipped := true;
  end if;

  select coalesce(sum(amount_aud), 0) into v_paid_total
  from public.booking_payments
  where booking_id = v_booking.id
    and (
      status = 'paid'
      or (status is null and paid_at is not null)
    );

  if v_booking.booking_status = 'cancelled' then
    v_new_status := 'cancelled';
  elsif v_price > 0 and v_paid_total >= v_price then
    v_new_status := 'fully_paid';
  elsif v_paid_total > 0 then
    v_new_status := 'deposit_paid';
  else
    v_new_status := v_booking.booking_status;
  end if;

  v_status_before := v_booking.booking_status;
  v_amount_before := coalesce(v_booking.amount_paid_aud, 0);

  if v_status_before is distinct from v_new_status
     or abs(v_amount_before - v_paid_total) > 0.005 then
    update public.tour_bookings
    set
      amount_paid_aud = v_paid_total,
      booking_status = v_new_status,
      payment_method = case
        when booking_status = 'cancelled' then payment_method
        else v_method
      end
    where id = v_booking.id;
    v_repaired := v_skipped;
  end if;

  update public.payment_reconciliation_issues
  set
    resolved_at = now(),
    resolve_note = coalesce(resolve_note, 'auto_synced')
  where external_payment_id = p_payment_id
    and resolved_at is null;

  return json_build_object(
    'ok', true,
    'skipped', v_skipped,
    'repaired', v_repaired,
    'booking_status', v_new_status,
    'amount_paid_aud', v_paid_total
  );
end;
$$;

revoke all on function public.apply_square_payment(text, integer, text, text) from public;
grant execute on function public.apply_square_payment(text, integer, text, text) to service_role;

comment on function public.apply_square_payment(text, integer, text, text) is
  'Idempotent Square mark-paid: ledger row + tour_bookings status in one transaction. Re-applies status if the payment id already exists.';

notify pgrst, 'reload schema';
