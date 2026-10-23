-- TexContractor admin: permanently delete a technician listing, or a member with all of his TexContractor data.
-- Only users in texcontractor_admins with role 'admin' can run these. Safe to run more than once.

create or replace function public.texcontractor_is_site_admin(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from texcontractor_admins a where a.user_id = p_user and a.role = 'admin');
$$;

-- Delete one technician listing (registered or imported). Chats, offers and reports on it are removed with it.
-- Returns the photo paths so the dashboard can remove the files from storage.
create or replace function public.texcontractor_admin_delete_listing(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s texcontractor_submissions; v_paths jsonb := '[]'::jsonb; v_n int;
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Only the site admin can delete.'; end if;
  select * into s from texcontractor_submissions where id = p_id;
  if s.id is not null then
    v_paths := coalesce(to_jsonb(array_remove(array[s.profile_photo_path], null)), '[]'::jsonb)
               || case when jsonb_typeof(to_jsonb(s.work_photo_paths)) = 'array' then to_jsonb(s.work_photo_paths) else '[]'::jsonb end;
    delete from texcontractor_submissions where id = p_id;
    return jsonb_build_object('deleted', 'listing', 'name', s.display_name, 'paths', v_paths);
  end if;
  delete from texcontractor_public_business_imports where id = p_id;
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'Listing not found.'; end if;
  return jsonb_build_object('deleted', 'imported', 'paths', '[]'::jsonb);
end $$;

-- Delete a member: his listings, chats, job requests, offers, admin conversations, phone lock and member record.
-- The login account itself is removed too, unless the same account is used by another app in this database
-- (then only the TexContractor part is deleted and the person can no longer appear on TexContractor).
create or replace function public.texcontractor_admin_delete_member(p_user uuid)
returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare v_me uuid := auth.uid(); v_paths jsonb := '[]'::jsonb; v_listings int; v_other boolean; v_email text;
begin
  if not texcontractor_is_site_admin(v_me) then raise exception 'Only the site admin can delete.'; end if;
  if p_user = v_me then raise exception 'You cannot delete your own admin account.'; end if;
  if exists (select 1 from texcontractor_admins where user_id = p_user) then raise exception 'This account is an admin and cannot be deleted here.'; end if;
  select email into v_email from auth.users where id = p_user;

  select coalesce(jsonb_agg(p), '[]'::jsonb) into v_paths from (
    select profile_photo_path p from texcontractor_submissions where owner_id = p_user and profile_photo_path is not null
    union all
    select jsonb_array_elements_text(case when jsonb_typeof(to_jsonb(work_photo_paths)) = 'array' then to_jsonb(work_photo_paths) else '[]'::jsonb end)
      from texcontractor_submissions where owner_id = p_user) x;

  delete from texcontractor_chats where customer_id = p_user or technician_id = p_user;
  delete from texcontractor_request_offers where technician_id = p_user;
  delete from texcontractor_requests where customer_id = p_user;
  delete from texcontractor_submissions where owner_id = p_user;
  get diagnostics v_listings = row_count;
  delete from texcontractor_public_services where owner_id = p_user;
  delete from texcontractor_conversations where member_id = p_user;
  delete from texcontractor_account_phones where user_id = p_user;
  delete from texcontractor_members where user_id = p_user;

  v_other := exists (select 1 from membership_requests where user_id = p_user)
          or exists (select 1 from saved_searches where user_id = p_user)
          or exists (select 1 from search_alerts where user_id = p_user)
          or exists (select 1 from community_posts where user_id = p_user)
          or exists (select 1 from reflections where author_id = p_user)
          or exists (select 1 from wanted_posts where user_id = p_user)
          or exists (select 1 from app_backups where created_by = p_user)
          or exists (select 1 from sponsored_ads where created_by = p_user);
  if not v_other then
    delete from auth.users where id = p_user;
  end if;

  return jsonb_build_object('deleted', 'member', 'email', v_email, 'listings', v_listings,
    'account_removed', not v_other, 'paths', v_paths);
end $$;

revoke all on function public.texcontractor_is_site_admin(uuid) from public, anon;
revoke all on function public.texcontractor_admin_delete_listing(uuid) from public, anon;
revoke all on function public.texcontractor_admin_delete_member(uuid) from public, anon;
grant execute on function public.texcontractor_is_site_admin(uuid) to authenticated;
grant execute on function public.texcontractor_admin_delete_listing(uuid) to authenticated;
grant execute on function public.texcontractor_admin_delete_member(uuid) to authenticated;

select 'Admin delete is ready' as result;
