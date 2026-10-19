-- Secure moderator operations — intended for staging tests BEFORE production use.
-- No existing admin privilege is granted to moderator accounts; all writes are RPC-limited.
create table if not exists public.moderator_operation_audit(
 id bigint generated always as identity primary key,
 actor_id uuid not null references auth.users(id),
 section text not null,
 action text not null,
 record_id uuid,
 before_data jsonb,
 after_data jsonb,
 created_at timestamptz not null default now()
);
alter table public.moderator_operation_audit enable row level security;
revoke all on table public.moderator_operation_audit from public,anon,authenticated;
revoke all on sequence public.moderator_operation_audit_id_seq from public,anon,authenticated;

-- Every RPC checks membership, player approval AND the exact section/action.
-- Row share-locks serialize authorization with admin revocation and player deapproval.
create or replace function public.moderator_access_check(p_section text,p_action text)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid();
begin
 if auth.role() is distinct from 'authenticated' or v_actor is null then
  raise exception 'Moderator sign-in required' using errcode='42501';
 end if;
 perform 1 from public.moderator_accounts a where a.user_id=v_actor and a.enabled for share;
 if not found then raise exception 'Moderator inactive' using errcode='42501';end if;
 perform 1 from public.players p where p.user_id=v_actor and p.status='approved' for share;
 if not found then raise exception 'Moderator player not approved' using errcode='42501';end if;
 if not exists (select 1 from public.moderator_permissions m
                where m.user_id=v_actor and m.section=p_section and m.action=p_action) then
  raise exception 'Section action not granted' using errcode='42501';
 end if;
end;$$;
revoke all on function public.moderator_access_check(text,text) from public,anon,authenticated;
-- callable only within SECURITY DEFINER routines, never directly from app clients.

create or replace function public.moderator_list_section(p_section text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_rows jsonb;
begin
 if p_section not in ('matches','teams','tournaments','players','earnings','withdrawals','profit','verification','achievements') then
  raise exception 'Unsupported section' using errcode='22023';end if;
 perform public.moderator_access_check(p_section,'view');
 case p_section
 when 'matches' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,match_type,match_date,status,team1_id,team2_id,platform,map,sponsor,notice
    from public.matches order by created_at desc nulls last limit 50
  ) t;
 when 'teams' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,team_name,description,country,coach_name,manager_name,status
    from public.teams order by created_at desc nulls last limit 50
  ) t;
 when 'tournaments' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,name,description,start_date,end_date,status
    from public.tournaments order by created_at desc nulls last limit 50
  ) t;
 when 'players' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,ign,full_name,status,team_name from public.players
    order by created_at desc nulls last limit 50
  ) t;
 when 'earnings' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,player_id,match_id,amount,percentage,created_at
    from public.player_earnings order by created_at desc nulls last limit 50
  ) t;
 when 'withdrawals' then
  -- Exclude personal phone/receiver numbers, transaction references and notes.
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,player_id,provider,amount,transfer_fee,net_payout,status,created_at
    from public.withdrawal_requests order by created_at desc nulls last limit 50
  ) t;
 when 'profit' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,match_id,entry_fee,prize_money,profit,expense,created_at
    from public.match_finance order by created_at desc nulls last limit 50
  ) t;
 when 'verification' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,ign,full_name,status,verified,created_at
    from public.players order by created_at desc nulls last limit 50
  ) t;
 when 'achievements' then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_rows from (
    select id,title,category,sort_order,is_published,created_at
    from public.achievement_gallery order by created_at desc nulls last limit 50
  ) t;
 end case;
 return v_rows;
end;$$;
revoke all on function public.moderator_list_section(text) from public,anon;
grant execute on function public.moderator_list_section(text) to authenticated;

