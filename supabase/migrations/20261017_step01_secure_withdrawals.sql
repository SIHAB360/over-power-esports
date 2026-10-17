-- OVER POWER ESPORTS • Withdrawal Foundation / STEP 01
-- REVIEWED DESIGN: personal bKash/Nagad; admin sends money manually.
-- IMPORTANT: Apply ONLY after confirmed off-platform recovery-capable backup/PITR.
-- No existing player_earnings, matches, or withdrawal rows are mutated.
-- One active (pending/approved) request per player.
-- The gross requested amount is debited from the wallet on Paid,
-- transfer fee is borne by the player, and net sent = gross - actual fee.
-- No invented minimum: NULL means only >0 and available balance checks.
begin;

alter table public.withdrawal_requests
  add column if not exists provider text,
  add column if not exists receiver_number text,
  add column if not exists transfer_fee numeric(14,2),
  add column if not exists net_payout numeric(14,2),
  add column if not exists transaction_reference text,
  add column if not exists reviewed_by uuid,
  add column if not exists paid_by uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists rejection_reason text,
  add column if not exists payment_note text;

alter table public.withdrawal_requests
  add constraint op_withdrawal_provider_chk
    check (provider is null or provider in ('bkash','nagad')),
  add constraint op_withdrawal_receiver_chk
    check (receiver_number is null or receiver_number ~ '^01[3-9][0-9]{8}$'),
  add constraint op_withdrawal_fee_chk
    check (transfer_fee is null or (transfer_fee >= 0 and transfer_fee <= amount)),
  add constraint op_withdrawal_net_chk
    check (net_payout is null or (net_payout > 0 and net_payout <= amount)),
  add constraint op_withdrawal_paid_complete_chk
    check (status <> 'paid' or (
      provider is not null
      and receiver_number is not null
      and transfer_fee is not null
      and net_payout = (amount - transfer_fee)
      and paid_at is not null
      and paid_by is not null
      and nullif(btrim(transaction_reference),'') is not null
    ));

-- Fails migration if active duplicates already exist, rather than silently
-- altering them; current verified record count is zero.
create unique index if not exists op_one_active_withdrawal_per_player
  on public.withdrawal_requests(player_id)
  where status in ('pending','approved');

create unique index if not exists op_provider_transaction_unique
  on public.withdrawal_requests(provider, upper(btrim(transaction_reference)))
  where status='paid' and transaction_reference is not null;

-- One editable operational setting row, no arbitrary minimum is applied.
create table if not exists public.withdrawal_rules (
  id smallint primary key default 1 check (id=1),
  minimum_amount numeric(14,2) null check (minimum_amount is null or minimum_amount>0),
  fee_bearer text not null default 'player' check (fee_bearer='player'),
  max_active_requests smallint not null default 1 check (max_active_requests=1),
  updated_at timestamptz not null default now()
);
insert into public.withdrawal_rules(id,minimum_amount,fee_bearer,max_active_requests)
values (1,null,'player',1) on conflict (id) do nothing;
alter table public.withdrawal_rules enable row level security;
revoke all on public.withdrawal_rules from public,anon,authenticated;
-- Authenticated users never write payout settings directly. Both RPCs
-- below read them as SECURITY DEFINER.

create table if not exists public.withdrawal_audit_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.withdrawal_requests(id) on delete restrict,
  event_type text not null check (event_type in ('requested','approved','rejected','paid')),
  actor_user_id uuid not null,
  status_after text not null,
  created_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);
create index if not exists op_withdrawal_audit_request_idx
  on public.withdrawal_audit_events(request_id,created_at);
alter table public.withdrawal_audit_events enable row level security;
revoke all on public.withdrawal_audit_events from public,anon,authenticated;
grant select on public.withdrawal_audit_events to authenticated;
create policy op_withdrawal_audit_player_select
  on public.withdrawal_audit_events for select to authenticated
  using (exists (
    select 1 from public.withdrawal_requests w
    join public.players p on p.id=w.player_id
    where w.id=request_id and p.user_id=auth.uid()
  ));
create policy op_withdrawal_audit_admin_select
  on public.withdrawal_audit_events for select to authenticated
  using (exists (
    select 1 from public.profiles pf
    where pf.id=auth.uid() and lower(pf.role)='admin'
  ));

-- PATCH: the historic unconditional earnings INSERT policy can allow
-- arbitrary authenticated users to fake wallet income.
drop policy if exists "Allow insert player earnings" on public.player_earnings;
-- Other non-SELECT earnings mutations are reserved for trusted definer
-- functions. Existing create_esports_match/rebuild_player_earnings run as postgres.
drop policy if exists "Admin manage player earnings" on public.player_earnings;
create policy op_admin_read_player_earnings
  on public.player_earnings for select to authenticated
  using (public.is_admin_or_moderator());
-- No direct earnings INSERT/UPDATE/DELETE for authenticated users.
-- Remove public execute on privileged rebuild helper; trusted definer
-- creates/updates earnings internally.
revoke all on function public.rebuild_player_earnings(uuid)
  from public,anon,authenticated;
-- A legacy request RPC without bKash/Nagad recipient cannot be used.
revoke all on function public.request_player_withdrawal(numeric)
  from public,anon,authenticated;
-- A legacy admin RPC could mark Paid without payment evidence.
revoke all on function public.admin_process_withdrawal(uuid,text)
  from public,anon,authenticated;

