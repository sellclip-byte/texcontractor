-- TexContractor: Customer Requests board.
-- Customers post a job (up to 4 photos) and choose how technicians may contact them (chat / text / call).
-- Technicians with an approved listing in the same service + state send an offer, which arrives as a chat message.
-- Phone numbers are never readable from the table directly; they are returned only by the functions below,
-- only to signed-in technicians, only when the customer allowed Text or Call, and only while the request is open.
-- Safe to run more than once.

create table if not exists public.texcontractor_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null default auth.uid(),
  service text not null check (char_length(service) between 2 and 120),
  state text not null check (state ~ '^[A-Z]{2}$'),
  city text not null check (char_length(city) between 2 and 80),
  title text not null check (char_length(btrim(title)) between 3 and 120),
  body text not null check (char_length(btrim(body)) between 10 and 2000),
  photo_paths jsonb not null default '[]'::jsonb check (jsonb_typeof(photo_paths) = 'array' and jsonb_array_length(photo_paths) <= 4),
  contact_chat boolean not null default true,
  contact_text boolean not null default false,
  contact_call boolean not null default false,
  phone text,
  status text not null default 'open' check (status in ('open','closed')),
  offers_count int not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  closed_at timestamptz,
  constraint texcontractor_requests_contact_check check (contact_chat or contact_text or contact_call),
  constraint texcontractor_requests_phone_check check (not (contact_text or contact_call) or (phone is not null and phone ~ '^\+?[0-9]{10,15}$'))
);
create index if not exists texcontractor_requests_open_idx on public.texcontractor_requests (created_at desc) where status = 'open';
create index if not exists texcontractor_requests_customer_idx on public.texcontractor_requests (customer_id, created_at desc);

create table if not exists public.texcontractor_request_offers (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.texcontractor_requests(id) on delete cascade,
  technician_id uuid not null,
  service_id uuid not null references public.texcontractor_submissions(id) on delete cascade,
  chat_id uuid not null references public.texcontractor_chats(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id, technician_id)
);

-- No direct table access at all: everything goes through the functions below.
alter table public.texcontractor_requests enable row level security;
alter table public.texcontractor_request_offers enable row level security;
revoke all on public.texcontractor_requests, public.texcontractor_request_offers from anon, authenticated;

