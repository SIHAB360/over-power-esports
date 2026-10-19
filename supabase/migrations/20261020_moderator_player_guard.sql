-- Keep the existing player self-approval protection. Delegate only status/roster changes
-- to the audited, permission-checked moderator_delegate_action RPC.
CREATE OR REPLACE FUNCTION public.op_guard_player_sensitive_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $function$
DECLARE v_scope text:=coalesce(current_setting('op.moderator_delegate_scope',true),'');
BEGIN
 IF TG_OP='INSERT' THEN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin_or_moderator()
   AND (coalesce(NEW.status,'pending')<>'pending' OR coalesce(NEW.verified,false)
    OR coalesce(NEW.earning_percentage,0)<>0) THEN
   RAISE EXCEPTION 'Player registrations require staff approval' USING errcode='42501';
  END IF;
  RETURN NEW;
 END IF;
 IF auth.uid() IS NOT NULL AND NOT public.is_admin_or_moderator() THEN
   -- No delegated action ever changes user ownership, verified, or earnings percentage.
   IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.verified IS DISTINCT FROM OLD.verified
     OR NEW.earning_percentage IS DISTINCT FROM OLD.earning_percentage THEN
     RAISE EXCEPTION 'Player identity and earnings are protected' USING errcode='42501';
   END IF;
   IF NEW.status IS DISTINCT FROM OLD.status THEN
     IF v_scope<>'players:approve' OR NEW.status<>'approved' THEN
       RAISE EXCEPTION 'Player approval requires moderated workflow' USING errcode='42501';
     END IF;
     PERFORM public.moderator_access_check('players','approve');
   END IF;
   IF NEW.team_id IS DISTINCT FROM OLD.team_id THEN
     IF v_scope<>'teams:edit' THEN
       RAISE EXCEPTION 'Team changes require moderated workflow' USING errcode='42501';
     END IF;
     PERFORM public.moderator_access_check('teams','edit');
   END IF;
 END IF;
 RETURN NEW;
END;$function$;
