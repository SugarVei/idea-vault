alter table public.vault_ideas drop constraint if exists vault_ideas_category_check;
alter table public.vault_ideas add constraint vault_ideas_category_check check (category in ('3d', '2d', 'video', 'other'));
