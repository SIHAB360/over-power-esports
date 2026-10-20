-- Consent-based, first-party visitor analytics. Never store raw IP addresses or precise GPS.
create table if not exists public.visitor_sessions (
 id uuid primary key, started_at timestamptz not null default now(),last_seen_at timestamptz not null default now(),
 ended_at timestamptz, current_path text not null default '/', page_views integer not null default 0,
 account_id uuid, account_email text, ip_group text, country text,region text,city text,
 referrer_host text,device_type text,browser text,os_name text,language_code text,
 first_path text not null default '/', source text not null default 'Direct'
);
create table if not exists public.visitor_events (
 id uuid primary key, session_id uuid not null references public.visitor_sessions(id) on delete cascade,
 created_at timestamptz not null default now(),kind text not null check(kind in ('page','heartbeat','exit')),
 path text not null default '/'
);
create table if not exists public.visitor_rate_limits (
 ip_group text not null, minute_at timestamptz not null, hits integer not null default 1,
 primary key (ip_group,minute_at)
);
create index if not exists visitor_sessions_started_idx on public.visitor_sessions(started_at desc);
create index if not exists visitor_sessions_last_idx on public.visitor_sessions(last_seen_at desc);
create index if not exists visitor_events_time_idx on public.visitor_events(created_at desc);
create index if not exists visitor_events_session_idx on public.visitor_events(session_id,created_at desc);
create index if not exists visitor_events_path_idx on public.visitor_events(path,created_at desc) where kind='page';
alter table public.visitor_sessions enable row level security;
alter table public.visitor_events enable row level security;
alter table public.visitor_rate_limits enable row level security;
revoke all on public.visitor_sessions,public.visitor_events,public.visitor_rate_limits from public,anon,authenticated;
grant select,insert,update,delete on public.visitor_sessions,public.visitor_events,public.visitor_rate_limits to service_role;

create or replace function public.visitor_record(p_session uuid,p_event uuid,p_kind text,p_data jsonb)
returns void language plpgsql security definer set search_path='' as $visitor$
declare v_path text;v_ip text;v_inserted integer;v_now timestamptz:=clock_timestamp();v_minute timestamptz:=date_trunc('minute',clock_timestamp());
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501';end if;
 if p_kind not in ('page','heartbeat','exit') or p_data is null or jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>3200 then
 raise exception 'Invalid event' using errcode='22023';end if;
 v_path:=coalesce(nullif(p_data->>'path',''),'/');v_ip:=coalesce(nullif(p_data->>'ip_group',''),'unknown');
 if left(v_path,1)<>'/' or length(v_path)>220 or v_path ~ '[?#]' or length(v_ip)>80 then
 raise exception 'Invalid analytics fields' using errcode='22023';end if;
 -- Per-IP-group burst bound protects Postgres from excessive anonymous event traffic.
 insert into public.visitor_rate_limits(ip_group,minute_at,hits) values(v_ip,v_minute,1)
 on conflict(ip_group,minute_at) do update set hits=public.visitor_rate_limits.hits+1
 where public.visitor_rate_limits.hits<100;
 if not found then return;end if;
 insert into public.visitor_sessions(id,started_at,last_seen_at,current_path,first_path,
  account_id,account_email,ip_group,country,region,city,referrer_host,device_type,browser,os_name,language_code,source)
 values(p_session,v_now,v_now,v_path,v_path,nullif(p_data->>'account_id','')::uuid,
 nullif(left(p_data->>'account_email',180),''),left(v_ip,80),left(p_data->>'country',70),
 left(p_data->>'region',90),left(p_data->>'city',100),left(p_data->>'referrer_host',140),
 left(p_data->>'device_type',25),left(p_data->>'browser',50),left(p_data->>'os_name',50),
 left(p_data->>'language_code',32),left(coalesce(p_data->>'source','Direct'),100))
 on conflict (id) do update set last_seen_at=v_now,current_path=v_path,
  account_id=coalesce(excluded.account_id,public.visitor_sessions.account_id),
  account_email=coalesce(excluded.account_email,public.visitor_sessions.account_email),
  ended_at=case when p_kind='exit' then v_now else null end;
 insert into public.visitor_events(id,session_id,created_at,kind,path)
 values(p_event,p_session,v_now,p_kind,v_path) on conflict(id) do nothing;
 get diagnostics v_inserted=row_count;
 if v_inserted=1 and p_kind='page' then
   update public.visitor_sessions set page_views=page_views+1 where id=p_session;
 end if;
 if p_kind='exit' then update public.visitor_sessions set ended_at=v_now where id=p_session;end if;
 -- Automatic 30-day retention; probabilistic to keep write latency low.
 if random()<0.003 then
   delete from public.visitor_sessions where last_seen_at<now()-interval '30 days';
   delete from public.visitor_rate_limits where minute_at<now()-interval '2 hours';
 end if;
