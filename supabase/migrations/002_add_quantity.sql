-- Run this in the Supabase SQL editor after 001_add_series_number.sql.

alter table public.hotwheels
  add column if not exists quantity int not null default 1;
