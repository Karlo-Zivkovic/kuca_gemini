-- 001: optional guest details on bookings.
-- Safe to run more than once. Run in the Neon SQL Editor BEFORE deploying the
-- code that uses these columns.

alter table bookings add column if not exists guest_name    text    not null default '';
alter table bookings add column if not exists guest_country text    not null default '';
alter table bookings add column if not exists source        text    not null default '';
alter table bookings add column if not exists guests        integer;
alter table bookings add column if not exists phone         text    not null default '';

alter table bookings drop constraint if exists bookings_guests_ok;
alter table bookings add constraint bookings_guests_ok check (guests is null or guests between 1 and 50);
