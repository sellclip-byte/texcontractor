-- TexContractor customer <-> technician chat (Craigslist-style: phone numbers stay private).
-- Safe to run more than once. Adds new tables/functions only; changes no existing data.
create table if not exists public.texcontractor_chats (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.texcontractor_submissions(id) on delete cascade,
  technician_id uuid not null,
  customer_id uuid not null,
  service text,
  technician_name text,
  customer_name text,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (service_id, customer_id),
  check (technician_id <> customer_id)
);
create table if not exists public.texcontractor_chat_messages (
  id bigint generated always as identity primary key,
  chat_id uuid not null references public.texcontractor_chats(id) on delete cascade,
  sender_id uuid not null default auth.uid(),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists texcontractor_chat_messages_chat_idx on public.texcontractor_chat_messages(chat_id, id);
create index if not exists texcontractor_chats_tech_idx on public.texcontractor_chats(technician_id);
create index if not exists texcontractor_chats_cust_idx on public.texcontractor_chats(customer_id);
alter table public.texcontractor_chats enable row level security;
alter table public.texcontractor_chat_messages enable row level security;
drop policy if exists "chat participants read chats" on public.texcontractor_chats;
create policy "chat participants read chats" on public.texcontractor_chats
  for select to authenticated using (auth.uid() in (technician_id, customer_id));
drop policy if exists "chat participants read messages" on public.texcontractor_chat_messages;
create policy "chat participants read messages" on public.texcontractor_chat_messages
  for select to authenticated using (exists (select 1 from public.texcontractor_chats c where c.id = chat_id and auth.uid() in (c.technician_id, c.customer_id)));
drop policy if exists "chat participants send messages" on public.texcontractor_chat_messages;
create policy "chat participants send messages" on public.texcontractor_chat_messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (select 1 from public.texcontractor_chats c where c.id = chat_id and auth.uid() in (c.technician_id, c.customer_id))
    and coalesce((select status from public.texcontractor_members m where m.user_id = auth.uid()), 'active') <> 'blocked'
  );

-- Start (or reopen) a chat with the technician who owns a published service.
-- Listings owned by the site admin account are not chat-enabled (messages would reach the admin, not the technician).
create or replace function public.texcontractor_start_chat(p_service_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_service text; v_name text; v_chat uuid; v_me uuid := auth.uid(); v_my_name text;
begin
  if v_me is null then raise exception 'Please sign in to send a message.'; end if;
  select s.owner_id, s.service, s.display_name into v_owner, v_service, v_name
    from texcontractor_submissions s where s.id = p_service_id and s.status = 'approved';
  if v_owner is null then raise exception 'This profile is not available for messages.'; end if;
  if exists (select 1 from texcontractor_admins a where a.user_id = v_owner) then raise exception 'This provider does not receive messages on TexContractor yet.'; end if;
  if v_owner = v_me then raise exception 'This is your own profile.'; end if;
  select coalesce(nullif(m.display_name,''), split_part(m.email,'@',1)) into v_my_name from texcontractor_members m where m.user_id = v_me;
  insert into texcontractor_chats(service_id, technician_id, customer_id, service, technician_name, customer_name)
    values (p_service_id, v_owner, v_me, v_service, v_name, coalesce(v_my_name, 'Customer'))
    on conflict (service_id, customer_id) do update set service = excluded.service
    returning id into v_chat;
  return v_chat;
end $$;
revoke all on function public.texcontractor_start_chat(uuid) from public, anon;
grant execute on function public.texcontractor_start_chat(uuid) to authenticated;

-- Published services whose owner is a real technician account (the Chat button shows only for these).
create or replace function public.texcontractor_chat_service_ids()
returns uuid[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(s.id), '{}') from texcontractor_submissions s
  where s.status = 'approved' and not exists (select 1 from texcontractor_admins a where a.user_id = s.owner_id);
$$;
grant execute on function public.texcontractor_chat_service_ids() to anon, authenticated;

create or replace function public.texcontractor_chat_touch() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update texcontractor_chats set last_message = left(new.body, 140), last_message_at = new.created_at where id = new.chat_id;
  return new;
end $$;
drop trigger if exists texcontractor_chat_touch on public.texcontractor_chat_messages;
create trigger texcontractor_chat_touch after insert on public.texcontractor_chat_messages for each row execute function public.texcontractor_chat_touch();

create or replace function public.texcontractor_chat_mark_read(p_chat_id uuid)
returns void language sql security definer set search_path = public as $$
  update texcontractor_chat_messages m set read_at = now()
  where m.chat_id = p_chat_id and m.read_at is null and m.sender_id <> auth.uid()
    and exists (select 1 from texcontractor_chats c where c.id = p_chat_id and auth.uid() in (c.technician_id, c.customer_id));
$$;
grant execute on function public.texcontractor_chat_mark_read(uuid) to authenticated;

-- Red badge: unread messages for the signed-in member.
create or replace function public.texcontractor_chat_unread()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from texcontractor_chat_messages m join texcontractor_chats c on c.id = m.chat_id
  where auth.uid() in (c.technician_id, c.customer_id) and m.sender_id <> auth.uid() and m.read_at is null;
$$;
grant execute on function public.texcontractor_chat_unread() to authenticated;

grant select on public.texcontractor_chats to authenticated;
grant select, insert on public.texcontractor_chat_messages to authenticated;
select 'TexContractor chat is ready' as result;
