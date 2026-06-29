-- Run this in the Supabase SQL editor to set up the inventory table and storage.

create table if not exists public.hotwheels (
  id uuid primary key default gen_random_uuid(),
  car_name text not null,
  collection_name text,
  collection_number text,        -- e.g. "21/250" as printed on the card
  collection_index int,          -- 21 (parsed from collection_number)
  collection_total int,          -- 250 (parsed from collection_number)
  color text,
  is_gold boolean default false, -- "Treasure Hunt" gold-spectraflame variant
  notes text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists hotwheels_car_name_idx on public.hotwheels (lower(car_name));
create index if not exists hotwheels_collection_name_idx on public.hotwheels (lower(collection_name));

alter table public.hotwheels enable row level security;

-- Single-user app: allow all access via the service role key only (no public policy).
-- The Next.js API routes use the service role key server-side, bypassing RLS.

-- Storage bucket for the photos you take of each car.
insert into storage.buckets (id, name, public)
values ('hotwheels-photos', 'hotwheels-photos', true)
on conflict (id) do nothing;

create policy if not exists "public read access"
  on storage.objects for select
  using (bucket_id = 'hotwheels-photos');
