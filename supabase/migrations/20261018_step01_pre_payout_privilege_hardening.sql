-- OVER POWER ESPORTS • STEP 01 FINANCIAL SOURCE & ADMIN ROLE HARDENING
-- SECURITY REVIEW: Existing authenticated users can change profiles.role;
-- broad INSERT RLS on matches/match_players/match_player_stats can forge
-- wallet income through privileged earnings-rebuild triggers.
--
-- APPLY ONLY AFTER verified isolated database backup/restore rehearsal
-- and staging compatibility tests. NO existing rows are modified.
-- Apply together with 20261017_step01_secure_withdrawals.sql, in filename order.
BEGIN;

-- Profile roles are assigned by auth.users -> public.handle_new_user()
-- (SECURITY DEFINER owned by postgres), never client-side.
-- This also prevents self-deletion/reinsertion of a privileged role.
REVOKE ALL ON TABLE public.profiles FROM anon,authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT UPDATE (full_name,email,phone,avatar) ON TABLE public.profiles
  TO authenticated;
-- Do not GRANT INSERT to browser users. Signup profile rows are inserted
-- by the existing postgres-owned on_auth_user_created trigger.
-- Trusted service_role/postgres ownership privileges are preserved.

-- Historical policy was literally USING(true) FOR UPDATE to all
-- authenticated clients, permitting mutation of ANY player record.
DROP POLICY IF EXISTS "Admin can update players" ON public.players;
CREATE POLICY op_verified_staff_can_update_players
  ON public.players FOR UPDATE TO authenticated
  USING (public.is_admin_or_moderator())
  WITH CHECK (public.is_admin_or_moderator());

-- An existing "Users can update own player profile" RLS policy is retained.
-- RLS alone cannot compare OLD and NEW; a trigger guards privileged fields
-- while letting players change their ordinary gaming/contact profile.
CREATE OR REPLACE FUNCTION public.op_guard_player_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $op$
BEGIN
  IF auth.uid() IS NOT NULL
    AND NOT public.is_admin_or_moderator()
    AND (
      NEW.user_id IS DISTINCT FROM OLD.user_id OR
      NEW.status IS DISTINCT FROM OLD.status OR
      NEW.verified IS DISTINCT FROM OLD.verified OR
      NEW.earning_percentage IS DISTINCT FROM OLD.earning_percentage OR
      NEW.team_id IS DISTINCT FROM OLD.team_id
    )
  THEN
    RAISE EXCEPTION 'Only staff can change player identity, approval, team or earnings settings'
      USING errcode='42501';
  END IF;
  RETURN NEW;
END;
$op$;
REVOKE ALL ON FUNCTION public.op_guard_player_sensitive_fields()
  FROM public,anon,authenticated;

DROP TRIGGER IF EXISTS op_guard_player_sensitive_fields ON public.players;
CREATE TRIGGER op_guard_player_sensitive_fields
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.op_guard_player_sensitive_fields();

-- SECURITY: Direct client inserts into match source tables were unrestricted,
-- and trusted triggers could rebuild wallet earnings from forged matches.
-- The site's Admin Match Management saves through create_esports_match()
-- SECURITY DEFINER with its own admin/moderator check.
DROP POLICY IF EXISTS "Anyone can create matches" ON public.matches;
CREATE POLICY op_verified_staff_insert_matches
  ON public.matches FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_moderator());

DROP POLICY IF EXISTS "Anyone can add match players" ON public.match_players;
CREATE POLICY op_verified_staff_insert_match_players
  ON public.match_players FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_moderator());

DROP POLICY IF EXISTS "Allow insert match player stats" ON public.match_player_stats;
CREATE POLICY op_verified_staff_insert_match_player_stats
  ON public.match_player_stats FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_moderator());

DROP POLICY IF EXISTS "Allow team earnings insert" ON public.team_earnings;

-- Protect old SECURITY DEFINER earnings helpers from authenticated RPC calls.
-- Triggers and trusted create_esports_match() execute as postgres, so they
-- continue to have permission to call these functions.
REVOKE ALL ON FUNCTION public.rebuild_match_player_earnings(uuid)
  FROM public,anon,authenticated;
REVOKE ALL ON FUNCTION public.sync_match_player_earnings(uuid)
  FROM public,anon,authenticated;
REVOKE ALL ON FUNCTION public.rebuild_player_earnings(uuid)
  FROM public,anon,authenticated;

-- Table ACL hardening: PostgreSQL TRUNCATE bypasses RLS entirely!
-- No browser caller should be able to TRUNCATE, change grants, or define
-- triggers on financially significant source/identity tables.
REVOKE TRUNCATE,TRIGGER,REFERENCES ON TABLE
  public.profiles, public.players, public.matches, public.match_players,
  public.match_player_stats, public.match_finance,
  public.player_earnings, public.team_earnings
  FROM anon,authenticated;

REVOKE INSERT,UPDATE,DELETE ON TABLE public.player_earnings
  FROM anon,authenticated;
GRANT SELECT ON TABLE public.player_earnings TO authenticated;

REVOKE INSERT,UPDATE,DELETE ON TABLE public.team_earnings
  FROM anon,authenticated;

-- Direct anonymous writes are never valid on financial match sources.
REVOKE INSERT,UPDATE,DELETE ON TABLE
  public.matches,public.match_players,public.match_player_stats
  FROM anon;
-- Staff members retain authenticated INSERT via the explicitly staff-scoped
-- RLS policies above. The trusted match RPC can write regardless of RLS.

-- Wallet reservations/paid withdrawals must not be invalidated by an
-- after-the-fact match deletion or finance mutation. Restrict destructive
-- edits only after a player's real withdrawal request exists.
CREATE OR REPLACE FUNCTION public.op_prevent_financial_match_rewrites()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $op$
DECLARE
  v_has_financial_withdrawal boolean;
  v_financial_change boolean := false;
BEGIN
  -- Never dereference NEW for a DELETE trigger event.
  IF TG_OP='DELETE' THEN
    v_financial_change := true;
  ELSE
    v_financial_change := (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.prize_money IS DISTINCT FROM OLD.prize_money
      OR NEW.entry_fee IS DISTINCT FROM OLD.entry_fee
    );
  END IF;
  -- Only a completed match that has earned players with pending/approved/
  -- paid withdrawals requires immutable financial source data.
  IF OLD.status='completed' AND v_financial_change
  THEN
    SELECT EXISTS (
      SELECT 1 FROM public.player_earnings pe
      JOIN public.withdrawal_requests w ON w.player_id=pe.player_id
      WHERE pe.match_id=OLD.id
        AND w.status IN ('pending','approved','paid')
    ) INTO v_has_financial_withdrawal;

    IF v_has_financial_withdrawal THEN
      RAISE EXCEPTION
        'Financial match locked because a player has withdrawal history. Reconcile payouts before editing.'
        USING errcode='42501';
    END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$op$;
REVOKE ALL ON FUNCTION public.op_prevent_financial_match_rewrites()
  FROM public,anon,authenticated;

DROP TRIGGER IF EXISTS op_prevent_financial_match_rewrites ON public.matches;
CREATE TRIGGER op_prevent_financial_match_rewrites
  BEFORE UPDATE OR DELETE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.op_prevent_financial_match_rewrites();

COMMIT;
