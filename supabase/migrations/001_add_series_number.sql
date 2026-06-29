-- Run this if you already created the hotwheels table from an earlier version of schema.sql.
alter table public.hotwheels
  add column if not exists series_number text,
  add column if not exists series_index int,
  add column if not exists series_total int;
