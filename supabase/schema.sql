create extension if not exists pgcrypto;
create type public.project_status as enum ('draft','published','archived');
create type public.message_status as enum ('new','contacted','in_discussion','won','lost','archived');
create table public.categories(id uuid primary key default gen_random_uuid(),name text not null unique,slug text not null unique,description text,image_url text,sort_order int not null default 0,active bool not null default true,created_at timestamptz not null default now());
create table public.projects(id uuid primary key default gen_random_uuid(),title text not null,slug text not null unique,short_description text,client text,industry text,year int,category_id uuid references public.categories(id) on delete set null,cover_url text,cover_alt text,overview text,challenge text,approach text,solution text,results text,live_url text,status public.project_status not null default 'draft',featured bool not null default false,sort_order int not null default 0,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.services(id uuid primary key default gen_random_uuid(),name text not null unique,slug text not null unique,short_description text,full_description text,image_url text,features jsonb not null default '[]',featured bool not null default false,sort_order int not null default 0,active bool not null default true,seo_title text,meta_description text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.technologies(id uuid primary key default gen_random_uuid(),name text not null unique,slug text not null unique);
create table public.project_technologies(project_id uuid references public.projects(id) on delete cascade,technology_id uuid references public.technologies(id) on delete cascade,primary key(project_id,technology_id));
create table public.project_services(project_id uuid references public.projects(id) on delete cascade,service_id uuid references public.services(id) on delete cascade,primary key(project_id,service_id));
create table public.media(id uuid primary key default gen_random_uuid(),storage_path text not null unique,public_url text,file_name text not null,mime_type text,file_size bigint,width int,height int,title text,alt_text text,description text,created_at timestamptz not null default now());
create table public.project_media(project_id uuid references public.projects(id) on delete cascade,media_id uuid references public.media(id) on delete cascade,sort_order int not null default 0,primary key(project_id,media_id));
create table public.testimonials(id uuid primary key default gen_random_uuid(),client_name text not null,company text,role text,testimonial text not null,client_image_url text,company_logo_url text,featured bool not null default false,sort_order int not null default 0,published bool not null default true,created_at timestamptz not null default now());
create table public.posts(id uuid primary key default gen_random_uuid(),title text not null,slug text not null unique,excerpt text,content text,cover_url text,cover_alt text,author_name text,category text,tags text[] not null default '{}',status public.project_status not null default 'draft',published_at timestamptz,seo_title text,meta_description text,og_image_url text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.contact_messages(id uuid primary key default gen_random_uuid(),name text not null,email text not null,phone text,company text,service text,budget text,message text not null,timeline text,status public.message_status not null default 'new',created_at timestamptz not null default now());
create table public.website_settings(id int primary key default 1 check(id=1),studio_name text not null default 'SHAKS',tagline text default 'Creative & Digital Studio',short_description text,logo_url text,light_logo_url text,dark_logo_url text,favicon_url text,email text,phone text,whatsapp text,location text,instagram text,facebook text,linkedin text,behance text,tiktok text,youtube text,x_url text,footer_description text,copyright_text text,updated_at timestamptz not null default now());
insert into public.website_settings(id) values(1) on conflict(id) do nothing;
create table public.seo_settings(id int primary key default 1 check(id=1),site_title text default 'SHAKS — Creative & Digital Studio',site_description text,default_og_image text,twitter_card text default 'summary_large_image',updated_at timestamptz not null default now());
insert into public.seo_settings(id) values(1) on conflict(id) do nothing;
create table public.navigation(id uuid primary key default gen_random_uuid(),label text not null,url text not null,sort_order int not null default 0,visible bool not null default true,external bool not null default false);
create table public.admin_activity(id uuid primary key default gen_random_uuid(),actor_id uuid references auth.users(id) on delete set null,action text not null,entity_type text,entity_id uuid,metadata jsonb default '{}',created_at timestamptz not null default now());

alter table public.categories enable row level security; alter table public.projects enable row level security; alter table public.services enable row level security; alter table public.technologies enable row level security; alter table public.project_technologies enable row level security; alter table public.project_services enable row level security; alter table public.media enable row level security; alter table public.project_media enable row level security; alter table public.testimonials enable row level security; alter table public.posts enable row level security; alter table public.contact_messages enable row level security; alter table public.website_settings enable row level security; alter table public.seo_settings enable row level security; alter table public.navigation enable row level security; alter table public.admin_activity enable row level security;
create policy public_published_projects on public.projects for select using(status='published'); create policy public_active_categories on public.categories for select using(active); create policy public_active_services on public.services for select using(active); create policy public_technologies on public.technologies for select using(true); create policy public_testimonials on public.testimonials for select using(published); create policy public_published_posts on public.posts for select using(status='published'); create policy public_settings on public.website_settings for select using(true); create policy public_seo on public.seo_settings for select using(true); create policy public_navigation on public.navigation for select using(visible); create policy public_media on public.media for select using(true); create policy public_project_media on public.project_media for select using(true); create policy public_project_services on public.project_services for select using(true); create policy public_project_technologies on public.project_technologies for select using(true);
create policy public_contact_insert on public.contact_messages for insert with check(length(name) between 1 and 150 and length(email) between 3 and 320 and length(message) between 1 and 10000);
-- Authenticated CMS users. In production, tighten these policies further with an admin-members table/role claim.
create policy auth_projects on public.projects for all to authenticated using(true) with check(true); create policy auth_categories on public.categories for all to authenticated using(true) with check(true); create policy auth_services on public.services for all to authenticated using(true) with check(true); create policy auth_technologies on public.technologies for all to authenticated using(true) with check(true); create policy auth_project_tech on public.project_technologies for all to authenticated using(true) with check(true); create policy auth_project_services on public.project_services for all to authenticated using(true) with check(true); create policy auth_media on public.media for all to authenticated using(true) with check(true); create policy auth_project_media on public.project_media for all to authenticated using(true) with check(true); create policy auth_testimonials on public.testimonials for all to authenticated using(true) with check(true); create policy auth_posts on public.posts for all to authenticated using(true) with check(true); create policy auth_messages on public.contact_messages for all to authenticated using(true) with check(true); create policy auth_settings on public.website_settings for all to authenticated using(true) with check(true); create policy auth_seo on public.seo_settings for all to authenticated using(true) with check(true); create policy auth_navigation on public.navigation for all to authenticated using(true) with check(true); create policy auth_activity on public.admin_activity for all to authenticated using(true) with check(true);


-- CMS completion helpers
create table if not exists public.project_categories (
  project_id uuid references public.projects(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key(project_id, category_id)
);

alter table public.project_categories enable row level security;
create policy "public project categories read" on public.project_categories for select using(true);
create policy "authenticated project categories manage" on public.project_categories for all to authenticated using(true) with check(true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
for each row execute function public.set_updated_at();

create index if not exists project_media_project_idx on public.project_media(project_id);
create index if not exists project_media_media_idx on public.project_media(media_id);
create index if not exists media_created_idx on public.media(created_at desc);
