-- TexContractor chat: allow photos in messages (up to 6 per message).
-- Photos live in a PRIVATE storage bucket; only the two people in the chat can upload or view them.
-- Safe to run more than once.
alter table public.texcontractor_chat_messages add column if not exists photo_paths jsonb not null default '[]'::jsonb;
alter table public.texcontractor_chat_messages alter column body set default '';
alter table public.texcontractor_chat_messages drop constraint if exists texcontractor_chat_messages_body_check;
alter table public.texcontractor_chat_messages drop constraint if exists texcontractor_chat_messages_content_check;
alter table public.texcontractor_chat_messages add constraint texcontractor_chat_messages_content_check check (
  char_length(body) <= 2000
  and jsonb_typeof(photo_paths) = 'array'
  and jsonb_array_length(photo_paths) <= 6
  and (char_length(btrim(body)) >= 1 or jsonb_array_length(photo_paths) >= 1)
);

-- Every photo path must be inside this chat's own folder: <chat_id>/<file>.
create or replace function public.texcontractor_chat_photo_paths_ok() returns trigger language plpgsql as $$
begin
  if exists (select 1 from jsonb_array_elements_text(new.photo_paths) p where split_part(p, '/', 1) <> new.chat_id::text or p !~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,80}$') then
    raise exception 'Invalid photo.';
  end if;
  return new;
end $$;
drop trigger if exists texcontractor_chat_photo_paths_ok on public.texcontractor_chat_messages;
create trigger texcontractor_chat_photo_paths_ok before insert on public.texcontractor_chat_messages for each row execute function public.texcontractor_chat_photo_paths_ok();

-- Chat list preview text for photo-only messages.
create or replace function public.texcontractor_chat_touch() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update texcontractor_chats set
    last_message = case when char_length(btrim(new.body)) > 0 then left(new.body, 140)
                        when jsonb_array_length(new.photo_paths) = 1 then '📷 Photo'
                        else '📷 ' || jsonb_array_length(new.photo_paths) || ' photos' end,
    last_message_at = new.created_at
  where id = new.chat_id;
  return new;
end $$;

-- Private bucket: images only, 8 MB each.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('texcontractor-chat', 'texcontractor-chat', false, 8388608, array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.texcontractor_chat_member(p_folder text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from texcontractor_chats c where c.id::text = p_folder and auth.uid() in (c.technician_id, c.customer_id));
$$;
grant execute on function public.texcontractor_chat_member(text) to authenticated;

drop policy if exists "chat members upload photos" on storage.objects;
create policy "chat members upload photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'texcontractor-chat' and public.texcontractor_chat_member((storage.foldername(name))[1]));
drop policy if exists "chat members view photos" on storage.objects;
create policy "chat members view photos" on storage.objects for select to authenticated
  using (bucket_id = 'texcontractor-chat' and public.texcontractor_chat_member((storage.foldername(name))[1]));

select 'Chat photos are ready' as result;
