-- =============================================================================
-- Admin panel: staff accounts (Supabase Auth) that can read and manage
-- booking requests and contact messages. Guests still have no direct access.
-- =============================================================================

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- A signed-in user may see their own admin row (used to check access).
create policy "Admins read own row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

/** True when the current JWT belongs to a listed admin. */
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Bookkeeping columns for decisions made in the panel.
alter table public.booking_requests
  add column admin_note        text check (char_length(admin_note) <= 1000),
  add column status_changed_at timestamptz,
  add column guest_notified    text check (guest_notified in ('sent', 'failed', 'skipped'));

alter table public.contact_messages
  add column status_changed_at timestamptz;

-- Admins read everything; they may only change the decision columns.
create policy "Admins read booking requests" on public.booking_requests
  for select to authenticated using ((select public.is_admin()));
create policy "Admins update booking requests" on public.booking_requests
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins read contact messages" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "Admins update contact messages" on public.contact_messages
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke insert, update, delete on public.booking_requests from anon, authenticated;
revoke insert, update, delete on public.contact_messages from anon, authenticated;
grant select on public.booking_requests, public.contact_messages to authenticated;
grant update (status, admin_note, status_changed_at, guest_notified) on public.booking_requests to authenticated;
grant update (status, status_changed_at) on public.contact_messages to authenticated;
