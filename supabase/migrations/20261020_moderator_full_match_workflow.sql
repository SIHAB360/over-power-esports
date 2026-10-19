-- Moderator full match creation, with extra result/finance approval.
CREATE OR REPLACE FUNCTION public.moderator_create_esports_match(p_match jsonb, p_players jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_match_id uuid;
  v_team uuid;
  v_status text;
  v_entry numeric;
  v_prize numeric;
  v_profit numeric;
  v_management numeric;
  v_players_share numeric;
  v_player jsonb;
  v_player_id uuid;
  v_index integer := 0;
  v_count integer;
BEGIN
  PERFORM public.moderator_access_check('matches','create');
  IF p_match IS NOT NULL AND jsonb_typeof(p_match)='object' THEN
    IF coalesce(nullif(p_match->>'status',''),'upcoming') <> 'upcoming'
      OR coalesce(nullif(p_match->>'entry_fee','')::numeric,0) <> 0
      OR coalesce(nullif(p_match->>'prize_money','')::numeric,0) <> 0
      OR coalesce(nullif(p_match->>'team1_score','')::bigint,0) <> 0
      OR coalesce(nullif(p_match->>'team2_score','')::bigint,0) <> 0
      OR nullif(p_match->>'winner_id','') IS NOT NULL
      OR coalesce(nullif(p_match->>'position','')::integer,0) <> 0
      OR coalesce(nullif(p_match->>'points','')::integer,0) <> 0
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(p_players)='array' THEN p_players ELSE '[]'::jsonb END) j
        WHERE coalesce((j->>'kills')::integer,0)<>0 OR coalesce((j->>'assists')::integer,0)<>0
          OR coalesce((j->>'damage')::integer,0)<>0 OR coalesce((j->>'mvp')::boolean,false)
      )
    THEN PERFORM public.moderator_access_check('matches','approve');
    END IF;
  END IF;

  IF p_match IS NULL OR jsonb_typeof(p_match) <> 'object' THEN
    RAISE EXCEPTION 'Invalid match payload';
  END IF;

  IF p_players IS NULL OR jsonb_typeof(p_players) <> 'array'
      OR jsonb_array_length(p_players) <> 4 THEN
    RAISE EXCEPTION 'Exactly 4 players required';
  END IF;

  SELECT count(DISTINCT x->>'player_id') INTO v_count
  FROM jsonb_array_elements(p_players) AS x;
  IF v_count <> 4 THEN
    RAISE EXCEPTION 'Duplicate players are not allowed';
  END IF;

  v_team := NULLIF(p_match->>'team1_id','')::uuid;
  v_status := COALESCE(NULLIF(p_match->>'status',''), 'upcoming');
  IF v_team IS NULL THEN RAISE EXCEPTION 'Team is required'; END IF;
  IF v_status NOT IN ('upcoming','live','completed') THEN
    RAISE EXCEPTION 'Invalid match status';
  END IF;
  IF NULLIF(p_match->>'match_date','') IS NULL THEN
    RAISE EXCEPTION 'Match date is required';
  END IF;

  v_entry := COALESCE(NULLIF(p_match->>'entry_fee','')::numeric, 0);
  v_prize := COALESCE(NULLIF(p_match->>'prize_money','')::numeric, 0);
  IF v_entry < 0 OR v_prize < 0
    OR v_entry > 999999999999.99 OR v_prize > 999999999999.99
    OR v_entry <> round(v_entry,2) OR v_prize <> round(v_prize,2)
  THEN RAISE EXCEPTION 'Invalid financial amount'; END IF;

  v_profit := v_prize - v_entry;
  v_management := CASE WHEN v_status='completed' THEN round(v_profit*0.30,2) ELSE 0 END;
  v_players_share := CASE WHEN v_status='completed' THEN v_profit-v_management ELSE 0 END;

  SELECT count(DISTINCT p.id) INTO v_count
  FROM public.players p
  WHERE p.team_id = v_team
    AND p.id IN (
      SELECT (x->>'player_id')::uuid FROM jsonb_array_elements(p_players) x
    );
  IF v_count <> 4 THEN
    RAISE EXCEPTION 'All four players must belong to selected team';
  END IF;

  INSERT INTO public.matches (
    tournament_id,team1_id,team2_id,team1_score,team2_score,winner_id,
    match_date,match_type,status,entry_fee,prize_money,profit,
    platform,map,sponsor,notice
  ) VALUES (
    NULLIF(p_match->>'tournament_id','')::uuid,
    v_team,
    NULLIF(p_match->>'team2_id','')::uuid,
    COALESCE(NULLIF(p_match->>'team1_score','')::bigint,0),
    COALESCE(NULLIF(p_match->>'team2_score','')::bigint,0),
    NULLIF(p_match->>'winner_id','')::uuid,
    (p_match->>'match_date')::timestamp,
    COALESCE(p_match->>'match_type','Scrim'),
    'upcoming',v_entry,v_prize,v_profit,
    COALESCE(p_match->>'platform','Free Fire'),
    NULLIF(p_match->>'map',''),NULLIF(p_match->>'sponsor',''),
    NULLIF(p_match->>'notice','')
  ) RETURNING id INTO v_match_id;

  FOR v_player IN SELECT value FROM jsonb_array_elements(p_players)
  LOOP
    v_index := v_index + 1;
    v_player_id := (v_player->>'player_id')::uuid;
    INSERT INTO public.match_players(match_id,player_id,team_id,slot_number)
    VALUES(v_match_id,v_player_id,v_team,v_index);
    INSERT INTO public.match_player_stats(
      match_id,player_id,kills,assists,damage,mvp,placement
    ) VALUES (
      v_match_id,v_player_id,
      COALESCE((v_player->>'kills')::integer,0),
      COALESCE((v_player->>'assists')::integer,0),
      COALESCE((v_player->>'damage')::integer,0),
      COALESCE((v_player->>'mvp')::boolean,false),
      COALESCE(NULLIF(p_match->>'position','')::integer,0)
    );
  END LOOP;

  INSERT INTO public.match_finance(
    match_id,team_id,entry_fee,prize_money,profit,
    management_percentage,management_amount,player_amount
  ) VALUES (
    v_match_id,v_team,v_entry,v_prize,v_profit,30,v_management,v_players_share
  );

  IF v_status='completed' THEN
    INSERT INTO public.match_results(match_id,team_id,position,points)
    VALUES (
      v_match_id,v_team,
      NULLIF(p_match->>'position','')::integer,
      COALESCE(NULLIF(p_match->>'points','')::integer,0)
    );
    INSERT INTO public.team_earnings(match_id,team_id,amount)
    VALUES(v_match_id,v_team,v_management);
  END IF;

  IF v_status <> 'upcoming' THEN
    UPDATE public.matches SET status=v_status WHERE id=v_match_id;
  END IF;

  -- Explicit final reconciliation after all participants and status are saved.
  -- The rebuild function is idempotent per (match_id,player_id).
  -- It also removes earnings for non-completed matches.
  PERFORM public.rebuild_player_earnings(v_match_id);

  IF v_status='completed' AND (
    SELECT count(DISTINCT pe.player_id) FROM public.player_earnings pe
    WHERE pe.match_id=v_match_id
  ) <> 4 THEN
    RAISE EXCEPTION 'Earnings reconciliation failed; match save rolled back';
  END IF;

  INSERT INTO public.moderator_operation_audit(actor_id,section,action,record_id,before_data,after_data)
  VALUES(v_user,'matches','create',v_match_id,NULL,
    jsonb_build_object('id',v_match_id,'status',v_status,'entry_fee',v_entry,
      'prize_money',v_prize,'profit',v_profit,'player_count',4));
  RETURN v_match_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_moderator_grants(p_actor uuid, p_user_id uuid, p_enabled boolean, p_grants jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_old_enabled boolean;
        v_old jsonb;
        v_new jsonb;
        item jsonb;
        section_name text;
        action_name text;
begin
  -- This function may be invoked only from the privileged API after verifying the user's JWT.
  if auth.role() is distinct from 'service_role' then
    raise exception 'Service-role API only' using errcode='42501';
  end if;
  if p_actor is null or p_user_id is null or p_actor=p_user_id then
    raise exception 'Invalid moderator assignment' using errcode='22023';
  end if;
  -- Main Admin is identified by immutable auth.app_metadata, not editable user_metadata/profile alone.
  if not exists (
    select 1 from auth.users u join public.profiles p on p.id=u.id
    where u.id=p_actor and lower(coalesce(u.raw_app_meta_data->>'role',''))='admin'
      and lower(coalesce(p.role,''))='admin'
  ) then raise exception 'Verified main admin required' using errcode='42501'; end if;
  perform 1 from auth.users where id=p_user_id for update;
  if not found then raise exception 'User not found' using errcode='22023'; end if;
  -- Never assign moderator membership to another privileged administrator.
  if exists (select 1 from auth.users u left join public.profiles p on p.id=u.id
             where u.id=p_user_id and
             (lower(coalesce(u.raw_app_meta_data->>'role',''))='admin' or lower(coalesce(p.role,''))='admin')) then
     raise exception 'Admin accounts cannot receive moderator grants' using errcode='42501';end if;
  if jsonb_typeof(p_grants) is distinct from 'array' or jsonb_array_length(p_grants)>60 then
    raise exception 'Invalid grant list' using errcode='22023';
  end if;
  if not p_enabled and jsonb_array_length(p_grants)>0 then
    raise exception 'Disabled moderator must have no permissions' using errcode='22023';
  end if;
  if p_enabled and jsonb_array_length(p_grants)=0 then
    raise exception 'At least one view permission required' using errcode='22023';
  end if;
  for item in select value from jsonb_array_elements(p_grants) loop
    section_name:=item->>'section';action_name:=item->>'action';
    if section_name is null or section_name not in ('matches','players','teams','tournaments','earnings','withdrawals','profit','verification','achievements')
      or action_name is null or action_name not in ('view','create','edit','approve')
      or (action_name='approve' and section_name<>'matches')
      or (section_name not in ('matches','teams','tournaments') and action_name<>'view') then
      raise exception 'Invalid section or action' using errcode='22023';
    end if;
    if action_name<>'view' and not exists (
      select 1 from jsonb_array_elements(p_grants) x
      where x->>'section'=section_name and x->>'action'='view'
    ) then raise exception 'View required' using errcode='22023';end if;
  end loop;
  -- Lock the approved player row until the grant transaction commits.
  -- Without the lock, concurrent deapproval may run its revoke trigger before
  -- a fresh moderator membership is inserted, resurrecting grants on reapproval.
  if p_enabled then
    perform 1 from public.players
      where user_id=p_user_id and status='approved' for share;
    if not found then raise exception 'Approved player required' using errcode='42501';end if;
  end if;
  select enabled into v_old_enabled from public.moderator_accounts where user_id=p_user_id;
  select coalesce(jsonb_agg(jsonb_build_object('section',section,'action',action) order by section,action),'[]'::jsonb)
    into v_old from public.moderator_permissions where user_id=p_user_id;
  insert into public.moderator_accounts(user_id,enabled,granted_by,updated_at)
    values(p_user_id,p_enabled,p_actor,now())
    on conflict(user_id)do update set enabled=excluded.enabled,granted_by=excluded.granted_by,updated_at=now();
  delete from public.moderator_permissions where user_id=p_user_id;
  if p_enabled then
    insert into public.moderator_permissions(user_id,section,action)
    select p_user_id, x.section,x.action from (
      select distinct section,action from jsonb_to_recordset(p_grants) as j(section text,action text)
    ) x;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('section',section,'action',action) order by section,action),'[]'::jsonb)
    into v_new from public.moderator_permissions where user_id=p_user_id;
  insert into public.moderator_permission_audit(actor_id,user_id,old_enabled,new_enabled,old_permissions,new_permissions)
    values(p_actor,p_user_id,v_old_enabled,p_enabled,v_old,v_new);
  return jsonb_build_object('saved',true,'enabled',p_enabled,'grants',v_new);
end;$function$
;

REVOKE ALL ON FUNCTION public.moderator_create_esports_match(jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.moderator_create_esports_match(jsonb,jsonb) TO authenticated;
