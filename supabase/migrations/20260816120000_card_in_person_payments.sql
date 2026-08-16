-- Manual in-person Square Reader charges (Cashier POS).
-- payment_method on booking_payments has never had a CHECK constraint (text only).
-- We do not add one here: live rows already mix values (payid, square, afterpay,
-- cash, manual, bank_transfer). Method is enforced in staff-api callers.
-- Ledger + booking status still go through apply_square_payment (extended with
-- optional staff id / note so Cashier metadata stays in the same transaction).

alter table public.booking_payments
  add column if not exists staff_note text null;

comment on column public.booking_payments.staff_note is
  'Optional staff note for manual entries (Square Reader receipt, walk-in).';

comment on column public.booking_payments.payment_method is
  'Known values: payid, cash, bank_transfer, square (card-not-present), afterpay, card_in_person (Square Reader), manual. No CHECK constraint.';

drop function if exists public.apply_square_payment(text, integer, text, text);
drop function if exists public.apply_square_payment(text, integer, text, text, uuid, text);

create or replace function public.apply_square_payment(
  p_booking_ref text,
  p_amount_cents integer,
  p_payment_id text,
  p_payment_method text default 'square',
  p_recorded_by_staff_id uuid default null,
  p_staff_note text default null
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
  v_note text;
begin
  v_ref := upper(trim(coalesce(p_booking_ref, '')));
  v_method := nullif(trim(coalesce(p_payment_method, '')), '');
  if v_method is null then
    v_method := 'square';
  end if;
  v_note := nullif(trim(coalesce(p_staff_note, '')), '');

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
        recorded_by_staff_id,
        staff_note
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
        p_recorded_by_staff_id,
        v_note
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

  if v_installment_no is null then
    select installment_no into v_installment_no
    from public.booking_payments
    where external_payment_id = p_payment_id
    limit 1;
  end if;

  return json_build_object(
    'ok', true,
    'skipped', v_skipped,
    'repaired', v_repaired,
    'booking_status', v_new_status,
    'amount_paid_aud', v_paid_total,
    'installment_no', v_installment_no
  );
end;
$$;

revoke all on function public.apply_square_payment(text, integer, text, text, uuid, text) from public;
grant execute on function public.apply_square_payment(text, integer, text, text, uuid, text) to service_role;

comment on function public.apply_square_payment(text, integer, text, text, uuid, text) is
  'Idempotent mark-paid: ledger row + tour_bookings status in one transaction. Used for Square online, Afterpay, and manual card_in_person Reader entries.';

notify pgrst, 'reload schema';
