-- DRAFT: do not apply to production before security review & integration tests.
-- Moderator means a verified additional membership; profiles.role remains 'player'.
create table if not exists public.moderator_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  granted_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
create table if not exists public.moderator_permissions (
  user_id uuid not null references public.moderator_accounts(user_id) on delete cascade,
  section text not null check(section in ('matches','players','teams','tournaments','earnings','withdrawals','profit','verification','achievements','registration_codes')),
  action text not null check(action in ('view','create','edit','delete','approve','export')),
  primary key(user_id,section,action)
);
create table if not exists public.moderator_permission_audit (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  user_id uuid not null references auth.users(id),
  old_enabled boolean,
  new_enabled boolean not null,
  old_permissions jsonb not null,
  new_permissions jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.moderator_accounts enable row level security;
alter table public.moderator_permissions enable row level security;
alter table public.moderator_permission_audit enable row level security;
revoke all on table public.moderator_accounts,public.moderator_permissions,public.moderator_permission_audit from public,anon,authenticated;
revoke all on sequence public.moderator_permission_audit_id_seq from public,anon,authenticated;

create or replace function public.admin_set_moderator_grants(
  p_actor uuid,p_user_id uuid,p_enabled boolean,p_grants jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
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
      or action_name is null or action_name not in ('view','create','edit')
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
end;$$;
revoke all on function public.admin_set_moderator_grants(uuid,uuid,boolean,jsonb) from public,anon,authenticated;
grant execute on function public.admin_set_moderator_grants(uuid,uuid,boolean,jsonb) to service_role;

-- Blocking follow-up before release: enforce each action on all admin endpoints and
-- prohibit direct moderator use of existing legacy global-role admin RLS paths.

-- Revocation must persist through later re-approval. An approval loss automatically
-- disables the moderator and clears all grants in that same database transaction.
create or replace function public.moderator_deactivate_on_unapproval()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_old_enabled boolean;v_grants jsonb;
begin
 if new.status is distinct from old.status and new.status is distinct from 'approved' then
   select enabled into v_old_enabled from public.moderator_accounts
     where user_id=new.user_id for update;
   if found and v_old_enabled then
     select coalesce(jsonb_agg(jsonb_build_object('section',section,'action',action)),'[]'::jsonb)
       into v_grants from public.moderator_permissions where user_id=new.user_id;
     update public.moderator_accounts set enabled=false,updated_at=now() where user_id=new.user_id;
     delete from public.moderator_permissions where user_id=new.user_id;
     insert into public.moderator_permission_audit(actor_id,user_id,old_enabled,new_enabled,old_permissions,new_permissions)
       values(auth.uid(),new.user_id,true,false,v_grants,'[]'::jsonb);
   end if;
 end if;
 return new;
end;$$;
drop trigger if exists op_moderator_deactivate_on_unapproval on public.players;
create trigger op_moderator_deactivate_on_unapproval
 after update of status on public.players
 for each row execute function public.moderator_deactivate_on_unapproval();
revoke all on function public.moderator_deactivate_on_unapproval() from public,anon,authenticated;
