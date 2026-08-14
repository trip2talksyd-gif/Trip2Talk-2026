-- Written quotations for extra trip day(s) on an existing booking.
-- Customer must pay the full quoted amount at least 10 days before departure.
-- Unpaid quotes expire automatically — booking duration is NOT changed.
-- Duration lives on tours; paid extensions accumulate on tour_bookings.extra_days_paid.
-- Customer link: /quote/:quote_token (same opaque-token pattern as waiver_token).

-- ----------------------------------------------------------------------------
-- 1. Booking-level paid extra days (original tour duration stays on tours)
-- ----------------------------------------------------------------------------
alter table public.tour_bookings
  add column if not exists extra_days_paid integer not null default 0;

alter table public.tour_bookings
  drop constraint if exists tour_bookings_extra_days_paid_nonneg;

alter table public.tour_bookings
  add constraint tour_bookings_extra_days_paid_nonneg
  check (extra_days_paid >= 0);

comment on column public.tour_bookings.extra_days_paid is
  'Paid extra days from trip_extension_quotes (status=paid). Expired/cancelled quotes never change this.';

-- ----------------------------------------------------------------------------
-- 2. trip_extension_quotes
-- ----------------------------------------------------------------------------
create table if not exists public.trip_extension_quotes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.tour_bookings (id) on delete cascade,
  extra_days integer not null,
  price_difference_aud numeric(12, 2) not null,
  quote_note text not null,
  status text not null default 'pending',
  payment_deadline date not null,
  quote_token text not null,
  created_by uuid null references public.staff_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  paid_at timestamptz null,
  payment_method text null,
  constraint trip_extension_quotes_extra_days_pos check (extra_days >= 1),
  constraint trip_extension_quotes_price_pos check (price_difference_aud > 0),
  constraint trip_extension_quotes_note_nonempty check (length(trim(quote_note)) > 0),
  constraint trip_extension_quotes_status_chk
    check (status in ('pending', 'paid', 'expired', 'cancelled'))
);

create unique index if not exists trip_extension_quotes_token_uidx
  on public.trip_extension_quotes (quote_token);

create index if not exists trip_extension_quotes_booking_idx
  on public.trip_extension_quotes (booking_id, created_at desc);

create index if not exists trip_extension_quotes_pending_deadline_idx
  on public.trip_extension_quotes (payment_deadline)
  where status = 'pending';

comment on table public.trip_extension_quotes is
  'Staff-issued written quote for extra trip days. Pay full amount by payment_deadline (default departure-10). Cron expires pending rows; expired quotes do not touch the booking.';

comment on column public.trip_extension_quotes.quote_token is
  'Cryptographically random opaque token for /quote/:token. Never equal to booking_reference.';

comment on column public.trip_extension_quotes.payment_deadline is
  'Last calendar day (Australia/Sydney) the customer may pay. Default = departure_date - 10 days; staff may override.';

alter table public.trip_extension_quotes enable row level security;
revoke all on public.trip_extension_quotes from anon, authenticated;

-- Traceability on the installment ledger (one paid row per quote)
alter table public.booking_payments
  add column if not exists extension_quote_id uuid null
  references public.trip_extension_quotes (id) on delete set null;

create unique index if not exists booking_payments_extension_quote_uidx
  on public.booking_payments (extension_quote_id)
  where extension_quote_id is not null;

-- ----------------------------------------------------------------------------
-- 3. expire_pending_extension_quotes — cron-daily + lazy on public lookup
--    Does NOT modify tour_bookings.
-- ----------------------------------------------------------------------------
create or replace function public.expire_pending_extension_quotes()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date;
  v_count integer := 0;
begin
  v_today := (timezone('Australia/Sydney', now()))::date;

  update public.trip_extension_quotes
  set status = 'expired'
  where status = 'pending'
    and payment_deadline < v_today;

  get diagnostics v_count = row_count;

  return json_build_object('ok', true, 'expired', v_count, 'today', v_today::text);
end;
$$;

revoke all on function public.expire_pending_extension_quotes() from public;
grant execute on function public.expire_pending_extension_quotes() to service_role;

comment on function public.expire_pending_extension_quotes() is
  'Marks pending quotes past payment_deadline (Sydney date) as expired. Never updates tour_bookings.';

