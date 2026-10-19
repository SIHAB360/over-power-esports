-- Proposed general RBAC foundation, NOT deployed to production.
create table if not exists public.staff_access_grants (
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null check (section in ('matches','players','earnings','teams','tournaments','withdrawals','profit','verification','achievements')),
  action text not null check (action in ('view','create','edit','delete','approve','export')),
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key(user_id,section,action)
);
alter table public.staff_access_grants enable row level security;
revoke all on public.staff_access_grants from anon, authenticated;
-- Deploy only after a protected admin API and granular enforcement are tested.
