-- All additional privileges are bound to the currently approved and enabled account.
CREATE OR REPLACE FUNCTION public.moderator_can(p_section text,p_action text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $function$
 SELECT auth.role()='authenticated' AND auth.uid() IS NOT NULL
  AND EXISTS(SELECT 1 FROM public.moderator_accounts ma WHERE ma.user_id=auth.uid() AND ma.enabled)
  AND EXISTS(SELECT 1 FROM public.players p WHERE p.user_id=auth.uid() AND p.status='approved')
  AND EXISTS(SELECT 1 FROM public.moderator_permissions g WHERE g.user_id=auth.uid()
               AND g.section=p_section AND g.action=p_action);
$function$;
REVOKE ALL ON FUNCTION public.moderator_can(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.moderator_can(text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.moderator_verification_codes()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $function$
DECLARE v_codes jsonb;
BEGIN
 IF NOT (public.moderator_can('registration_codes','view') OR public.moderator_can('verification','view')) THEN
   RAISE EXCEPTION 'Verification code access denied' USING errcode='42501'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.id,'code',r.code,
               'createdAt',r.created_at,'expiresAt',r.expires_at)),'[]'::jsonb)
 INTO v_codes FROM (SELECT id,code,created_at,expires_at
                   FROM public.registration_codes ORDER BY created_at DESC LIMIT 200) r;
 RETURN jsonb_build_object('codes',v_codes,'checkedAt',now());
END;$function$;
REVOKE ALL ON FUNCTION public.moderator_verification_codes() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.moderator_verification_codes() TO authenticated;

-- Achievement-galleries require the same user-token rights for object upload/deletion.
-- Existing admin storage policies and public read access remain untouched.
DROP POLICY IF EXISTS achievement_storage_moderator_insert ON storage.objects;
CREATE POLICY achievement_storage_moderator_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='achievement-gallery' AND
  (storage.foldername(name))[1]=auth.uid()::text AND
  public.moderator_can('achievements','create'));
DROP POLICY IF EXISTS achievement_storage_moderator_delete ON storage.objects;
CREATE POLICY achievement_storage_moderator_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='achievement-gallery' AND public.moderator_can('achievements','delete'));
