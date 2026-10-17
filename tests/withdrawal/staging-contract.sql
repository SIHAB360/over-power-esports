-- STEP 01 • Isolated PostgreSQL restore integration checks.
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

  -- Choose a real approved player from the disposable copy with 2 BDT+
  -- computed earned balance; do not reveal PII/UUIDs in the CI logs.
  SELECT p.id,p.user_id,SUM(pe.amount)
    INTO v_player,v_user,v_total
  FROM public.players p
  JOIN public.player_earnings pe ON pe.player_id=p.id
  JOIN public.matches m ON m.id=pe.match_id AND m.status='completed'
  WHERE p.user_id IS NOT NULL AND p.status='approved'
  GROUP BY p.id,p.user_id HAVING SUM(pe.amount)>2
  ORDER BY SUM(pe.amount) DESC
  LIMIT 1;
  IF v_player IS NULL THEN
    RAISE EXCEPTION 'No eligible positive-balance player for end-to-end smoke test';
  END IF;

  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
  SELECT available_balance INTO v_available
    FROM public.get_player_wallet_balance(v_player);
  IF v_available <= 2 THEN RAISE EXCEPTION 'Wallet has insufficient test balance'; END IF;

  v_request1 := public.request_player_withdrawal_v2(1,'bkash','01700000000');
  SELECT available_balance INTO v_after
    FROM public.get_player_wallet_balance(v_player);
  IF v_after IS DISTINCT FROM v_available - 1 THEN
    RAISE EXCEPTION 'Reservation did not debit available balance';
  END IF;

  v_denied := false;
  BEGIN
    PERFORM public.request_player_withdrawal_v2(1,'nagad','01800000000');
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

  v_request2 := public.request_player_withdrawal_v2(1,'nagad','01800000000');
  PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);

  v_denied := false;
  BEGIN
    PERFORM public.admin_confirm_manual_withdrawal(v_request2,0.1,'LOCAL-TEST-ONLY');
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Pending request was marked Paid without approval'; END IF;

  PERFORM public.admin_review_player_withdrawal(v_request2,'approved',null);
  v_denied := false;
  BEGIN
    PERFORM public.admin_confirm_manual_withdrawal(v_request2,1,'LOCAL-TEST-ONLY');
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Fee equal to requested amount was accepted'; END IF;

  PERFORM public.admin_confirm_manual_withdrawal(v_request2,0.1,'LOCAL-TEST-ONLY');
  SELECT status,transfer_fee,net_payout INTO v_status,v_fee,v_net
    FROM public.withdrawal_requests WHERE id=v_request2;
  IF v_status <> 'paid' OR v_fee <> 0.1 OR v_net <> 0.9 THEN
    RAISE EXCEPTION 'Manual payment net/gross accounting incorrect';
  END IF;

  v_denied := false;
  BEGIN
    PERFORM public.admin_confirm_manual_withdrawal(v_request2,0.1,'LOCAL-TEST-ONLY');
  EXCEPTION WHEN OTHERS THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'Duplicate Paid confirmation accepted'; END IF;

  SELECT count(*) INTO v_audits FROM public.withdrawal_audit_events
  WHERE request_id IN (v_request1,v_request2);
  IF v_audits <> 5 THEN
    RAISE EXCEPTION 'Expected 5 immutable audit lifecycle events; got %',v_audits;
  END IF;

  PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
  SELECT available_balance INTO v_after
    FROM public.get_player_wallet_balance(v_player);
  IF v_after IS DISTINCT FROM v_available - 1 THEN
    RAISE EXCEPTION 'Paid transaction was not debited exactly once';
  END IF;

  -- No PII, transaction ID, or wallet number is printed.
  RAISE NOTICE 'PASS: isolated wallet reservation, rejection, admin authorization, manual payout, fee, duplicate guards and audit';
END;
$tests$;
