-- OP ESPORTS / Step 01: player-wise Admin-controlled withdrawal permission.
-- STAGING ONLY pending a verified backup and separate production approval.
-- The absence of an access row is always treated as LOCKED (deny by default).
-- No changes to existing player, earnings or withdrawal rows.
begin;

create table if not exists public.player_withdrawal_access (
  player_id uuid primary key references public.players(id) on delete cascade,
  enabled boolean not null default false,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  reason text check (reason is null or length(reason) <= 250)
);
alter table public.player_withdrawal_access enable row level security;
revoke all on public.player_withdrawal_access from public,anon,authenticated;
grant select on public.player_withdrawal_access to authenticated;
create policy op_withdrawal_access_player_read
  on public.player_withdrawal_access for select to authenticated
  using (exists (
    select 1 from public.players p
    where p.id=player_id and p.user_id=auth.uid()
  ));
create policy op_withdrawal_access_admin_read
  on public.player_withdrawal_access for select to authenticated
  using (exists (
    select 1 from public.profiles pf where pf.id=auth.uid()
      and lower(pf.role)='admin'
  ));

-- Intentionally leave player_id without a foreign key so deleting an
-- account cannot erase the immutable security audit history.
create table if not exists public.player_withdrawal_access_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null,
  actor_user_id uuid not null,
  previous_enabled boolean not null,
  enabled boolean not null,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists op_access_events_player_time_idx
  on public.player_withdrawal_access_events(player_id,created_at desc);
alter table public.player_withdrawal_access_events enable row level security;
revoke all on public.player_withdrawal_access_events from public,anon,authenticated;
grant select on public.player_withdrawal_access_events to authenticated;
create policy op_access_events_admin_read
  on public.player_withdrawal_access_events for select to authenticated
  using (exists (
    select 1 from public.profiles pf where pf.id=auth.uid()
      and lower(pf.role)='admin'
  ));
-- No INSERT/UPDATE/DELETE policy or privilege for browser roles.

create or replace function public.admin_set_player_withdrawal_access(
  p_player_id uuid, p_enabled boolean, p_reason text default null
)
returns jsonb language plpgsql security definer set search_path=''
as $admin_access$
declare
  v_admin uuid := auth.uid();
  v_old boolean;
  v_reason text := nullif(btrim(coalesce(p_reason,'')),'');
begin
  if v_admin is null or not exists (
    select 1 from public.profiles pf
    where pf.id=v_admin and lower(pf.role)='admin'
  ) then
    raise exception 'Only administrators can change withdrawal access'
      using errcode='42501';
  end if;
  if p_player_id is null or p_enabled is null then
    raise exception 'A player and enabled state are required'
      using errcode='22023';
  end if;
  if length(coalesce(v_reason,''))>250 then
    raise exception 'Reason too long' using errcode='22023';
  end if;
  -- Same lock as request_player_withdrawal_v2(): toggles and requests are
  -- serialized, so OFF cannot be raced by a stale frontend/API request.
  perform 1 from public.players where id=p_player_id for update;
  if not found then
    raise exception 'Player does not exist' using errcode='22023';
  end if;

  select enabled into v_old
  from public.player_withdrawal_access
  where player_id=p_player_id;
  v_old:=coalesce(v_old,false);

  if v_old is distinct from p_enabled then
    insert into public.player_withdrawal_access(
      player_id,enabled,updated_by,updated_at,reason
    ) values(p_player_id,p_enabled,v_admin,now(),v_reason)
    on conflict(player_id) do update set
      enabled=excluded.enabled,
      updated_by=excluded.updated_by,
      updated_at=excluded.updated_at,
      reason=excluded.reason;

    insert into public.player_withdrawal_access_events(
      player_id,actor_user_id,previous_enabled,enabled,reason
    ) values(p_player_id,v_admin,v_old,p_enabled,v_reason);
  end if;

  return jsonb_build_object(
    'player_id',p_player_id,'enabled',p_enabled,
    'changed',v_old is distinct from p_enabled
  );
end;
$admin_access$;
revoke all on function public.admin_set_player_withdrawal_access(uuid,boolean,text)
  from public,anon,authenticated;
grant execute on function public.admin_set_player_withdrawal_access(uuid,boolean,text)
  to authenticated;

-- Replace existing production function byte-for-byte except for a deny-
-- by-default check immediately after the approved player row is locked.
-- Do not touch fee calculation, accounting, audit trail or request validation.
CREATE OR REPLACE FUNCTION public.request_player_withdrawal_v2(p_amount numeric, p_provider text, p_receiver_number text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid := auth.uid();
  v_player uuid;
  v_available numeric;
  v_min numeric;
  v_provider text := lower(btrim(coalesce(p_provider,'')));
  v_number text := regexp_replace(coalesce(p_receiver_number,''), '\s+', '', 'g');
  v_request uuid;
begin
  if v_user is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;
  if p_amount is null or p_amount<=0 or p_amount>999999999999.99
     or p_amount<>round(p_amount,2) then
    raise exception 'Invalid withdrawal amount' using errcode='22023';
  end if;
  if v_provider not in ('bkash','nagad') then
    raise exception 'Choose bKash or Nagad' using errcode='22023';
  end if;
  if v_number !~ '^01[3-9][0-9]{8}$' then
    raise exception 'Enter an 11-digit Bangladesh wallet number' using errcode='22023';
  end if;

  select p.id into v_player
  from public.players p
  where p.user_id=v_user and p.status='approved'
  for update;
  if not found then
    raise exception 'Approved player profile required' using errcode='42501';
  end if;

  -- Post-lock authoritative check: never trust the browser toggle.
  -- A missing permission record is LOCKED by default; the same player-row
  -- lock is acquired in admin_set_player_withdrawal_access().
  if not coalesce(
    (select a.enabled from public.player_withdrawal_access a
     where a.player_id = v_player), false
  ) then
    raise exception 'Withdrawal access is locked by admin' using errcode='42501';
  end if;

  select minimum_amount into v_min from public.withdrawal_rules where id=1;
  if not found then
    raise exception 'Withdrawal rules are not configured';
  end if;
  if v_min is not null and p_amount<v_min then
    raise exception 'Withdrawal below current minimum amount';
  end if;
  if exists(
    select 1 from public.withdrawal_requests w
    where w.player_id=v_player and w.status in ('pending','approved')
  ) then
    raise exception 'Finish the existing withdrawal before requesting another';
  end if;

  select b.available_balance into v_available
  from public.get_player_wallet_balance(v_player) b;
  if coalesce(v_available,0)<p_amount then
    raise exception 'Insufficient available balance';
  end if;

  insert into public.withdrawal_requests(
    player_id,amount,status,provider,receiver_number
  ) values (v_player,p_amount,'pending',v_provider,v_number)
  returning id into v_request;

  insert into public.withdrawal_audit_events(
    request_id,event_type,actor_user_id,status_after
  ) values (v_request,'requested',v_user,'pending');

  return v_request;
end;
$function$

revoke all on function public.request_player_withdrawal_v2(numeric,text,text)
  from public,anon,authenticated;
grant execute on function public.request_player_withdrawal_v2(numeric,text,text)
  to authenticated;

commit;
