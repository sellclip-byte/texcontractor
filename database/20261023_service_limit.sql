-- TexContractor: each technician may publish at most 2 services, never the same service twice.
-- Technicians can change the service of one of their listings, or delete it. The site admin has no limit.

create or replace function public.texcontractor_submission_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if texcontractor_is_site_admin(new.owner_id) then return new; end if;
  if exists (select 1 from texcontractor_submissions where owner_id = new.owner_id and lower(service) = lower(new.service)) then
    raise exception 'You already have a % listing. Choose a different service.', new.service;
  end if;
  if (select count(*) from texcontractor_submissions where owner_id = new.owner_id) >= 2 then
    raise exception 'You already have 2 services. Change or delete one of them to add another.';
  end if;
  return new;
end $$;

drop trigger if exists texcontractor_submission_limit on public.texcontractor_submissions;
create trigger texcontractor_submission_limit before insert on public.texcontractor_submissions
  for each row execute function public.texcontractor_submission_limit();

-- The technician's own listings (for the "My services" box).
create or replace function public.texcontractor_my_services()
returns table (id uuid, service text, city text, state text, display_name text, status text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select s.id, s.service, s.city, s.state, s.display_name, s.status, s.created_at
  from texcontractor_submissions s where s.owner_id = auth.uid() order by s.created_at;
$$;

-- Change the service of one of his listings (keeps photos, chats and everything else).
create or replace function public.texcontractor_my_service_change(p_id uuid, p_service text)
returns void language plpgsql security definer set search_path = public as $$
declare r texcontractor_submissions; v_new text := btrim(coalesce(p_service, ''));
begin
  if auth.uid() is null then raise exception 'Please sign in again.'; end if;
  select * into r from texcontractor_submissions where id = p_id and owner_id = auth.uid() for update;
  if r.id is null then raise exception 'Service not found.'; end if;
  if v_new = '' then raise exception 'Choose a service.'; end if;
  if lower(v_new) = lower(r.service) then return; end if;
  if exists (select 1 from texcontractor_submissions where owner_id = auth.uid() and id <> p_id and lower(service) = lower(v_new)) then
    raise exception 'You already have a % listing.', v_new;
  end if;
  update texcontractor_submissions set
    service = v_new,
    about = replace(about, 'directly for ' || r.service || ' in', 'directly for ' || v_new || ' in'),
    updated_at = now()
  where id = p_id;
end $$;

-- Delete one of his listings (photos list returned so the page can remove the files).
create or replace function public.texcontractor_my_service_delete(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r texcontractor_submissions;
begin
  if auth.uid() is null then raise exception 'Please sign in again.'; end if;
  select * into r from texcontractor_submissions where id = p_id and owner_id = auth.uid();
  if r.id is null then raise exception 'Service not found.'; end if;
  delete from texcontractor_submissions where id = p_id;
  return jsonb_build_object('paths',
    coalesce(to_jsonb(array_remove(array[r.profile_photo_path], null)), '[]'::jsonb)
    || case when jsonb_typeof(r.work_photo_paths) = 'array' then r.work_photo_paths else '[]'::jsonb end);
end $$;

revoke all on function public.texcontractor_my_services() from public, anon;
revoke all on function public.texcontractor_my_service_change(uuid, text) from public, anon;
revoke all on function public.texcontractor_my_service_delete(uuid) from public, anon;
grant execute on function public.texcontractor_my_services() to authenticated;
grant execute on function public.texcontractor_my_service_change(uuid, text) to authenticated;
grant execute on function public.texcontractor_my_service_delete(uuid) to authenticated;
