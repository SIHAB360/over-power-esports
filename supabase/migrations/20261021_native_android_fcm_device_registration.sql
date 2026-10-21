-- Native Android Firebase Cloud Messaging device registration.
-- No client-side select/delete access; all APIs use verified auth + service role.
create table if not exists public.op_native_push_tokens (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 token text not null unique check(length(token) between 50 and 512),
 platform text not null default 'android' check(platform='android'),
 app_version text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists op_native_push_tokens_by_user on public.op_native_push_tokens(user_id);
alter table public.op_native_push_tokens enable row level security;
revoke all on public.op_native_push_tokens from public,anon,authenticated;
grant select,insert,update,delete on public.op_native_push_tokens to service_role;