create or replace function public.request_player_withdrawal_v2(
  p_amount numeric,
  p_provider text,
  p_receiver_number text
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
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
$$;
revoke all on function public.request_player_withdrawal_v2(numeric,text,text)
  from public,anon;
grant execute on function public.request_player_withdrawal_v2(numeric,text,text)
  to authenticated;

create or replace function public.admin_review_player_withdrawal(
  p_request_id uuid,
  p_decision text,
  p_rejection_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_admin uuid := auth.uid();
  v_player uuid;
  v_status text;
  v_decision text := lower(btrim(coalesce(p_decision,'')));
  v_reason text := nullif(btrim(coalesce(p_rejection_reason,'')),'');
begin
  if v_admin is null or not exists(
    select 1 from public.profiles pf
    where pf.id=v_admin and lower(pf.role)='admin'
  ) then raise exception 'Admin required' using errcode='42501'; end if;

  if v_decision not in ('approved','rejected') then
    raise exception 'Invalid withdrawal decision' using errcode='22023';
  end if;
  if v_decision='rejected' and (v_reason is null or length(v_reason)>350) then
    raise exception 'Provide a rejection reason (up to 350 characters)' using errcode='22023';
  end if;

  select w.player_id into v_player
  from public.withdrawal_requests w where w.id=p_request_id;
  if not found then raise exception 'Withdrawal not found' using errcode='P0002'; end if;

  -- Consistent per-player lock order across request, review and payment.
  perform 1 from public.players where id=v_player for update;
  select w.status into v_status
  from public.withdrawal_requests w where w.id=p_request_id for update;
  if not found then raise exception 'Withdrawal not found' using errcode='P0002'; end if;
  if v_decision='approved' and v_status<>'pending' then
    raise exception 'Only pending requests can be approved';
  end if;
  if v_decision='rejected' and v_status not in ('pending','approved') then
    raise exception 'Only active requests can be rejected';
  end if;

  update public.withdrawal_requests
  set status=v_decision,
      reviewed_by=v_admin,
      reviewed_at=now(),
      processed_at=now(),
      updated_at=now(),
      rejection_reason=case when v_decision='rejected' then v_reason else null end
  where id=p_request_id;

  insert into public.withdrawal_audit_events(
    request_id,event_type,actor_user_id,status_after,details
  ) values (
    p_request_id,v_decision,v_admin,v_decision,
    case when v_decision='rejected' then jsonb_build_object('reason',v_reason) else '{}'::jsonb end
  );
  return jsonb_build_object('ok',true,'status',v_decision,'request_id',p_request_id);
end;
$$;
revoke all on function public.admin_review_player_withdrawal(uuid,text,text)
  from public,anon;
grant execute on function public.admin_review_player_withdrawal(uuid,text,text)
  to authenticated;

create or replace function public.admin_confirm_manual_withdrawal(
  p_request_id uuid,
  p_transfer_fee numeric,
  p_transaction_reference text,
  p_payment_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_admin uuid := auth.uid();
  v_player uuid;
  v_status text;
  v_amount numeric;
  v_provider text;
  v_number text;
  v_reference text := btrim(coalesce(p_transaction_reference,''));
  v_note text := nullif(btrim(coalesce(p_payment_note,'')),'');
  v_net numeric;
begin
  if v_admin is null or not exists(
    select 1 from public.profiles pf
    where pf.id=v_admin and lower(pf.role)='admin'
  ) then raise exception 'Admin required' using errcode='42501'; end if;

  if p_transfer_fee is null or p_transfer_fee<0
     or p_transfer_fee<>round(p_transfer_fee,2) then
    raise exception 'Invalid transfer fee' using errcode='22023'; end if;
  if length(v_reference)<5 or length(v_reference)>100 then
    raise exception 'A valid provider transaction reference is required'
      using errcode='22023'; end if;
  if v_note is not null and length(v_note)>500 then
    raise exception 'Payment note is too long' using errcode='22023'; end if;

  select w.player_id into v_player
  from public.withdrawal_requests w where w.id=p_request_id;
  if not found then raise exception 'Withdrawal not found' using errcode='P0002'; end if;

  perform 1 from public.players where id=v_player for update;
  select w.status,w.amount,w.provider,w.receiver_number
  into v_status,v_amount,v_provider,v_number
  from public.withdrawal_requests w where w.id=p_request_id for update;
  if v_status<>'approved' then
    raise exception 'Only approved requests can be marked Paid';
  end if;
  if v_provider is null or v_number is null then
    raise exception 'Payment destination missing';
  end if;
  v_net:=v_amount-p_transfer_fee;
  if v_net<=0 then
    raise exception 'Fee must be less than the requested amount' using errcode='22023';
  end if;

  -- Do not contact bKash/Nagad from SQL. Admin must manually send to
  -- the exact destination and verify the transaction reference first.
  update public.withdrawal_requests
  set status='paid',
      transfer_fee=p_transfer_fee,
      net_payout=v_net,
      transaction_reference=v_reference,
      payment_note=v_note,
      paid_by=v_admin,
      paid_at=now(),
      processed_at=now(),
      updated_at=now()
  where id=p_request_id;

  insert into public.withdrawal_audit_events(
    request_id,event_type,actor_user_id,status_after,details
  ) values(
    p_request_id,'paid',v_admin,'paid',
    jsonb_build_object('gross_amount',v_amount,'fee',p_transfer_fee,'net_paid',v_net)
  );

  return jsonb_build_object('ok',true,'status','paid','request_id',p_request_id,
    'gross_amount',v_amount,'transfer_fee',p_transfer_fee,'net_payout',v_net);
end;
$$;
revoke all on function public.admin_confirm_manual_withdrawal(uuid,numeric,text,text)
  from public,anon;
grant execute on function public.admin_confirm_manual_withdrawal(uuid,numeric,text,text)
  to authenticated;

commit;
