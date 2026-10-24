-- 创意仓库：作品表、管理员表、图片存储桶。
-- 所有人可读已发布的作品；只有 vault_admins 里的账号可以新增、修改、删除作品和上传图片。

create table public.vault_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.vault_admins enable row level security;
create policy "vault_admins: read own row" on public.vault_admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.vault_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.vault_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.vault_is_admin() from public;
grant execute on function public.vault_is_admin() to anon, authenticated;

create table public.vault_ideas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sort integer not null default 0,
  published boolean not null default true,
  category text not null default 'other' check (category in ('3d', '2d', 'other')),
  status text not null default 'live' check (status in ('live', 'wip', 'idea')),
  year integer check (year between 2000 and 2100),
  hue text not null default '#ff9a3c' check (hue ~ '^#[0-9a-fA-F]{6}$'),
  url text check (url is null or url ~ '^https?://'),
  repo text check (repo is null or repo ~ '^https?://'),
  images text[] not null default '{}' check (cardinality(images) <= 8),
  title_zh text not null check (char_length(title_zh) between 1 and 60),
  title_en text check (char_length(title_en) <= 80),
  kind_zh text check (char_length(kind_zh) <= 40),
  kind_en text check (char_length(kind_en) <= 60),
  line_zh text check (char_length(line_zh) <= 120),
  line_en text check (char_length(line_en) <= 240),
  lead_zh text check (char_length(lead_zh) <= 1200),
  lead_en text check (char_length(lead_en) <= 2400),
  tags_zh text[] not null default '{}' check (cardinality(tags_zh) <= 8),
  tags_en text[] not null default '{}' check (cardinality(tags_en) <= 8),
  facts jsonb not null default '[]' check (jsonb_typeof(facts) = 'array' and jsonb_array_length(facts) <= 4),
  tech text check (char_length(tech) <= 80),
  host text check (char_length(host) <= 60)
);
create index vault_ideas_order on public.vault_ideas (sort, created_at);
alter table public.vault_ideas enable row level security;

create policy "vault_ideas: read published" on public.vault_ideas
  for select to anon, authenticated using (published or (select public.vault_is_admin()));
create policy "vault_ideas: admin insert" on public.vault_ideas
  for insert to authenticated with check ((select public.vault_is_admin()));
create policy "vault_ideas: admin update" on public.vault_ideas
  for update to authenticated using ((select public.vault_is_admin())) with check ((select public.vault_is_admin()));
create policy "vault_ideas: admin delete" on public.vault_ideas
  for delete to authenticated using ((select public.vault_is_admin()));

create or replace function public.vault_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger vault_ideas_touch before update on public.vault_ideas
  for each row execute function public.vault_touch();

-- 图片：公开读取（通过公开地址），只有管理员能写
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('idea-vault', 'idea-vault', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/gif']);

create policy "idea-vault: admin select" on storage.objects
  for select to authenticated using (bucket_id = 'idea-vault' and (select public.vault_is_admin()));
create policy "idea-vault: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'idea-vault' and (select public.vault_is_admin()));
create policy "idea-vault: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'idea-vault' and (select public.vault_is_admin()));
create policy "idea-vault: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'idea-vault' and (select public.vault_is_admin()));
