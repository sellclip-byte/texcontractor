-- TexContractor proposed schema, NOT applied to any Supabase project.
-- This migration is intentionally staged for review.
-- Existing Supabase project rryehtaskbjnfbodymjj belongs to an unrelated
-- project (am-offer-net) and must not be repurposed.
create table if not exists public.texcontractor_providers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  service text not null check (char_length(trim(service)) between 2 and 120),
  business_name text not null check (char_length(trim(business_name)) between 2 and 160),
  city text not null,
  state text not null,
  phone text,
  description text not null default '',
  profile_photo_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.texcontractor_work_photos (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.texcontractor_providers(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique(provider_id, storage_path)
);
create index if not exists texcontractor_providers_service_city_idx
  on public.texcontractor_providers (service, state, city)
  where status = 'approved';
create index if not exists texcontractor_work_photos_provider_idx
  on public.texcontractor_work_photos (provider_id, sort_order);
alter table public.texcontractor_providers enable row level security;
alter table public.texcontractor_work_photos enable row level security;
create policy "Public sees approved providers" on public.texcontractor_providers
  for select to anon, authenticated using (status = 'approved');
create policy "Owners see own providers" on public.texcontractor_providers
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners create pending providers" on public.texcontractor_providers
  for insert to authenticated with check (owner_id = (select auth.uid()) and status = 'pending');
create policy "Owners see own work photos" on public.texcontractor_work_photos
  for select to authenticated using (exists (
    select 1 from public.texcontractor_providers p
    where p.id = provider_id and p.owner_id = (select auth.uid())
  ));
create policy "Public sees approved provider photos" on public.texcontractor_work_photos
  for select to anon, authenticated using (exists (
    select 1 from public.texcontractor_providers p
    where p.id = provider_id and p.status = 'approved'
  ));
-- Photo upload, update, admin approval, storage buckets and admin RLS
-- intentionally excluded until dedicated TexContractor project and roles exist.
