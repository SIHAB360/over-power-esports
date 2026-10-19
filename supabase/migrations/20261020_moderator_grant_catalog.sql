-- Expanded rights, one action for each audited operational API.
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
    -- Each capability is grantable only if a separately checked moderator operation exists.
    if section_name IS NULL OR action_name IS NULL
      OR NOT (
        (section_name='matches' AND action_name IN ('view','create','edit','delete','approve')) OR
        (section_name='players' AND action_name IN ('view','approve')) OR
        (section_name='teams' AND action_name IN ('view','create','edit')) OR
        (section_name='tournaments' AND action_name IN ('view','create','edit','approve')) OR
        (section_name='earnings' AND action_name='view') OR
        (section_name='withdrawals' AND action_name IN ('view','approve','edit')) OR
        (section_name='profit' AND action_name IN ('view','delete')) OR
        (section_name='verification' AND action_name='view') OR
        (section_name='achievements' AND action_name IN ('view','create','edit','delete','approve')) OR
        (section_name='registration_codes' AND action_name='view')
      ) THEN
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