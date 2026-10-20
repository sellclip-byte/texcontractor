-- Independent About & Media page. Existing listings and settings are unchanged.
create table public.texcontractor_showcase (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('story','image','video','testimonial')),
 title text not null check (length(title) between 1 and 160),
 body text not null default '' check (length(body)<=6000),
 media_url text not null default '' check (media_url='' or media_url ~ '^https://'),
 attribution text not null default '' check (length(attribution)<=180),
 verified boolean not null default false,
 consent boolean not null default false,
 published boolean not null default false,
 sort_order integer not null default 0 check (sort_order between 0 and 99999),
 created_at timestamptz not null default now(),
 check (not published or kind not in ('image','video') or media_url<>''),
 check (not published or kind<>'testimonial' or (verified and consent and length(body)>0 and length(attribution)>0))
);
alter table public.texcontractor_showcase enable row level security;
grant select on public.texcontractor_showcase to anon,authenticated;
grant insert,update,delete on public.texcontractor_showcase to authenticated;
create policy showcase_public_read on public.texcontractor_showcase for select to anon,authenticated using (published and (kind<>'testimonial' or (verified and consent)));
create policy showcase_admin_all on public.texcontractor_showcase for all to authenticated using (exists(select 1 from public.texcontractor_admins where user_id=(select auth.uid()))) with check (exists(select 1 from public.texcontractor_admins where user_id=(select auth.uid())));
create index showcase_published_order on public.texcontractor_showcase (sort_order,created_at) where published;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('texcontractor-showcase','texcontractor-showcase',true,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']);
create policy showcase_media_admin on storage.objects for all to authenticated using (bucket_id='texcontractor-showcase' and exists(select 1 from public.texcontractor_admins where user_id=(select auth.uid()))) with check (bucket_id='texcontractor-showcase' and exists(select 1 from public.texcontractor_admins where user_id=(select auth.uid())));
-- Public bucket delivery requires no public listing or write permissions.