-- A "technician" = signed-in owner of an approved listing (not one of the site's admin-imported listings).
create or replace function public.texcontractor_is_technician(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_user is not null and exists (
    select 1 from texcontractor_submissions s
    where s.owner_id = p_user and s.status = 'approved'
      and not exists (select 1 from texcontractor_admins a where a.user_id = s.owner_id));
$$;

-- Public board (newest first; for a technician, requests matching his service + state first).
create or replace function public.texcontractor_requests_list(
  p_service text default null, p_state text default null, p_city text default null,
  p_limit int default 24, p_offset int default 0)
returns table (id uuid, service text, state text, city text, title text, body text, photo_paths jsonb,
  contact_chat boolean, contact_text boolean, contact_call boolean, phone text, offers_count int,
  created_at timestamptz, matches boolean, mine boolean, offered boolean)
language sql stable security definer set search_path = public as $$
  with me as (select auth.uid() as uid, texcontractor_is_technician(auth.uid()) as tech)
  select r.id, r.service, r.state, r.city, r.title, r.body, r.photo_paths,
    r.contact_chat, r.contact_text, r.contact_call,
    case when me.tech and (r.contact_text or r.contact_call) then r.phone end,
    r.offers_count, r.created_at,
    coalesce(me.tech and exists (select 1 from texcontractor_submissions s where s.owner_id = me.uid and s.status = 'approved'
      and s.service = r.service and s.state = r.state), false),
    coalesce(r.customer_id = me.uid, false),
    exists (select 1 from texcontractor_request_offers o where o.request_id = r.id and o.technician_id = me.uid)
  from texcontractor_requests r cross join me
  where r.status = 'open' and r.expires_at > now() and r.offers_count < 5
    and (coalesce(p_service, '') = '' or r.service = p_service)
    and (coalesce(p_state, '') = '' or r.state = p_state)
    and (coalesce(p_city, '') = '' or lower(r.city) = lower(p_city))
  order by 14 desc, r.created_at desc
  limit least(greatest(coalesce(p_limit, 24), 1), 60) offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.texcontractor_requests_open_count() returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from texcontractor_requests where status = 'open' and expires_at > now() and offers_count < 5;
$$;

-- Customer posts a request.
create or replace function public.texcontractor_request_create(
  p_service text, p_state text, p_city text, p_title text, p_body text, p_photo_paths jsonb,
  p_contact_chat boolean, p_contact_text boolean, p_contact_call boolean, p_phone text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_me uuid := auth.uid(); v_id uuid; v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g'), '');
begin
  if v_me is null then raise exception 'Please sign in to post a request.'; end if;
  if coalesce((select m.status from texcontractor_members m where m.user_id = v_me), 'active') = 'blocked' then raise exception 'This account cannot post requests.'; end if;
  if (select count(*) from texcontractor_requests where customer_id = v_me and status = 'open' and expires_at > now()) >= 3 then
    raise exception 'You already have 3 open requests. Close one before posting a new one.'; end if;
  if (select count(*) from texcontractor_requests where customer_id = v_me and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Too many requests today. Please try again tomorrow.'; end if;
  if exists (select 1 from jsonb_array_elements_text(coalesce(p_photo_paths, '[]'::jsonb)) p
             where p !~ ('^' || v_me::text || '/[A-Za-z0-9._-]{1,80}$')) then raise exception 'Invalid photo.'; end if;
  if v_phone is not null and v_phone !~ '^\+' and char_length(v_phone) = 10 then v_phone := '+1' || v_phone; end if;
  insert into texcontractor_requests (customer_id, service, state, city, title, body, photo_paths, contact_chat, contact_text, contact_call, phone)
  values (v_me, btrim(p_service), upper(btrim(p_state)), btrim(p_city), btrim(p_title), btrim(p_body), coalesce(p_photo_paths, '[]'::jsonb),
          coalesce(p_contact_chat, true), coalesce(p_contact_text, false), coalesce(p_contact_call, false),
          case when coalesce(p_contact_text, false) or coalesce(p_contact_call, false) then v_phone end)
  returning id into v_id;
  return v_id;
end $$;

-- Customer's own requests (open first).
create or replace function public.texcontractor_my_requests()
returns table (id uuid, service text, state text, city text, title text, status text, offers_count int,
  created_at timestamptz, expires_at timestamptz, unread int)
language sql stable security definer set search_path = public as $$
  select r.id, r.service, r.state, r.city, r.title,
    case when r.status = 'open' and r.expires_at <= now() then 'closed' else r.status end,
    r.offers_count, r.created_at, r.expires_at,
    (select count(*)::int from texcontractor_request_offers o join texcontractor_chat_messages m on m.chat_id = o.chat_id
      where o.request_id = r.id and m.sender_id <> auth.uid() and m.read_at is null)
  from texcontractor_requests r where r.customer_id = auth.uid()
  order by (r.status = 'open' and r.expires_at > now()) desc, r.created_at desc limit 30;
$$;

-- Customer closes a request (phone is erased).
create or replace function public.texcontractor_request_close(p_request_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update texcontractor_requests set status = 'closed', closed_at = now(), phone = null,
    contact_text = false, contact_call = false, contact_chat = true
  where id = p_request_id and customer_id = auth.uid();
  if not found then raise exception 'Request not found.'; end if;
end $$;

-- Technician sends an offer: opens (or reuses) the chat with the customer and posts the offer as the first message.
create or replace function public.texcontractor_request_offer(p_request_id uuid, p_message text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := auth.uid(); r texcontractor_requests; v_sub texcontractor_submissions; v_chat uuid; v_cust_name text;
begin
  if v_me is null then raise exception 'Please sign in to send an offer.'; end if;
  if coalesce((select m.status from texcontractor_members m where m.user_id = v_me), 'active') = 'blocked' then raise exception 'This account cannot send offers.'; end if;
  if char_length(btrim(coalesce(p_message, ''))) < 5 or char_length(p_message) > 1500 then raise exception 'Write a short offer (5 to 1500 characters).'; end if;
  select * into r from texcontractor_requests where id = p_request_id for update;
  if r.id is null or r.status <> 'open' or r.expires_at <= now() then raise exception 'This request is closed.'; end if;
  if r.customer_id = v_me then raise exception 'This is your own request.'; end if;
  if r.offers_count >= 5 then raise exception 'This request already has 5 offers.'; end if;
  if exists (select 1 from texcontractor_request_offers where request_id = r.id and technician_id = v_me) then raise exception 'You already sent an offer for this request.'; end if;
  select s.* into v_sub from texcontractor_submissions s
   where s.owner_id = v_me and s.status = 'approved' and s.service = r.service and s.state = r.state
     and not exists (select 1 from texcontractor_admins a where a.user_id = s.owner_id)
   order by (lower(s.city) = lower(r.city)) desc, s.created_at limit 1;
  if v_sub.id is null then raise exception 'Only technicians with a % listing in % can send offers for this request.', r.service, r.state; end if;
  select coalesce(nullif(m.display_name, ''), 'Customer') into v_cust_name from texcontractor_members m where m.user_id = r.customer_id;
  insert into texcontractor_chats (service_id, technician_id, customer_id, service, technician_name, customer_name)
  values (v_sub.id, v_me, r.customer_id, v_sub.service, v_sub.display_name, coalesce(v_cust_name, 'Customer'))
  on conflict (service_id, customer_id) do update set service = excluded.service
  returning id into v_chat;
  insert into texcontractor_chat_messages (chat_id, sender_id, body)
  values (v_chat, v_me, left('Offer for your request "' || r.title || '" (' || r.city || ', ' || r.state || '):' || chr(10) || btrim(p_message), 2000));
  insert into texcontractor_request_offers (request_id, technician_id, service_id, chat_id) values (r.id, v_me, v_sub.id, v_chat);
  update texcontractor_requests set offers_count = offers_count + 1 where id = r.id;
  return v_chat;
end $$;

-- Tells the page what the Send an offer button should do for the current visitor.
create or replace function public.texcontractor_request_offer_check(p_request_id uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare v_me uuid := auth.uid(); r texcontractor_requests;
begin
  select * into r from texcontractor_requests where id = p_request_id;
  if r.id is null or r.status <> 'open' or r.expires_at <= now() or r.offers_count >= 5 then return 'closed'; end if;
  if v_me is null then return 'signin'; end if;
  if r.customer_id = v_me then return 'own'; end if;
  if exists (select 1 from texcontractor_request_offers where request_id = r.id and technician_id = v_me) then return 'sent'; end if;
  if not exists (select 1 from texcontractor_submissions s where s.owner_id = v_me and s.status = 'approved' and s.service = r.service and s.state = r.state
                 and not exists (select 1 from texcontractor_admins a where a.user_id = s.owner_id)) then return 'no_listing'; end if;
  return 'ok';
end $$;

revoke all on function public.texcontractor_request_create(text,text,text,text,text,jsonb,boolean,boolean,boolean,text),
  public.texcontractor_my_requests(), public.texcontractor_request_close(uuid), public.texcontractor_request_offer(uuid,text),
  public.texcontractor_is_technician(uuid) from public, anon;
grant execute on function public.texcontractor_requests_list(text,text,text,int,int), public.texcontractor_requests_open_count(),
  public.texcontractor_request_offer_check(uuid) to anon, authenticated;
grant execute on function public.texcontractor_request_create(text,text,text,text,text,jsonb,boolean,boolean,boolean,text),
  public.texcontractor_my_requests(), public.texcontractor_request_close(uuid), public.texcontractor_request_offer(uuid,text) to authenticated;

-- Request photos: public bucket (requests are public), images only, 8 MB; users upload only into their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('texcontractor-requests', 'texcontractor-requests', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "request photos upload own folder" on storage.objects;
create policy "request photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'texcontractor-requests' and (storage.foldername(name))[1] = auth.uid()::text);

select 'Customer requests are ready' as result;
