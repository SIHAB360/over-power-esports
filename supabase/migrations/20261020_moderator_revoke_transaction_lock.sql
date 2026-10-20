-- Ensure grant revocations cannot race already-authorized mutations.
CREATE OR REPLACE FUNCTION public.moderator_access_check(p_section text, p_action text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_actor uuid:=auth.uid();
begin
 if auth.role() is distinct from 'authenticated' or v_actor is null then
  raise exception 'Moderator sign-in required' using errcode='42501';
 end if;
 perform 1 from public.moderator_accounts a where a.user_id=v_actor and a.enabled for share;
 if not found then raise exception 'Moderator inactive' using errcode='42501';end if;
 perform 1 from public.players p where p.user_id=v_actor and p.status='approved' for share;
 if not found then raise exception 'Moderator player not approved' using errcode='42501';end if;
 -- Lock this exact grant for the transaction: concurrent revoke waits until this operation completes.
 perform 1 from public.moderator_permissions m
 where m.user_id=v_actor and m.section=p_section and m.action=p_action
 for share;
 if not found then
  raise exception 'Section action not granted' using errcode='42501';
 end if;
end;$function$
;
