-- SHAKS CMS — Security fixes (run AFTER schema.sql and storage.sql)
-- ---------------------------------------------------------------
-- Problem: every "authenticated" RLS policy in schema.sql uses
-- `to authenticated using(true) with check(true)`. That only checks
-- that a request is signed in — NOT that the signed-in user is
-- actually an admin. If Supabase public sign-up is left on, anyone
-- who creates an account (via the public anon key, no CMS access
-- needed) gets full read/write/delete on every table, including
-- contact_messages (client PII).
--
-- Fix: an explicit admin_users allow-list + an is_admin() helper,
-- and every "authenticated" policy re-scoped to it.

-- 1. Allow-list of admins ---------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

-- Only an existing admin can view/manage the admin list itself.
-- (No insert/update/delete policy is created for authenticated
-- users on purpose — add admins via the Supabase SQL editor or
-- dashboard, never from client code.)
create policy admin_users_self_read on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- 2. Helper: is the current user an admin? -----------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- 3. Replace every blanket "authenticated" policy -----------------
drop policy if exists auth_projects            on public.projects;
drop policy if exists auth_categories          on public.categories;
drop policy if exists auth_services            on public.services;
drop policy if exists auth_technologies        on public.technologies;
drop policy if exists auth_project_tech        on public.project_technologies;
drop policy if exists auth_project_services    on public.project_services;
drop policy if exists auth_media               on public.media;
drop policy if exists auth_project_media       on public.project_media;
drop policy if exists auth_testimonials        on public.testimonials;
drop policy if exists auth_posts               on public.posts;
drop policy if exists auth_messages            on public.contact_messages;
drop policy if exists auth_settings            on public.website_settings;
drop policy if exists auth_seo                 on public.seo_settings;
drop policy if exists auth_navigation          on public.navigation;
drop policy if exists auth_activity            on public.admin_activity;
drop policy if exists "authenticated project categories manage" on public.project_categories;

create policy admin_projects         on public.projects            for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_categories       on public.categories          for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_services         on public.services            for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_technologies     on public.technologies        for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_project_tech     on public.project_technologies for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_project_services on public.project_services    for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_media            on public.media               for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_project_media    on public.project_media       for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_testimonials     on public.testimonials        for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_posts            on public.posts               for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_messages         on public.contact_messages    for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_settings         on public.website_settings    for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_seo              on public.seo_settings        for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_navigation       on public.navigation          for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_activity         on public.admin_activity      for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_project_categories on public.project_categories for all to authenticated using (is_admin()) with check (is_admin());

-- Note: contact_messages keeps its public INSERT-only policy from
-- schema.sql (public_contact_insert) so the contact form still
-- works for anonymous visitors — only reading/updating/deleting
-- messages now requires is_admin().

-- 4. Storage: scope uploads/deletes to admins too -----------------
drop policy if exists auth_portfolio_media_insert on storage.objects;
drop policy if exists auth_portfolio_media_update on storage.objects;
drop policy if exists auth_portfolio_media_delete on storage.objects;

create policy admin_portfolio_media_insert on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media' and public.is_admin());
create policy admin_portfolio_media_update on storage.objects for update to authenticated using (bucket_id = 'portfolio-media' and public.is_admin()) with check (bucket_id = 'portfolio-media' and public.is_admin());
create policy admin_portfolio_media_delete on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media' and public.is_admin());

-- 5. Bootstrap yourself as the first admin -------------------------
-- IMPORTANT: run this manually, once, after you've created your own
-- login in Supabase Auth (Authentication > Users, or by signing up
-- once through admin/index.html). Replace the email below.
--
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email = 'you@example.com';
--
-- Also go to Authentication > Settings in the Supabase dashboard and
-- turn OFF "Allow new users to sign up" — the CMS has no self-serve
-- registration flow, so public sign-up should never be needed.
