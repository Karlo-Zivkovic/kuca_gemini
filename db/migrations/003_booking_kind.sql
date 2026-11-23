-- 003: a booking row can also be a closed period ("Nedostupno"): the owners block
-- dates without a guest (family use, renovation, off-season).
-- Safe to run more than once. Run in the Neon SQL Editor BEFORE deploying the
-- code that uses it.
--
-- kind = 'booking' (a guest stay) or 'blocked' (closed). The public calendar shows
-- both as unavailable; only the admin tells them apart.

alter table bookings add column if not exists kind text not null default 'booking';
alter table bookings drop constraint if exists bookings_kind_ok;
alter table bookings add constraint bookings_kind_ok check (kind in ('booking', 'blocked'));