create or replace function public.moderator_write_section(
 p_section text,p_action text,p_record_id uuid,p_payload jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid();v_id uuid;v_before jsonb;v_after jsonb;
        v_team1 uuid;v_team2 uuid;v_match_date timestamp;v_start date;v_end date;
        v_allowed text[];v_key text;
begin
 if p_section not in ('matches','teams','tournaments') or p_action not in ('create','edit') then
  raise exception 'Unsupported write capability' using errcode='22023';end if;
 if jsonb_typeof(p_payload) is distinct from 'object'
    or octet_length(p_payload::text)>10000 then
  raise exception 'Invalid payload' using errcode='22023';end if;
 perform public.moderator_access_check(p_section,p_action);
 if p_action='create' and p_record_id is not null then
  raise exception 'Create cannot specify record ID' using errcode='22023';end if;
 if p_action='edit' and p_record_id is null then
  raise exception 'Edit requires record ID' using errcode='22023';end if;
 if p_section='matches' then
   v_allowed:=case when p_action='create'
     then array['team1_id','team2_id','match_date','match_type','platform','map','sponsor','notice']
     else array['match_date','match_type','platform','map','sponsor','notice'] end;
 elsif p_section='teams' then
   v_allowed:=array['team_name','description','country','coach_name','manager_name'];
 else
   v_allowed:=array['name','description','start_date','end_date'];
 end if;
 for v_key in select jsonb_object_keys(p_payload) loop
  if not v_key=any(v_allowed) then
   raise exception 'Forbidden field: %',v_key using errcode='42501';end if;
 end loop;
 if p_section='matches' then
   if p_action='create' then
    if nullif(p_payload->>'team1_id','') is null or nullif(p_payload->>'team2_id','') is null
       or nullif(p_payload->>'match_date','') is null then
      raise exception 'Teams and match date required' using errcode='22023';end if;
    v_team1:=(p_payload->>'team1_id')::uuid;
    v_team2:=(p_payload->>'team2_id')::uuid;
    v_match_date:=(p_payload->>'match_date')::timestamp;
    if v_team1=v_team2 or v_match_date < timestamp '2020-01-01' or v_match_date>timestamp '2100-01-01' then
      raise exception 'Invalid match teams or date' using errcode='22023';end if;
    if (select count(*) from public.teams where id in (v_team1,v_team2))<>2 then
      raise exception 'Teams must exist' using errcode='22023';end if;
    insert into public.matches(team1_id,team2_id,match_date,match_type,platform,map,sponsor,notice,status)
    values(v_team1,v_team2,v_match_date,
      left(coalesce(p_payload->>'match_type','Scrim'),80),left(coalesce(p_payload->>'platform','Free Fire'),50),
      left(coalesce(p_payload->>'map',''),100),left(coalesce(p_payload->>'sponsor',''),100),
      left(coalesce(p_payload->>'notice',''),1000),'upcoming') returning id into v_id;
   else
    select to_jsonb(x) into v_before from (
      select id,team1_id,team2_id,match_date,match_type,status,platform,map,sponsor,notice
      from public.matches where id=p_record_id and status='upcoming' for update
    ) x;
    if v_before is null or exists (select 1 from public.player_earnings e where e.match_id=p_record_id) then
      raise exception 'Only non-earning upcoming matches can be edited' using errcode='42501';end if;
    if p_payload ? 'match_date' then
      v_match_date:=(p_payload->>'match_date')::timestamp;
      if v_match_date is null or v_match_date<timestamp '2020-01-01' or v_match_date>timestamp '2100-01-01' then
        raise exception 'Invalid match date' using errcode='22023';end if;
    end if;
    update public.matches m set
      match_date=coalesce(v_match_date,m.match_date),
      match_type=case when p_payload?'match_type' then left(coalesce(p_payload->>'match_type',''),80) else m.match_type end,
      platform=case when p_payload?'platform' then left(coalesce(p_payload->>'platform',''),50) else m.platform end,
      map=case when p_payload?'map' then left(coalesce(p_payload->>'map',''),100) else m.map end,
      sponsor=case when p_payload?'sponsor' then left(coalesce(p_payload->>'sponsor',''),100) else m.sponsor end,
      notice=case when p_payload?'notice' then left(coalesce(p_payload->>'notice',''),1000) else m.notice end
    where m.id=p_record_id returning id into v_id;
   end if;
 elsif p_section='teams' then
   if p_action='create' then
     if length(btrim(coalesce(p_payload->>'team_name','')))=0 then raise exception 'Team name required' using errcode='22023';end if;
     insert into public.teams(team_name,description,country,coach_name,manager_name)
     values(left(btrim(p_payload->>'team_name'),100),left(coalesce(p_payload->>'description',''),1000),
       left(coalesce(p_payload->>'country',''),60),left(coalesce(p_payload->>'coach_name',''),100),
       left(coalesce(p_payload->>'manager_name',''),100)) returning id into v_id;
   else
     if p_payload?'team_name' and length(btrim(coalesce(p_payload->>'team_name','')))=0 then
       raise exception 'Team name required' using errcode='22023';end if;
     select to_jsonb(x) into v_before from (
       select id,team_name,description,country,coach_name,manager_name,status
       from public.teams where id=p_record_id for update
     ) x;
     if v_before is null then raise exception 'Team not found' using errcode='22023';end if;
     update public.teams t set
       team_name=case when p_payload?'team_name' then left(btrim(coalesce(p_payload->>'team_name','')),100) else t.team_name end,
       description=case when p_payload?'description' then left(coalesce(p_payload->>'description',''),1000) else t.description end,
       country=case when p_payload?'country' then left(coalesce(p_payload->>'country',''),60) else t.country end,
       coach_name=case when p_payload?'coach_name' then left(coalesce(p_payload->>'coach_name',''),100) else t.coach_name end,
       manager_name=case when p_payload?'manager_name' then left(coalesce(p_payload->>'manager_name',''),100) else t.manager_name end
     where t.id=p_record_id returning id into v_id;
   end if;
 else
   if p_action='create' then
     if length(btrim(coalesce(p_payload->>'name','')))=0 then raise exception 'Tournament name required' using errcode='22023';end if;
     v_start:=nullif(p_payload->>'start_date','')::date;
     v_end:=nullif(p_payload->>'end_date','')::date;
     if v_start is not null and v_end is not null and v_end<v_start then raise exception 'Date order invalid' using errcode='22023';end if;
     insert into public.tournaments(name,description,start_date,end_date,status)
     values(left(btrim(p_payload->>'name'),150),left(coalesce(p_payload->>'description',''),1000),v_start,v_end,'upcoming') returning id into v_id;
   else
     if p_payload?'name' and length(btrim(coalesce(p_payload->>'name','')))=0 then
       raise exception 'Tournament name required' using errcode='22023';end if;
     select to_jsonb(x) into v_before from (
       select id,name,description,start_date,end_date,status
       from public.tournaments where id=p_record_id for update
     ) x;
     if v_before is null or v_before->>'status' <> 'upcoming' then
       raise exception 'Only upcoming tournaments can be edited' using errcode='42501';end if;
     v_start:=coalesce(nullif(p_payload->>'start_date','')::date,(v_before->>'start_date')::date);
     v_end:=coalesce(nullif(p_payload->>'end_date','')::date,(v_before->>'end_date')::date);
     if v_start is not null and v_end is not null and v_end<v_start then raise exception 'Date order invalid' using errcode='22023';end if;
     update public.tournaments t set
       name=case when p_payload?'name' then left(btrim(coalesce(p_payload->>'name','')),150) else t.name end,
       description=case when p_payload?'description' then left(coalesce(p_payload->>'description',''),1000) else t.description end,
       start_date=case when p_payload?'start_date' then v_start else t.start_date end,
       end_date=case when p_payload?'end_date' then v_end else t.end_date end
     where t.id=p_record_id returning id into v_id;
   end if;
 end if;
 if v_id is null then raise exception 'Mutation failed' using errcode='22023';end if;
 -- Audit only the public metadata permitted to moderators (no financial or private columns).
 if p_section='matches' then
   select to_jsonb(x) into v_after from (select id,team1_id,team2_id,match_date,match_type,status,platform,map,sponsor,notice from public.matches where id=v_id) x;
 elsif p_section='teams' then
   select to_jsonb(x) into v_after from (select id,team_name,description,country,coach_name,manager_name,status from public.teams where id=v_id) x;
 else
   select to_jsonb(x) into v_after from (select id,name,description,start_date,end_date,status from public.tournaments where id=v_id) x;
 end if;
 insert into public.moderator_operation_audit(actor_id,section,action,record_id,before_data,after_data)
 values(v_actor,p_section,p_action,v_id,v_before,v_after);
 return v_after;
end;$$;
revoke all on function public.moderator_write_section(text,text,uuid,jsonb) from public,anon;
grant execute on function public.moderator_write_section(text,text,uuid,jsonb) to authenticated;

-- Team picker data for authorized Match Center staff (no extra Teams grant needed).
create or replace function public.moderator_match_team_choices()
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_data jsonb;
begin
 perform public.moderator_access_check('matches','view');
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into v_data
 from (select id,team_name from public.teams order by team_name asc limit 300) t;
 return v_data;
end;$$;
revoke all on function public.moderator_match_team_choices() from public,anon;
grant execute on function public.moderator_match_team_choices() to authenticated;
