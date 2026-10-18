-- Admin Toggle • Isolated PostgreSQL security integration checks.
-- Never apply this SQL to the production Supabase project.
-- Every mutation happens in the disposable GitHub Actions postgres:17 service.
\set ON_ERROR_STOP on
DO $tests$
DECLARE
  v_user uuid;
  v_player uuid;
  v_admin uuid;
  v_total numeric;
  v_available numeric;
  v_after numeric;
  v_request1 uuid;
  v_request2 uuid;
  v_denied boolean;
  v_status text;
  v_fee numeric;
  v_net numeric;
  v_audits int;
  v_access_events int;
BEGIN
  -- Verify copy mirrors exact live row-count preflight (read-only baseline).
  IF (SELECT count(*) FROM public.players) <> 9 THEN
    RAISE EXCEPTION 'Player count does not match source backup baseline';
  END IF;
  IF (SELECT count(*) FROM public.player_earnings) <> 76 THEN
    RAISE EXCEPTION 'Earnings count does not match source backup baseline';
  END IF;
  IF (SELECT count(*) FROM public.withdrawal_requests) <> 0 THEN
    RAISE EXCEPTION 'Expected no historical withdrawals in source clone';
  END IF;
  IF EXISTS (
    SELECT user_id FROM public.players WHERE user_id IS NOT NULL
    GROUP BY user_id HAVING count(*) > 1
  ) THEN RAISE EXCEPTION 'Duplicate wallet owners'; END IF;

  IF has_column_privilege('authenticated','public.profiles','role','UPDATE')
     OR has_column_privilege('authenticated','public.profiles','role','INSERT')
  THEN RAISE EXCEPTION 'Self-escalation of profile role is still possible'; END IF;
  IF has_table_privilege('authenticated','public.player_earnings','INSERT')
    OR has_table_privilege('authenticated','public.player_earnings','UPDATE')
    OR has_table_privilege('authenticated','public.player_earnings','TRUNCATE')
  THEN RAISE EXCEPTION 'Direct manipulation of wallet source is still granted'; END IF;
  IF has_table_privilege('anon','public.matches','INSERT')
    OR has_table_privilege('anon','public.match_players','INSERT')
  THEN RAISE EXCEPTION 'Anonymous match source injection still permitted'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND
    ((tablename='matches' AND policyname='Anyone can create matches')
     OR (tablename='match_players' AND policyname='Anyone can add match players')
     OR (tablename='match_player_stats' AND policyname='Allow insert match player stats'))
  ) THEN RAISE EXCEPTION 'Untrusted public INSERT policies were not removed'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public'
      AND indexname='op_one_active_withdrawal_per_player'
  ) THEN RAISE EXCEPTION 'Missing one-active-withdrawal DB guard'; END IF;

  SELECT id INTO v_admin FROM public.profiles
    WHERE lower(role)='admin' LIMIT 1;
  IF v_admin IS NULL THEN RAISE EXCEPTION 'No admin fixture in restored DB'; END IF;

  -- Choose an approved player with >0.20 BDT positive net from the local clone.
  -- computed earned balance; do not reveal PII/UUIDs in the CI logs.
  SELECT p.id,p.user_id,SUM(pe.amount)
    INTO v_player,v_user,v_total
  FROM public.players p
  JOIN public.player_earnings pe ON pe.player_id=p.id
  JOIN public.matches m ON m.id=pe.match_id AND m.status='completed'
  WHERE p.user_id IS NOT NULL AND p.status='approved'
  GROUP BY p.id,p.user_id HAVING SUM(pe.amount)>0.2
  ORDER BY SUM(pe.amount) DESC
  LIMIT 1;
  IF v_player IS NULL THEN
    RAISE EXCEPTION 'No eligible positive-balance player for end-to-end smoke test';
  END IF;

  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
  SELECT available_balance INTO v_available
    FROM public.get_player_wallet_balance(v_player);
  IF v_available <= 0.2 THEN RAISE EXCEPTION 'Wallet has insufficient test balance'; END IF;


  -- The default-deny database guard must reject every player not explicitly
  -- enabled by an administrator, even if they bypass the browser button.
  IF EXISTS (SELECT 1 FROM public.player_withdrawal_access WHERE enabled) THEN
    RAISE EXCEPTION 'Player access unexpectedly starts enabled';
  END IF;
  IF has_table_privilege('authenticated','public.player_withdrawal_access','UPDATE')
    OR has_table_privilege('authenticated','public.player_withdrawal_access','INSERT')
    OR has_table_privilege('authenticated','public.player_withdrawal_access_events','INSERT')
  THEN RAISE EXCEPTION 'Direct client security toggle/audit writing is allowed'; END IF;
  v_denied := false;
  BEGIN
    PERFORM public.request_player_withdrawal_v2(0.1,'bkash','01700000000');
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Withdrawal access is locked by admin%' THEN
      RAISE;
    END IF;
    v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Default-locked player could withdraw'; END IF;
  v_denied := false;
  BEGIN
    PERFORM public.admin_set_player_withdrawal_access(v_player,true,'Player forged admin toggle');
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'A player enabled their own withdrawal access'; END IF;

  PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
  PERFORM public.admin_set_player_withdrawal_access(v_player,true,'Admin test enable');
  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
  v_request1 := public.request_player_withdrawal_v2(0.1,'bkash','01700000000');
  SELECT available_balance INTO v_after
    FROM public.get_player_wallet_balance(v_player);
  IF v_after IS DISTINCT FROM v_available - 0.1 THEN
    RAISE EXCEPTION 'Reservation did not debit available balance';
  END IF;

  v_denied := false;
  BEGIN
    PERFORM public.request_player_withdrawal_v2(0.1,'nagad','01800000000');
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Duplicate active withdrawal was accepted'; END IF;

  v_denied := false;
  BEGIN
    PERFORM public.admin_review_player_withdrawal(v_request1,'approved',null);
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Player performed unauthorized admin approval'; END IF;

  PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
  PERFORM public.admin_review_player_withdrawal(v_request1,'rejected','Isolated test rejection');
  SELECT status INTO v_status FROM public.withdrawal_requests WHERE id=v_request1;
  IF v_status <> 'rejected' THEN RAISE EXCEPTION 'Admin reject failed'; END IF;

  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
  SELECT available_balance INTO v_after
    FROM public.get_player_wallet_balance(v_player);
  IF v_after IS DISTINCT FROM v_available THEN
    RAISE EXCEPTION 'Rejected reservation did not release wallet funds';
  END IF;


  -- Rejecting a request returns the reserved amount, but locking withdrawal
  -- access must still block the NEXT request until an admin toggles it back.
  PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
  PERFORM public.admin_set_player_withdrawal_access(v_player,false,'Security lock test');
  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
  v_denied := false;
  BEGIN
    PERFORM public.request_player_withdrawal_v2(0.1,'nagad','01800000000');
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Withdrawal access is locked by admin%' THEN
      RAISE;
    END IF;
    v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Admin-disabled player bypassed wallet lock'; END IF;
  PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
  PERFORM public.admin_set_player_withdrawal_access(v_player,true,'Security unlock test');
  -- Repeating same state must not create an extra audit record.
  PERFORM public.admin_set_player_withdrawal_access(v_player,true,'Repeated enable test');
  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
  v_request2 := public.request_player_withdrawal_v2(0.1,'nagad','01800000000');
  PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);

  v_denied := false;
  BEGIN
    PERFORM public.admin_confirm_manual_withdrawal(v_request2,0.01,'LOCAL-TEST-ONLY');
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Pending request was marked Paid without approval'; END IF;

  PERFORM public.admin_review_player_withdrawal(v_request2,'approved',null);
  v_denied := false;
  BEGIN
    PERFORM public.admin_confirm_manual_withdrawal(v_request2,0.1,'LOCAL-TEST-ONLY');
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Fee equal to requested amount was accepted'; END IF;

  PERFORM public.admin_confirm_manual_withdrawal(v_request2,0.01,'LOCAL-TEST-ONLY');
  SELECT status,transfer_fee,net_payout INTO v_status,v_fee,v_net
    FROM public.withdrawal_requests WHERE id=v_request2;
  IF v_status <> 'paid' OR v_fee <> 0.01 OR v_net <> 0.09 THEN
    RAISE EXCEPTION 'Manual payment net/gross accounting incorrect';
  END IF;

  v_denied := false;
  BEGIN
    PERFORM public.admin_confirm_manual_withdrawal(v_request2,0.01,'LOCAL-TEST-ONLY');
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Duplicate Paid confirmation accepted'; END IF;

  SELECT count(*) INTO v_audits FROM public.withdrawal_audit_events
  WHERE request_id IN (v_request1,v_request2);
  IF v_audits <> 5 THEN
    RAISE EXCEPTION 'Expected 5 immutable audit lifecycle events; got %',v_audits;
  END IF;
  SELECT count(*) INTO v_access_events
  FROM public.player_withdrawal_access_events WHERE player_id=v_player;
  IF v_access_events <> 3 THEN
    RAISE EXCEPTION 'Expected exactly three toggle events; got %',v_access_events;
  END IF;

  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
  SELECT available_balance INTO v_after
    FROM public.get_player_wallet_balance(v_player);
  IF v_after IS DISTINCT FROM v_available - 0.1 THEN
    RAISE EXCEPTION 'Paid transaction was not debited exactly once';
  END IF;

  -- No PII, transaction ID, or wallet number is printed.
  RAISE NOTICE 'PASS: default-locked security, admin-only toggle, re-lock, re-enable, immutable audit and legacy wallet accounting';
