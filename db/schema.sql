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

create index if not exists bookings_check_in_idx on bookings (check_in);

create table if not exists seasons (
  id          uuid primary key default gen_random_uuid(),
  starts_on   date not null,
  ends_on     date not null,
  price_eur   integer,               -- null = "price on request"
  min_nights  integer not null default 7,
  created_at  timestamptz not null default now(),
  constraint seasons_dates_ok check (ends_on >= starts_on),
  constraint seasons_price_ok check (price_eur is null or price_eur > 0),
  constraint seasons_min_ok check (min_nights between 1 and 60)
);

