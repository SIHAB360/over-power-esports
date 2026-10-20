-- Premium esports match schedule & opt-in player notifications
-- A schedule is NOT a played match: it does not touch match finance or prize payouts.
create table if not exists public.op_match_schedules (
 id uuid primary key default gen_random_uuid(),
 title text not null check (length(btrim(title)) between 3 and 120),
 starts_at timestamptz not null,
 entry_fee numeric(12,2) not null default 0 check (entry_fee>=0 and entry_fee<=1000000),
 prize_pool text not null default '—' check (length(prize_pool)<=160),
 lobby_details text not null default '' check (length(lobby_details)<=500),
 notes text not null default '' check (length(notes)<=1000),
 team_id uuid references public.teams(id) on delete set null,
 status text not null default 'published' check (status in ('published','cancelled')),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists op_schedule_upcoming on public.op_match_schedules(starts_at) where status='published';

create table if not exists public.op_match_notifications (
 id uuid primary key default gen_random_uuid(),
 schedule_id uuid not null references public.op_match_schedules(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 event_key text not null check (event_key in ('created','60m','30m','15m')),
 created_at timestamptz not null default now(),
 read_at timestamptz,
 push_sent_at timestamptz,
 unique(schedule_id,user_id,event_key)
);
create index if not exists op_match_notifications_user on public.op_match_notifications(user_id,created_at desc);
create index if not exists op_match_notifications_pending on public.op_match_notifications(push_sent_at) where push_sent_at is null;

create table if not exists public.op_match_push_subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 endpoint text not null unique check(length(endpoint) between 20 and 2048 and left(endpoint,8)='https://'),
 p256dh text not null check (length(p256dh) between 20 and 500),
 auth text not null check(length(auth) between 8 and 500),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists op_match_push_user on public.op_match_push_subscriptions(user_id);

-- Only verified server routes with service-role access can write or read raw keys.
-- No browser client may enumerate other players or push endpoints.
alter table public.op_match_schedules enable row level security;
alter table public.op_match_notifications enable row level security;
alter table public.op_match_push_subscriptions enable row level security;
revoke all on public.op_match_schedules from anon,authenticated;
revoke all on public.op_match_notifications from anon,authenticated;
revoke all on public.op_match_push_subscriptions from anon,authenticated;

-- For an admin-supplied local Bangladesh date/time, convert on the server using
-- Asia/Dhaka; store the absolute UTC instant in starts_at.
comment on column public.op_match_schedules.prize_pool is 'Display-only description; never enters financial ledger calculations';
comment on column public.op_match_schedules.entry_fee is 'Per scheduled lobby fee; sum for daily operational cost, not player earnings';

-- Atomic due-event reservation: each schedule and recipient is inserted at most once
-- for a given reminder. Stale missed reminders are NOT sent hours late.
create or replace function public.op_claim_due_match_reminders()
returns table(notification_id uuid,schedule_id uuid,user_id uuid,event_key text)
language sql security definer set search_path = ''
as $$
 with due as (
   select s.id, e.event_key
   from public.op_match_schedules s
   cross join (values ('60m'::text,60),('30m'::text,30),('15m'::text,15)) e(event_key,minute_offset)
   where s.status='published'
     and now() >= s.starts_at - make_interval(mins => e.minute_offset)
     and now() < least(s.starts_at, s.starts_at - make_interval(mins=>e.minute_offset) + interval '5 minutes')
 ), recipients as (
   select d.id schedule_id, p.user_id,d.event_key
   from due d join public.op_match_schedules s on s.id=d.id
   join public.players p on p.user_id is not null
      and (s.team_id is null or s.team_id=p.team_id)
      and lower(p.status)='approved' and p.is_active is true
 ), saved as (
   insert into public.op_match_notifications(schedule_id,user_id,event_key)
   select schedule_id,user_id,event_key from recipients
   on conflict(schedule_id,user_id,event_key) do nothing
   returning id,schedule_id,user_id,event_key
 )
 select id,schedule_id,user_id,event_key from saved;
$$;
revoke all on function public.op_claim_due_match_reminders() from public,anon,authenticated;
grant execute on function public.op_claim_due_match_reminders() to service_role;
