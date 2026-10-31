-- Harden trigger-only and internal finance functions.
-- Trigger execution remains intact; only direct PostgREST execution is revoked.
-- All affected functions use schema-qualified table/function references.

ALTER FUNCTION public.get_user_role() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.op_snapshot_player_match_team() SET search_path = '';
ALTER FUNCTION public.generate_registration_code() SET search_path = '';
ALTER FUNCTION public.prevent_duplicate_player_earning() SET search_path = '';
ALTER FUNCTION public.sync_one_player_earning(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.get_player_positive_earnings_v2(uuid) SET search_path = '';
ALTER FUNCTION public.trigger_rebuild_from_finance() SET search_path = '';
ALTER FUNCTION public.trigger_rebuild_from_match() SET search_path = '';
ALTER FUNCTION public.trigger_rebuild_from_match_players() SET search_path = '';
ALTER FUNCTION public.trigger_rebuild_player_earnings() SET search_path = '';
ALTER FUNCTION public.trigger_rebuild_player_earnings_from_match() SET search_path = '';
ALTER FUNCTION public.trigger_sync_from_match_finance() SET search_path = '';
ALTER FUNCTION public.trigger_sync_from_match_status() SET search_path = '';
ALTER FUNCTION public.trigger_sync_match_earnings() SET search_path = '';
ALTER FUNCTION public.trigger_sync_match_finance_earnings() SET search_path = '';
ALTER FUNCTION public.trigger_sync_player_earning() SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.op_check_match_lineup_visibility() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.op_protect_roster_switches() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.op_snapshot_player_match_team() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_duplicate_player_earning() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_rebuild_from_finance() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_rebuild_from_match() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_rebuild_from_match_players() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_rebuild_player_earnings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_rebuild_player_earnings_from_match() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sync_from_match_finance() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sync_from_match_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sync_match_earnings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sync_match_finance_earnings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_sync_player_earning() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.sync_one_player_earning(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_player_positive_earnings_v2(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_registration_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_registration_code() TO authenticated;
