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
