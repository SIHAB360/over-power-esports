-- Player roster display switches are independent of approval/login and match history.
-- Existing approved players and squads stay visible by default.
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.players.is_active IS
 'Admin-controlled public roster visibility and availability for NEW match lineups; does not delete or deactivate the login.';
COMMENT ON COLUMN public.teams.show_on_homepage IS
 'Admin-controlled public squad overlay visibility; roster data and historic matches remain intact.';

-- Guard admin-owned switches: existing players have a self-update RLS policy.
-- Without a DB trigger, users could toggle their own public visibility.
CREATE OR REPLACE FUNCTION public.op_protect_roster_switches()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RETURN NEW; END IF; -- trusted service role for audited server endpoint
 IF TG_TABLE_NAME='players' THEN
   IF NEW.is_active IS DISTINCT FROM OLD.is_active
      AND NOT EXISTS(SELECT 1 FROM public.profiles
                     WHERE id=auth.uid() AND lower(role)='admin') THEN
     RAISE EXCEPTION 'Only Main Admin can control player activity'
       USING errcode='42501';
   END IF;
 ELSE
   IF NEW.show_on_homepage IS DISTINCT FROM OLD.show_on_homepage
      AND NOT EXISTS(SELECT 1 FROM public.profiles
                     WHERE id=auth.uid() AND lower(role)='admin') THEN
     RAISE EXCEPTION 'Only Main Admin can control squad overlay visibility'
       USING errcode='42501';
   END IF;
 END IF;
 RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS op_protect_player_active ON public.players;
CREATE TRIGGER op_protect_player_active BEFORE UPDATE ON public.players
FOR EACH ROW EXECUTE FUNCTION public.op_protect_roster_switches();
DROP TRIGGER IF EXISTS op_protect_team_overlay ON public.teams;
CREATE TRIGGER op_protect_team_overlay BEFORE UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.op_protect_roster_switches();

-- Existing 3 approved Over Power players have legacy team_name, but no team_id.
-- Resolve that legacy canonical name ONLY if exactly one Main Team exists.
-- This does not modify match records, achievements, earnings or user accounts.
DO $$
DECLARE v_main uuid;
BEGIN
 SELECT (array_agg(id))[1] INTO v_main FROM public.teams
 WHERE lower(team_name)='over power main team'
 HAVING count(*)=1;
 IF v_main IS NOT NULL THEN
  UPDATE public.players SET team_id=v_main,
    team_name='Over Power Main Team'
  WHERE team_id IS NULL AND status='approved'
    AND regexp_replace(lower(coalesce(team_name,'')),'[^a-z0-9]','','g')
         IN ('overpower','overpowermainteam');
 END IF;
END;
$$;

-- Protect new match lineups without rewriting old results or finance:
-- historic rows are unchanged; all four newly inserted participants must be
-- currently active, approved, and assigned to the chosen squad.
CREATE OR REPLACE FUNCTION public.op_check_match_lineup_visibility()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT EXISTS(
   SELECT 1 FROM public.players p
   WHERE p.id=NEW.player_id AND p.team_id=NEW.team_id
     AND p.is_active AND lower(coalesce(p.status,'')) IN ('approved','active')
 ) THEN
   RAISE EXCEPTION 'Only active approved players belonging to the squad can enter a new match'
     USING errcode='23514';
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS op_check_match_lineup_visibility ON public.match_players;
CREATE TRIGGER op_check_match_lineup_visibility
 BEFORE INSERT ON public.match_players
 FOR EACH ROW EXECUTE FUNCTION public.op_check_match_lineup_visibility();