end;$visitor$;
revoke all on function public.visitor_record(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.visitor_record(uuid,uuid,text,jsonb) to service_role;

create or replace function public.visitor_dashboard(p_hours integer default 24,p_offset integer default 0,p_search text default '')
returns jsonb language plpgsql security definer set search_path='' as $visitor$
declare v_since timestamptz;v_kpis jsonb;v_rows jsonb;v_pages jsonb;v_devices jsonb;v_countries jsonb;v_sources jsonb;v_trend jsonb;v_recent jsonb;v_found bigint;v_query text;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501';end if;
 if p_hours not in(24,168,720) or p_offset<0 or p_offset>25000 or length(coalesce(p_search,''))>90 then
 raise exception 'Invalid report filter' using errcode='22023';end if;
 v_since:=now()-(p_hours||' hours')::interval;v_query:='%'||coalesce(p_search,'')||'%';
 select jsonb_build_object('sessions',count(*),'active',count(*) filter(where last_seen_at>now()-interval '2 minutes' and ended_at is null),
  'signedIn',count(*) filter(where account_id is not null),'pageViews',coalesce(sum(page_views),0),
  'avgMinutes',round(coalesce(avg(greatest(0,extract(epoch from coalesce(ended_at,last_seen_at)-started_at)/60)),0)::numeric,1),
  'bounceRate',round(coalesce(100.0*count(*) filter(where page_views<=1)/nullif(count(*),0),0),1))
 into v_kpis from public.visitor_sessions where started_at>=v_since;
 select count(*) into v_found from public.visitor_sessions s where s.started_at>=v_since and
 (p_search='' or s.current_path ilike v_query or s.account_email ilike v_query or s.country ilike v_query or s.city ilike v_query or s.ip_group ilike v_query);
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from(
   select id,started_at,last_seen_at,ended_at,current_path,first_path,page_views,account_email,ip_group,
   country,region,city,referrer_host,device_type,browser,os_name,source,language_code,
   (last_seen_at>now()-interval '2 minutes' and ended_at is null) as is_active
   from public.visitor_sessions s where started_at>=v_since and
   (p_search='' or s.current_path ilike v_query or s.account_email ilike v_query or s.country ilike v_query or s.city ilike v_query or s.ip_group ilike v_query)
   order by last_seen_at desc limit 40 offset p_offset
 )t;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_pages from(
  select path,count(*) as visits from public.visitor_events where kind='page' and created_at>=v_since group by path order by visits desc limit 8
 )t;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_devices from(
  select coalesce(device_type,'Unknown') as name,count(*) as visits from public.visitor_sessions where started_at>=v_since group by 1 order by visits desc limit 6
 )t;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_countries from(
  select coalesce(country,'Unknown') as name,count(*) as visits from public.visitor_sessions where started_at>=v_since group by 1 order by visits desc limit 8
 )t;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_sources from(
  select coalesce(source,'Direct') as name,count(*) as visits from public.visitor_sessions where started_at>=v_since group by 1 order by visits desc limit 8
 )t;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_trend from(
  select case when p_hours=24 then to_char(date_trunc('hour',started_at),'HH24:00')
       else to_char(date_trunc('day',started_at),'Mon DD') end as label,
  count(*) as visits,min(date_trunc(case when p_hours=24 then 'hour' else 'day' end,started_at)) as bucket
  from public.visitor_sessions where started_at>=v_since
  group by 1 order by bucket asc limit 35
 )t;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_recent from(
   select e.created_at,e.path,e.kind,s.account_email,s.country,s.device_type
   from public.visitor_events e join public.visitor_sessions s on s.id=e.session_id
   where e.created_at>=v_since and e.kind='page' order by e.created_at desc limit 24
 )t;
 return jsonb_build_object('kpis',v_kpis,'rows',v_rows,'found',v_found,'pages',v_pages,
  'devices',v_devices,'countries',v_countries,'sources',v_sources,'trend',v_trend,'recent',v_recent,'generatedAt',now());
end;$visitor$;
revoke all on function public.visitor_dashboard(integer,integer,text) from public,anon,authenticated;
grant execute on function public.visitor_dashboard(integer,integer,text) to service_role;

create or replace function public.visitor_timeline(p_session uuid)
returns jsonb language plpgsql security definer set search_path='' as $visitor$
declare v_result jsonb;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501';end if;
 select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into v_result from(
  select created_at,kind,path from public.visitor_events where session_id=p_session order by created_at desc limit 150
 )x;
 return v_result;
end;$visitor$;
revoke all on function public.visitor_timeline(uuid) from public,anon,authenticated;
grant execute on function public.visitor_timeline(uuid) to service_role;

-- Guaranteed nightly clean-up; pg_cron is already installed on this Supabase project.
select cron.schedule('over_power_visitor_30_day_retention','14 3 * * *',
 $$delete from public.visitor_sessions where last_seen_at < now() - interval '30 days';
   delete from public.visitor_rate_limits where minute_at < now() - interval '2 hours';$$);
