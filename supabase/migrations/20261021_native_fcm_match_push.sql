-- Native Android FCM tokens; separate from browser VAPID subscriptions.
-- Service role alone can access this table; API verifies Supabase login.
create table if not exists public.op_match_native_push_tokens (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 platform text not null default 'android' check (platform in ('android')),
 token text not null unique check (length(token) between 40 and 4096),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists op_match_native_push_user_idx on public.op_match_native_push_tokens(user_id);
alter table public.op_match_native_push_tokens enable row level security;
revoke all on public.op_match_native_push_tokens from anon,authenticated,public;
grant all on public.op_match_native_push_tokens to service_role;
