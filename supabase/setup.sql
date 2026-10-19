-- Run once in your own Supabase project's SQL Editor.
-- The browser receives no direct table access. Only the server's service role can read/write.
create table if not exists public.entries (
  id uuid primary key,
  kind text not null check (kind in ('project','team')),
  category text not null,
  title_ar text not null,
  title_en text not null,
  description_ar text not null default '',
  description_en text not null default '',
  media jsonb not null default '[]'::jsonb,
  video_url text not null default '',
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists entries_published_created on public.entries (published,featured,created_at desc);
create index if not exists entries_media_gin on public.entries using gin (media);
create table if not exists public.site_settings (id text primary key,value jsonb not null);
create table if not exists public.frame_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.entries enable row level security;
alter table public.site_settings enable row level security;
alter table public.frame_admins enable row level security;
revoke all on public.entries from anon, authenticated;
revoke all on public.site_settings from anon, authenticated;
revoke all on public.frame_admins from anon, authenticated;
grant all on public.entries to service_role;
grant all on public.site_settings to service_role;
grant all on public.frame_admins to service_role;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('frameon-media','frameon-media',false,31457280,array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do update set public=false,file_size_limit=31457280,allowed_mime_types=excluded.allowed_mime_types;
-- No public/authenticated storage policy is created. Signed upload URLs are server-authorized.
