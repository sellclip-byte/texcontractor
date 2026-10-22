-- TexContractor Customer Requests: open one request (view) and let the customer edit his own open request.
-- Safe to run more than once.

-- One request: anyone can open an open request; the owner can also open his closed ones.
-- Phone rules are the same as the board: only signed-in technicians, only if the customer allowed Text or Call.
create or replace function public.texcontractor_request_get(p_request_id uuid)
returns table (id uuid, service text, state text, city text, title text, body text, photo_paths jsonb,
  contact_chat boolean, contact_text boolean, contact_call boolean, phone text, offers_count int,
  created_at timestamptz, matches boolean, mine boolean, offered boolean, status text, expires_at timestamptz)
language sql stable security definer set search_path = public as $$
  with me as (select auth.uid() as uid, texcontractor_is_technician(auth.uid()) as tech)
  select r.id, r.service, r.state, r.city, r.title, r.body, r.photo_paths,
    r.contact_chat, r.contact_text, r.contact_call,
    case when r.customer_id = me.uid then r.phone
         when me.tech and r.status = 'open' and (r.contact_text or r.contact_call) then r.phone end,
    r.offers_count, r.created_at,
    coalesce(me.tech and exists (select 1 from texcontractor_submissions s where s.owner_id = me.uid and s.status = 'approved'
      and s.service = r.service and s.state = r.state), false),
    coalesce(r.customer_id = me.uid, false),
    exists (select 1 from texcontractor_request_offers o where o.request_id = r.id and o.technician_id = me.uid),
    case when r.status = 'open' and r.expires_at <= now() then 'closed' else r.status end,
    r.expires_at
  from texcontractor_requests r cross join me
  where r.id = p_request_id
    and ((r.status = 'open' and r.expires_at > now()) or r.customer_id = me.uid);
$$;

-- Customer edits his own open request.
create or replace function public.texcontractor_request_update(
  p_request_id uuid, p_service text, p_state text, p_city text, p_title text, p_body text, p_photo_paths jsonb,
  p_contact_chat boolean, p_contact_text boolean, p_contact_call boolean, p_phone text)
returns void language plpgsql security definer set search_path = public as $$
declare v_me uuid := auth.uid(); r texcontractor_requests; v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g'), '');
begin
  if v_me is null then raise exception 'Please sign in again.'; end if;
  select * into r from texcontractor_requests where id = p_request_id and customer_id = v_me for update;
  if r.id is null then raise exception 'Request not found.'; end if;
  if r.status <> 'open' or r.expires_at <= now() then raise exception 'This request is closed and cannot be edited.'; end if;
  if exists (select 1 from jsonb_array_elements_text(coalesce(p_photo_paths, '[]'::jsonb)) p
             where p !~ ('^' || v_me::text || '/[A-Za-z0-9._-]{1,80}$')) then raise exception 'Invalid photo.'; end if;
  if v_phone is not null and v_phone !~ '^\+' and char_length(v_phone) = 10 then v_phone := '+1' || v_phone; end if;
  -- Service and state stay fixed once technicians have sent offers (offers were matched to them).
  update texcontractor_requests set
    service = case when r.offers_count = 0 then btrim(p_service) else r.service end,
    state = case when r.offers_count = 0 then upper(btrim(p_state)) else r.state end,
    city = btrim(p_city), title = btrim(p_title), body = btrim(p_body), photo_paths = coalesce(p_photo_paths, '[]'::jsonb),
    contact_chat = coalesce(p_contact_chat, true), contact_text = coalesce(p_contact_text, false), contact_call = coalesce(p_contact_call, false),
    phone = case when coalesce(p_contact_text, false) or coalesce(p_contact_call, false) then v_phone end
  where id = r.id;
end $$;

-- Owner sees who sent offers on his request.
create or replace function public.texcontractor_request_offers_list(p_request_id uuid)
returns table (chat_id uuid, service_id uuid, technician_name text, service text, city text, state text,
  sent_at timestamptz, unread int, last_message text)
language sql stable security definer set search_path = public as $$
  select o.chat_id, o.service_id, coalesce(nullif(s.display_name, ''), 'Technician'), s.service, s.city, s.state, o.created_at,
    (select count(*)::int from texcontractor_chat_messages m where m.chat_id = o.chat_id and m.sender_id <> auth.uid() and m.read_at is null),
    c.last_message
  from texcontractor_request_offers o
  join texcontractor_requests r on r.id = o.request_id and r.customer_id = auth.uid()
  join texcontractor_submissions s on s.id = o.service_id
  join texcontractor_chats c on c.id = o.chat_id
  where o.request_id = p_request_id
  order by o.created_at;
$$;

revoke all on function public.texcontractor_request_update(uuid,text,text,text,text,text,jsonb,boolean,boolean,boolean,text) from public, anon;
grant execute on function public.texcontractor_request_get(uuid) to anon, authenticated;
revoke all on function public.texcontractor_request_offers_list(uuid) from public, anon;
grant execute on function public.texcontractor_request_offers_list(uuid) to authenticated;
grant execute on function public.texcontractor_request_update(uuid,text,text,text,text,text,jsonb,boolean,boolean,boolean,text) to authenticated;

select 'Request view and edit are ready' as result;
