CREATE OR REPLACE FUNCTION public.moderator_roster_choices(p_section text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $function$
DECLARE r jsonb;
BEGIN
 IF p_section='teams' THEN
   PERFORM public.moderator_access_check('teams','edit');
   SELECT jsonb_build_object(
     'players',coalesce((SELECT jsonb_agg(jsonb_build_object('id',p.id,'name',coalesce(p.ign,p.full_name,'Player'),
             'team_id',p.team_id) ORDER BY p.full_name) FROM public.players p),'[]'::jsonb),
     'teams',coalesce((SELECT jsonb_agg(jsonb_build_object('id',t.id,'name',t.team_name) ORDER BY t.team_name)
             FROM public.teams t),'[]'::jsonb)) INTO r;
 ELSIF p_section='tournaments' THEN
   PERFORM public.moderator_access_check('tournaments','edit');
   SELECT jsonb_build_object(
    'teams',coalesce((SELECT jsonb_agg(jsonb_build_object('id',t.id,'name',t.team_name) ORDER BY t.team_name)
             FROM public.teams t),'[]'::jsonb),
    'registrations',coalesce((SELECT jsonb_agg(jsonb_build_object('id',x.id,'tournament_id',x.tournament_id,
       'team_id',x.team_id,'status',x.status) ORDER BY x.created_at DESC) FROM (
      SELECT id,tournament_id,team_id,status,created_at FROM public.tournament_teams ORDER BY created_at DESC LIMIT 1000
    )x),'[]'::jsonb)) INTO r;
 ELSE
   RAISE EXCEPTION 'Invalid roster section' USING errcode='22023';
 END IF;
 RETURN r;
END;$function$;
REVOKE ALL ON FUNCTION public.moderator_roster_choices(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.moderator_roster_choices(text) TO authenticated;