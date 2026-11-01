-- Villa Gemini database schema (plain Postgres; hosted on Neon via Vercel).
-- Run once in the Neon SQL editor (or: psql "$DATABASE_URL" -f db/schema.sql).

create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  check_in    date not null,
  check_out   date not null,
  note        text not null default '',
  created_at  timestamptz not null default now(),
  constraint bookings_dates_ok check (check_out > check_in)
);

-- Optional guest details (see db/migrations/001_booking_guest_details.sql).
alter table bookings add column if not exists guest_name    text    not null default '';
alter table bookings add column if not exists guest_country text    not null default '';
alter table bookings add column if not exists source        text    not null default '';
alter table bookings add column if not exists guests        integer;
alter table bookings add column if not exists phone         text    not null default '';
alter table bookings drop constraint if exists bookings_guests_ok;
alter table bookings add constraint bookings_guests_ok check (guests is null or guests between 1 and 50);

create index if not exists bookings_check_in_idx on bookings (check_in);

-- Price per night for the whole villa; days without a row are "price on request".
create table if not exists day_prices (
  day         date primary key,
  price_eur   integer not null,
  updated_at  timestamptz not null default now(),
  constraint day_prices_price_ok check (price_eur > 0 and price_eur <= 100000)
);

