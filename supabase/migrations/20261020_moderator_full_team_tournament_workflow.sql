-- Reuse the complete Admin team/tournament form with scoped write permissions.
CREATE OR REPLACE FUNCTION public.moderator_create_team_full(p_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $body$
DECLARE v_id uuid;v_actor uuid:=auth.uid();v_year integer;v_name text;v_logo text;v_status text;
BEGIN
 PERFORM public.moderator_access_check('teams','create');
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR octet_length(p_data::text)>12000
 THEN RAISE EXCEPTION 'Invalid team payload' USING errcode='22023';END IF;
 v_name:=btrim(coalesce(p_data->>'team_name',''));
 IF length(v_name)<1 OR length(v_name)>100 THEN RAISE EXCEPTION 'Team name invalid' USING errcode='22023';END IF;
 v_status:=coalesce(nullif(p_data->>'status',''),'active');
 IF v_status NOT IN ('active','pending','inactive') THEN RAISE EXCEPTION 'Invalid team status' USING errcode='22023';END IF;
 v_logo:=nullif(p_data->>'logo','');
 IF v_logo IS NOT NULL AND (length(v_logo)>1000 OR v_logo !~* '^https?://[^ ]+$')
 THEN RAISE EXCEPTION 'Logo must be an HTTP(S) URL' USING errcode='22023';END IF;
 v_year:=nullif(p_data->>'founded_year','')::integer;
 IF v_year IS NOT NULL AND (v_year<1900 OR v_year>2100)
 THEN RAISE EXCEPTION 'Invalid founded year' USING errcode='22023';END IF;
 INSERT INTO public.teams(team_name,logo,description,coach_name,manager_name,country,founded_year,status)
 VALUES(v_name,v_logo,left(coalesce(p_data->>'description',''),1500),left(coalesce(p_data->>'coach_name',''),120),
  left(coalesce(p_data->>'manager_name',''),120),left(coalesce(p_data->>'country',''),100),v_year,v_status)
 RETURNING id INTO v_id;
 INSERT INTO public.moderator_operation_audit(actor_id,section,action,record_id,after_data)
 VALUES(v_actor,'teams','create',v_id,jsonb_build_object('id',v_id,'team_name',v_name,'status',v_status));
 RETURN v_id;
END;$body$;

CREATE OR REPLACE FUNCTION public.moderator_create_tournament_full(p_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $body$
DECLARE v_id uuid;v_actor uuid:=auth.uid();v_name text;v_status text;v_prize numeric;v_fee numeric;
v_start date;v_end date;v_deadline date;v_max integer;v_banner text;
BEGIN
 PERFORM public.moderator_access_check('tournaments','create');
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR octet_length(p_data::text)>12000
 THEN RAISE EXCEPTION 'Invalid tournament payload' USING errcode='22023';END IF;
 v_name:=btrim(coalesce(p_data->>'name',''));
 IF length(v_name)<1 OR length(v_name)>150 THEN RAISE EXCEPTION 'Invalid tournament name' USING errcode='22023';END IF;
 v_status:=coalesce(nullif(p_data->>'status',''),'upcoming');
 IF v_status NOT IN ('upcoming','ongoing','completed') THEN RAISE EXCEPTION 'Invalid tournament status' USING errcode='22023';END IF;
 v_prize:=coalesce(nullif(p_data->>'prize_pool','')::numeric,0);
 v_fee:=coalesce(nullif(p_data->>'entry_fee','')::numeric,0);
 IF v_prize<0 OR v_fee<0 OR v_prize>999999999.99 OR v_fee>999999999.99
   OR v_prize<>round(v_prize,2) OR v_fee<>round(v_fee,2)
 THEN RAISE EXCEPTION 'Invalid prize pool / entry fee' USING errcode='22023';END IF;
 IF v_status<>'upcoming' OR v_prize<>0 OR v_fee<>0 THEN
  PERFORM public.moderator_access_check('tournaments','approve');
 END IF;
 v_start:=nullif(p_data->>'start_date','')::date;
 v_end:=nullif(p_data->>'end_date','')::date;
 v_deadline:=nullif(p_data->>'registration_deadline','')::date;
 IF v_start IS NOT NULL AND v_end IS NOT NULL AND v_end<v_start THEN RAISE EXCEPTION 'Invalid date order' USING errcode='22023';END IF;
 IF v_start IS NOT NULL AND v_deadline IS NOT NULL AND v_deadline>v_start THEN RAISE EXCEPTION 'Registration deadline after start' USING errcode='22023';END IF;
 v_max:=coalesce(nullif(p_data->>'max_teams','')::integer,30);
 IF v_max<1 OR v_max>512 THEN RAISE EXCEPTION 'Invalid max teams' USING errcode='22023';END IF;
 v_banner:=nullif(p_data->>'banner','');
 IF v_banner IS NOT NULL AND (length(v_banner)>1000 OR v_banner !~* '^https?://[^ ]+$')
 THEN RAISE EXCEPTION 'Banner must be HTTP(S) URL' USING errcode='22023';END IF;
 INSERT INTO public.tournaments(name,banner,description,prize_pool,entry_fee,start_date,end_date,
  registration_deadline,max_teams,status,organizer_id)
 VALUES(v_name,v_banner,left(coalesce(p_data->>'description',''),1500),v_prize,v_fee,v_start,v_end,
  v_deadline,v_max,v_status,v_actor)
 RETURNING id INTO v_id;
 INSERT INTO public.moderator_operation_audit(actor_id,section,action,record_id,after_data)
 VALUES(v_actor,'tournaments','create',v_id,jsonb_build_object('id',v_id,'name',v_name,
  'status',v_status,'prize_pool',v_prize,'entry_fee',v_fee));
 RETURN v_id;
END;$body$;

-- Approve may now be granted for tournament finance separately from Create/Edit.
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
      or (action_name='approve' and section_name NOT IN ('matches','tournaments'))
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
end;$function$;

REVOKE ALL ON FUNCTION public.moderator_create_team_full(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.moderator_create_tournament_full(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.moderator_create_team_full(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderator_create_tournament_full(jsonb) TO authenticated;