-- ----------------------------------------------------------------------------
-- 4. apply_extension_quote_payment — Square / staff PayID, one transaction
-- ----------------------------------------------------------------------------
create or replace function public.apply_extension_quote_payment(
  p_quote_id uuid,
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
  v_quote public.trip_extension_quotes%rowtype;
  v_booking public.tour_bookings%rowtype;
  v_method text;
  v_amount numeric;
  v_today date;
  v_existing_id uuid;
  v_installment_no integer;
  v_invoice text;
  v_label text;
  v_new_extra integer;
  v_new_paid numeric;
begin
  v_method := nullif(trim(coalesce(p_payment_method, '')), '');
  if v_method is null then
    v_method := 'square';
  end if;

  if p_quote_id is null or coalesce(p_payment_id, '') = '' then
    return json_build_object('ok', false, 'error', 'invalid_params');
  end if;

  v_amount := round(p_amount_cents::numeric) / 100.0;
  if v_amount is null or v_amount <= 0 then
    return json_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  v_today := (timezone('Australia/Sydney', now()))::date;

  -- Expire first so a same-day race cannot pay an overdue quote.
  update public.trip_extension_quotes
  set status = 'expired'
  where id = p_quote_id
    and status = 'pending'
    and payment_deadline < v_today;

  select * into v_quote
  from public.trip_extension_quotes
  where id = p_quote_id
  for update;

  if not found then
    return json_build_object('ok', false, 'error', 'quote_not_found');
  end if;

  select id into v_existing_id
  from public.booking_payments
  where external_payment_id = p_payment_id
     or extension_quote_id = p_quote_id
  limit 1;

  if v_quote.status = 'paid' then
    return json_build_object(
      'ok', true,
      'skipped', true,
      'quote_id', v_quote.id,
      'status', 'paid'
    );
  end if;

  if v_quote.status = 'expired' then
    return json_build_object('ok', false, 'error', 'quote_expired');
  end if;

  if v_quote.status <> 'pending' then
    return json_build_object('ok', false, 'error', 'quote_not_payable', 'status', v_quote.status);
  end if;

  if v_quote.payment_deadline < v_today then
    update public.trip_extension_quotes
    set status = 'expired'
    where id = v_quote.id
      and status = 'pending';
    return json_build_object('ok', false, 'error', 'quote_expired');
  end if;

  if abs((v_quote.price_difference_aud * 100.0) - p_amount_cents::numeric) > 1 then
    return json_build_object(
      'ok', false,
      'error', 'amount_mismatch',
      'expected_cents', round(v_quote.price_difference_aud * 100.0)
    );
  end if;

  select * into v_booking
  from public.tour_bookings
  where id = v_quote.booking_id
  for update;

  if not found then
    return json_build_object('ok', false, 'error', 'booking_not_found');
  end if;

  if v_booking.cancelled_at is not null then
    return json_build_object('ok', false, 'error', 'booking_cancelled');
  end if;

  if v_existing_id is not null then
    update public.trip_extension_quotes
    set
      status = 'paid',
      paid_at = coalesce(paid_at, now()),
      payment_method = coalesce(payment_method, v_method)
    where id = v_quote.id
      and status = 'pending';
    return json_build_object('ok', true, 'skipped', true, 'quote_id', v_quote.id, 'status', 'paid');
  end if;

  v_new_extra := coalesce(v_booking.extra_days_paid, 0) + v_quote.extra_days;
  v_new_paid := coalesce(v_booking.amount_paid_aud, 0) + v_quote.price_difference_aud;

  update public.trip_extension_quotes
  set
    status = 'paid',
    paid_at = now(),
    payment_method = v_method
  where id = v_quote.id
    and status = 'pending';

  update public.tour_bookings
  set
    extra_days_paid = v_new_extra,
    amount_paid_aud = v_new_paid
  where id = v_booking.id;

  select count(*)::int into v_installment_no
  from public.booking_payments
  where booking_id = v_booking.id;
  v_installment_no := coalesce(v_installment_no, 0) + 1;
  v_invoice := 'T2T-INV-' || coalesce(v_booking.booking_reference, left(v_booking.id::text, 8)) || '-' || v_installment_no;
  v_label := 'Trip extension +' || v_quote.extra_days::text || ' day' || case when v_quote.extra_days = 1 then '' else 's' end;

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
    extension_quote_id
  ) values (
    v_booking.id,
    v_quote.price_difference_aud,
    v_method,
    v_installment_no,
    v_label,
    'paid',
    now(),
    v_invoice,
    p_payment_id,
    v_quote.id
  );

  return json_build_object(
    'ok', true,
    'quote_id', v_quote.id,
    'status', 'paid',
    'extra_days_paid', v_new_extra,
    'amount_paid_aud', v_new_paid
  );
end;
$$;

revoke all on function public.apply_extension_quote_payment(uuid, integer, text, text) from public;
grant execute on function public.apply_extension_quote_payment(uuid, integer, text, text) to service_role;

comment on function public.apply_extension_quote_payment(uuid, integer, text, text) is
  'Idempotent: mark quote paid, add extra_days_paid on the booking, insert booking_payments. Rejects expired quotes.';
