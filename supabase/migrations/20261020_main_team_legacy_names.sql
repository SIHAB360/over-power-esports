-- Canonicalize only legacy short-name records already linked to the Main Team.
-- Roster/team IDs, prior games, earnings and profile data are unchanged.
UPDATE public.players p SET team_name=t.team_name
FROM public.teams t
WHERE p.team_id=t.id AND lower(t.team_name)='over power main team'
  AND regexp_replace(lower(coalesce(p.team_name,'')),'[^a-z0-9]','','g')
      = 'overpower';