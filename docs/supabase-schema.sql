create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null,
  title text,
  report_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reports enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.reports to authenticated;

drop policy if exists "Users can read their own reports" on public.reports;
create policy "Users can read their own reports"
on public.reports
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own reports" on public.reports;
create policy "Users can create their own reports"
on public.reports
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own reports" on public.reports;
create policy "Users can update their own reports"
on public.reports
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own reports" on public.reports;
create policy "Users can delete their own reports"
on public.reports
for delete
using (auth.uid() = user_id);

create index if not exists reports_user_created_at_idx
on public.reports (user_id, created_at desc);

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null,
  status text not null default 'active',
  included_quantity integer,
  used_quantity integer not null default 0,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  source text not null default 'manual',
  order_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_status_check check (status in ('active', 'expired', 'refunded', 'revoked')),
  constraint user_entitlements_quantity_check check (included_quantity is null or included_quantity >= 0),
  constraint user_entitlements_used_quantity_check check (used_quantity >= 0)
);

alter table public.user_entitlements enable row level security;

grant select on table public.user_entitlements to authenticated;
grant select, insert, update, delete on table public.user_entitlements to service_role;

drop policy if exists "Users can read their own entitlements" on public.user_entitlements;
create policy "Users can read their own entitlements"
on public.user_entitlements
for select
using (auth.uid() = user_id);

create index if not exists user_entitlements_user_product_idx
on public.user_entitlements (user_id, product_key, status, expires_at);
