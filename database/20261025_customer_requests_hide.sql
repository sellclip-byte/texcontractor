-- Customers can remove a closed request from their "My requests" list.
-- The row is kept (hidden, not deleted) so offers and chats stay intact.
alter table public.texcontractor_requests add column if not exists hidden_by_customer_at timestamptz;

create or replace function public.texcontractor_my_requests()
returns table (id uuid, service text, state text, city text, title text, status text, offers_count int,
  created_at timestamptz, expires_at timestamptz, unread int)
language sql stable security definer set search_path = public as $$
  select r.id, r.service, r.state, r.city, r.title,
    case when r.status = 'open' and r.expires_at <= now() then 'closed' else r.status end,
    r.offers_count, r.created_at, r.expires_at,
    (select count(*)::int from texcontractor_request_offers o join texcontractor_chat_messages m on m.chat_id = o.chat_id
      where o.request_id = r.id and m.sender_id <> auth.uid() and m.read_at is null)
  from texcontractor_requests r where r.customer_id = auth.uid() and r.hidden_by_customer_at is null
  order by (r.status = 'open' and r.expires_at > now()) desc, r.created_at desc limit 30;
$$;

-- Hide one of my requests. An open request is closed first (phone erased), then hidden.
create or replace function public.texcontractor_request_hide(p_request_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update texcontractor_requests set
    status = 'closed', closed_at = coalesce(closed_at, now()), phone = null,
    contact_text = false, contact_call = false, contact_chat = true,
    hidden_by_customer_at = now()
  where id = p_request_id and customer_id = auth.uid();
  if not found then raise exception 'Request not found.'; end if;
end $$;

revoke all on function public.texcontractor_request_hide(uuid) from public, anon;
grant execute on function public.texcontractor_request_hide(uuid) to authenticated;