END;
$tests$;


-- Exercise actual RLS and column grants as non-privileged roles.
-- This is a disposable copy; all writes below run inside ROLLBACK.
BEGIN;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT p.user_id::text FROM public.players p
   JOIN public.player_earnings pe ON pe.player_id=p.id
   JOIN public.profiles pf ON pf.id=p.user_id
   WHERE pf.role='player' AND p.user_id IS NOT NULL LIMIT 1),
  true
);
SET LOCAL ROLE authenticated;

DO $rls$
DECLARE
  denied boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'RLS fixture user is missing';
  END IF;

  denied:=false;
  BEGIN
    UPDATE public.profiles SET role='admin' WHERE id=auth.uid();
  EXCEPTION WHEN OTHERS THEN denied:=true;
  END;
  IF NOT denied THEN
    RAISE EXCEPTION 'Authenticated player was able to elevate profile role';
  END IF;

  denied:=false;
  BEGIN
    UPDATE public.players SET status='pending'
    WHERE user_id=auth.uid() AND status='approved';
  EXCEPTION WHEN OTHERS THEN denied:=true;
  END;
  IF NOT denied THEN
    RAISE EXCEPTION 'Authenticated player was able to change own approval';
  END IF;

  denied:=false;
  BEGIN
    UPDATE public.player_earnings SET amount=amount+100
    WHERE player_id IN (SELECT id FROM public.players WHERE user_id=auth.uid());
  EXCEPTION WHEN OTHERS THEN denied:=true;
  END;
  IF NOT denied THEN
    RAISE EXCEPTION 'Authenticated player modified earned money directly';
  END IF;
  denied:=false;
  BEGIN
    INSERT INTO public.player_withdrawal_access(player_id,enabled)
    SELECT id,true FROM public.players WHERE user_id=auth.uid() LIMIT 1;
  EXCEPTION WHEN OTHERS THEN denied:=true;
  END;
  IF NOT denied THEN
    RAISE EXCEPTION 'Player inserted direct withdrawal enable state';
  END IF;
  denied:=false;
  BEGIN
    UPDATE public.player_withdrawal_access SET enabled=true
      WHERE player_id IN (SELECT id FROM public.players WHERE user_id=auth.uid());
  EXCEPTION WHEN OTHERS THEN denied:=true;
  END;
  IF NOT denied THEN
    RAISE EXCEPTION 'Player directly switched security table';
  END IF;
  denied:=false;
  BEGIN
    INSERT INTO public.player_withdrawal_access_events(
       player_id,actor_user_id,previous_enabled,enabled
    ) SELECT id,auth.uid(),false,true FROM public.players WHERE user_id=auth.uid() LIMIT 1;
  EXCEPTION WHEN OTHERS THEN denied:=true;
  END;
  IF NOT denied THEN
    RAISE EXCEPTION 'Player forged a withdrawal toggle audit';
  END IF;
  RAISE NOTICE 'PASS: authenticated player role, approval, earnings and withdrawal-toggle mutation denied';
END;
$rls$;
ROLLBACK;

BEGIN;
SET LOCAL ROLE anon;
DO $rls$
DECLARE
  denied boolean:=false;
BEGIN
  BEGIN
    INSERT INTO public.matches DEFAULT VALUES;
  EXCEPTION WHEN OTHERS THEN denied:=true;
  END;
  IF NOT denied THEN
    RAISE EXCEPTION 'Anonymous actor inserted fake match';
  END IF;
  RAISE NOTICE 'PASS: anonymous match insertion denied';
END;
$rls$;
ROLLBACK;
