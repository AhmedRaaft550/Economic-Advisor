create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username varchar(24) not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  failed_login_attempts integer not null default 0,
  lockout_until timestamptz,
  constraint username_format check (username ~ '^[A-Za-z0-9_]{3,24}$')
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  category text not null default 'general',
  description text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_username on public.users (username);
create index if not exists idx_expenses_user_id on public.expenses (user_id);
create index if not exists idx_expenses_user_occured_on on public.expenses (user_id, occurred_on desc);

create or replace function public.set_request_user_context(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user_id::text, ''), true);
end;
$$;

alter table public.users enable row level security;
alter table public.expenses enable row level security;

create policy "Users can insert own row"
on public.users
for insert
with check (
  id = current_setting('request.jwt.claim.sub', true)::uuid
);

create policy "Users can read own row"
on public.users
for select
using (
  id = current_setting('request.jwt.claim.sub', true)::uuid
);

create policy "Users can update own row"
on public.users
for update
using (
  id = current_setting('request.jwt.claim.sub', true)::uuid
)
with check (
  id = current_setting('request.jwt.claim.sub', true)::uuid
);

create policy "Users can read own expenses"
on public.expenses
for select
using (
  user_id = current_setting('request.jwt.claim.sub', true)::uuid
);

create policy "Users can insert own expenses"
on public.expenses
for insert
with check (
  user_id = current_setting('request.jwt.claim.sub', true)::uuid
);

create policy "Users can update own expenses"
on public.expenses
for update
using (
  user_id = current_setting('request.jwt.claim.sub', true)::uuid
)
with check (
  user_id = current_setting('request.jwt.claim.sub', true)::uuid
);

create policy "Users can delete own expenses"
on public.expenses
for delete
using (
  user_id = current_setting('request.jwt.claim.sub', true)::uuid
);
