-- 002: per-day prices replace the seasons table.
-- Safe to run more than once. Run in the Neon SQL Editor BEFORE deploying the
-- code that uses it.
--
-- A row = the price for the night starting on that day, for the whole villa.
-- Days without a row show as "price on request".

create table if not exists day_prices (
  day         date primary key,
  price_eur   integer not null,
  updated_at  timestamptz not null default now(),
  constraint day_prices_price_ok check (price_eur > 0 and price_eur <= 100000)
);

-- The old "seasons" table is no longer used by the app. It is left in place so
-- nothing is lost; drop it later with:  drop table if exists seasons;
