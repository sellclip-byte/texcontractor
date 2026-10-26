-- Admin quick actions from the phone lookup: hide/restore listings, suspend/restore accounts,
-- block/unblock numbers, and send a warning or message that the user sees on their next visit.

create table if not exists public.texcontractor_user_notices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null check (kind in ('warning', 'message')),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  created_by uuid,
  read_at timestamptz
);
create index if not exists texcontractor_user_notices_user_idx on public.texcontractor_user_notices(user_id) where read_at is null;
alter table public.texcontractor_user_notices enable row level security;
revoke all on public.texcontractor_user_notices from anon, authenticated;

create or replace function public.texcontractor_my_notices() returns table (id uuid, kind text, body text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select n.id, n.kind, n.body, n.created_at from texcontractor_user_notices n
  where n.user_id = auth.uid() and n.read_at is null order by n.created_at limit 10;
$$;

create or replace function public.texcontractor_notice_read(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update texcontractor_user_notices set read_at = now() where id = p_id and user_id = auth.uid() and read_at is null;
$$;

create or replace function public.texcontractor_admin_send_notice(p_user uuid, p_kind text, p_body text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Admins only.'; end if;
  if p_user is null or not exists (select 1 from texcontractor_members where user_id = p_user) then raise exception 'Account not found.'; end if;
  insert into texcontractor_user_notices(user_id, kind, body, created_by) values (p_user, p_kind, btrim(p_body), auth.uid());
end $$;

create or replace function public.texcontractor_admin_listing_status(p_id uuid, p_status text) returns text
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Admins only.'; end if;
  if p_status not in ('approved', 'rejected', 'pending') then raise exception 'Unknown status.'; end if;
  update texcontractor_submissions set status = p_status, reviewed_at = now(), reviewed_by = auth.uid(), updated_at = now() where id = p_id;
  get diagnostics n = row_count;
  if n = 0 then
    update texcontractor_public_business_imports set review_status = p_status where id = p_id;
    get diagnostics n = row_count;
  end if;
  if n = 0 then raise exception 'Listing not found.'; end if;
  return p_status;
end $$;

create or replace function public.texcontractor_admin_member_status(p_user uuid, p_status text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Admins only.'; end if;
  if p_status not in ('active', 'blocked') then raise exception 'Unknown status.'; end if;
  if exists (select 1 from texcontractor_admins where user_id = p_user) then raise exception 'Admin accounts cannot be suspended.'; end if;
  update texcontractor_members set status = p_status,
    status_note = case when p_status = 'blocked' then 'Suspended by administrator' else null end,
    status_changed_at = now(), status_changed_by = auth.uid()
  where user_id = p_user;
  if not found then raise exception 'Account not found.'; end if;
  return p_status;
end $$;

create or replace function public.texcontractor_admin_block_phone(p_phone text, p_block boolean) returns boolean
language plpgsql security definer set search_path = public as $$
declare d text := right(regexp_replace(coalesce(p_phone,''), '\D', '', 'g'), 10);
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Admins only.'; end if;
  if length(d) <> 10 then raise exception 'Enter a full 10-digit number.'; end if;
  if p_block then
    insert into texcontractor_blocked_phones(phone_digits, reason) values (d, 'Blocked by admin') on conflict do nothing;
  else
    delete from texcontractor_blocked_phones where phone_digits = d;
  end if;
  return p_block;
end $$;

do $$ declare f text; begin
  foreach f in array array['texcontractor_admin_send_notice(uuid,text,text)','texcontractor_admin_listing_status(uuid,text)','texcontractor_admin_member_status(uuid,text)','texcontractor_admin_block_phone(text,boolean)','texcontractor_my_notices()','texcontractor_notice_read(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- Lookup now also tells whether a listing owner can receive notices and their account status.
create or replace function public.texcontractor_admin_phone_lookup(p_phone text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare d text := right(regexp_replace(coalesce(p_phone,''), '\D', '', 'g'), 10);
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Admins only.'; end if;
  if length(d) < 7 then raise exception 'Enter at least 7 digits.'; end if;
  return jsonb_build_object(
    'digits', d,
    'technicians', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.display_name, 'real_name', s.real_name, 'email', s.email, 'phone', s.phone,
        'service', s.service, 'city', s.city, 'state', s.state, 'status', s.status, 'created_at', s.created_at, 'owner_id', s.owner_id,
        'owner_is_admin', exists(select 1 from texcontractor_admins a where a.user_id = s.owner_id)) order by s.created_at desc)
      from texcontractor_submissions s where texcontractor_phone_digits(s.phone) like '%' || d), '[]'::jsonb),
    'imported', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'name', i.business_name, 'phone', i.phone, 'service', i.service, 'city', i.city,
        'state', i.state, 'status', i.review_status, 'website', i.website))
      from (select * from texcontractor_public_business_imports where regexp_replace(coalesce(phone,''), '\D', '', 'g') like '%' || d limit 20) i), '[]'::jsonb),
    'accounts', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'name', m.display_name, 'email', m.email, 'status', m.status,
        'created_at', m.created_at, 'last_sign_in_at', m.last_sign_in_at,
        'is_admin', exists(select 1 from texcontractor_admins a where a.user_id = m.user_id),
        'requests', (select count(*) from texcontractor_requests r where r.customer_id = m.user_id),
        'chats', (select count(*) from texcontractor_chats c where m.user_id in (c.customer_id, c.technician_id)),
        'listings', (select count(*) from texcontractor_submissions s2 where s2.owner_id = m.user_id)))
      from texcontractor_account_phones ap join texcontractor_members m on m.user_id = ap.user_id where ap.phone_digits like '%' || d), '[]'::jsonb),
    'requests', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'title', r.title, 'service', r.service, 'city', r.city, 'status', r.status,
        'created_at', r.created_at, 'customer_id', r.customer_id,
        'customer', (select coalesce(m.display_name, m.email) from texcontractor_members m where m.user_id = r.customer_id)) order by r.created_at desc)
      from texcontractor_requests r where regexp_replace(coalesce(r.phone,''), '\D', '', 'g') like '%' || d), '[]'::jsonb),
    'removals', coalesce((select jsonb_agg(jsonb_build_object('status', n.status, 'contact', n.contact, 'created_at', n.created_at, 'resolved_at', n.resolved_at))
      from texcontractor_number_removals n where n.phone_digits like '%' || d), '[]'::jsonb),
    'blocked', exists(select 1 from texcontractor_blocked_phones b where b.phone_digits like '%' || d)
  );
end $$;
