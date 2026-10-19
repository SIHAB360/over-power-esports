-- Staff RBAC foundation (NOT a change to profiles.role; never grant blanket moderator).
-- Apply only after staging RLS verification and migration review.
create table if not exists public.staff_permissions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  match_view boolean not null default false,
  match_create boolean not null default false,
  match_edit boolean not null default false,
  updated_at timestamptz not null default now(),
  granted_by uuid references auth.users(id),
  constraint match_write_needs_view check ((not match_create and not match_edit) or match_view)
);
alter table public.staff_permissions enable row level security;
revoke all on table public.staff_permissions from anon, authenticated;
-- Privileged server-only CRUD; staff access to operational data must be
-- authorized through separately audited RPC / routes, not this table.
create index if not exists staff_permissions_updated_idx on public.staff_permissions(updated_at desc);
