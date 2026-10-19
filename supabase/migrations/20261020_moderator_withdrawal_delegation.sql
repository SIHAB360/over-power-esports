-- Moderator-specific financial payout approval and manual settlement, preserving all original accounting locks.
CREATE OR REPLACE FUNCTION public.moderator_review_player_withdrawal(p_request_id uuid, p_decision text, p_rejection_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_admin uuid := auth.uid();
  v_player uuid;
  v_status text;
  v_decision text := lower(btrim(coalesce(p_decision,'')));
  v_reason text := nullif(btrim(coalesce(p_rejection_reason,'')),'');
begin
  perform public.moderator_access_check('withdrawals','approve');

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
  insert into public.moderator_operation_audit(actor_id,section,action,record_id,after_data)
  values(v_admin,'withdrawals','approve',p_request_id,
    jsonb_build_object('id',p_request_id,'status',v_decision));
  return jsonb_build_object('ok',true,'status',v_decision,'request_id',p_request_id);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.moderator_confirm_manual_withdrawal(p_request_id uuid, p_transfer_fee numeric, p_transaction_reference text, p_payment_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  perform public.moderator_access_check('withdrawals','edit');

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

  insert into public.moderator_operation_audit(actor_id,section,action,record_id,after_data)
  values(v_admin,'withdrawals','edit',p_request_id,
    jsonb_build_object('id',p_request_id,'status','paid'));
  return jsonb_build_object('ok',true,'status','paid','request_id',p_request_id,
    'gross_amount',v_amount,'transfer_fee',p_transfer_fee,'net_payout',v_net);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.moderator_withdrawal_queue(p_status text DEFAULT NULL, p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $function$
DECLARE v_visible boolean;v_rows jsonb;v_total integer;v_counts jsonb;
BEGIN
 PERFORM public.moderator_access_check('withdrawals','view');
 IF (p_status IS NOT NULL AND p_status NOT IN ('pending','approved','paid','rejected'))
 OR p_offset<0 OR p_offset>250000 THEN RAISE EXCEPTION 'Invalid paging/filter' USING errcode='22023';END IF;
 SELECT EXISTS(SELECT 1 FROM public.moderator_permissions mp
    WHERE mp.user_id=auth.uid() AND mp.section='withdrawals' AND mp.action='edit') INTO v_visible;
 SELECT count(*) INTO v_total FROM public.withdrawal_requests w WHERE p_status IS NULL OR w.status=p_status;
 SELECT jsonb_build_object('pending',count(*) FILTER(WHERE status='pending'),
   'approved',count(*) FILTER(WHERE status='approved'),'paid',count(*) FILTER(WHERE status='paid'),
   'rejected',count(*) FILTER(WHERE status='rejected')) INTO v_counts FROM public.withdrawal_requests;
 SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) INTO v_rows FROM(
 SELECT w.id,w.player_id,w.amount,w.status,w.provider,w.transfer_fee,w.net_payout,w.created_at,
        w.updated_at,w.reviewed_at,w.paid_at,w.rejection_reason,
        CASE WHEN v_visible THEN w.receiver_number ELSE NULL::text END AS receiver_number,
        CASE WHEN v_visible THEN w.transaction_reference ELSE NULL::text END AS transaction_reference,
        CASE WHEN v_visible THEN w.payment_note ELSE NULL::text END AS payment_note,
        coalesce(p.ign,p.full_name,'Player') AS player_name
 FROM public.withdrawal_requests w LEFT JOIN public.players p ON p.id=w.player_id
 WHERE p_status IS NULL OR w.status=p_status
 ORDER BY w.created_at DESC LIMIT 25 OFFSET p_offset
 ) t;
 RETURN jsonb_build_object('requests',v_rows,'total',v_total,'counts',v_counts,
    'can_review',EXISTS(SELECT 1 FROM public.moderator_permissions mp WHERE mp.user_id=auth.uid() AND mp.section='withdrawals' AND mp.action='approve'),
    'can_pay',v_visible);
END;$function$;

REVOKE ALL ON FUNCTION public.moderator_review_player_withdrawal(uuid,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.moderator_confirm_manual_withdrawal(uuid,numeric,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.moderator_withdrawal_queue(text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.moderator_review_player_withdrawal(uuid,text,text),
 public.moderator_confirm_manual_withdrawal(uuid,numeric,text,text),
 public.moderator_withdrawal_queue(text,integer) TO authenticated;