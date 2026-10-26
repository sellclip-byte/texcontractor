-- Red alert button on the admin dashboard: counts of things that need the owner's attention.
alter table public.texcontractor_reports add column if not exists reviewed_at timestamptz;

create or replace function public.texcontractor_admin_alerts() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Admins only.'; end if;
  return jsonb_build_object(
    'messages', (select count(*)::int from texcontractor_chat_messages m join texcontractor_chats c on c.id = m.chat_id
                  where auth.uid() in (c.technician_id, c.customer_id) and m.sender_id <> auth.uid() and m.read_at is null),
    'reports', (select count(*)::int from texcontractor_reports where reviewed_at is null),
    'removals', (select count(*)::int from texcontractor_number_removals where resolved_at is null),
    'verifications', (select count(*)::int from texcontractor_phone_verifications where status = 'pending'),
    'pending', (select count(*)::int from texcontractor_submissions where status = 'pending')
  );
end $$;

create or replace function public.texcontractor_admin_reports_seen() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Admins only.'; end if;
  update texcontractor_reports set reviewed_at = now() where reviewed_at is null;
end $$;

revoke all on function public.texcontractor_admin_alerts() from public, anon;
revoke all on function public.texcontractor_admin_reports_seen() from public, anon;
grant execute on function public.texcontractor_admin_alerts() to authenticated;
grant execute on function public.texcontractor_admin_reports_seen() to authenticated;

-- Reports can be hidden by the admin (kept, not deleted).
alter table public.texcontractor_reports add column if not exists hidden_at timestamptz;
create or replace function public.texcontractor_admin_report_hide(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not texcontractor_is_site_admin(auth.uid()) then raise exception 'Admins only.'; end if;
  update texcontractor_reports set hidden_at = now(), reviewed_at = coalesce(reviewed_at, now()) where id = p_id;
end $$;
revoke all on function public.texcontractor_admin_report_hide(uuid) from public, anon;
grant execute on function public.texcontractor_admin_report_hide(uuid) to authenticated;
-- texcontractor_admin_alerts() also counts only reports with hidden_at is null.
