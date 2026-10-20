-- Fix unrelated permissive INSERT policies that could bypass Moderator RBAC.
-- Preserve legitimate player image/screenshot uploads, team owner creation and team owner registrations.
ALTER POLICY "Users can upload player images hylejo_0" ON storage.objects
 WITH CHECK (auth.uid() IS NOT NULL AND bucket_id IN ('player-images','game-screenshots'));
ALTER POLICY "Allow admin insert teams" ON public.teams
 WITH CHECK (EXISTS(SELECT 1 FROM public.profiles pf WHERE pf.id=auth.uid()
                   AND lower(pf.role)='admin'));
ALTER POLICY "Team join tournament" ON public.tournament_teams
 WITH CHECK (
   EXISTS(SELECT 1 FROM public.profiles pf WHERE pf.id=auth.uid() AND lower(pf.role)='admin')
   OR EXISTS(SELECT 1 FROM public.teams t WHERE t.id=team_id AND t.owner_id=auth.uid())
 );
