-- Full gallery metadata accessible only after scoped section view grant.
CREATE OR REPLACE FUNCTION public.moderator_list_section(p_section text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE v_rows jsonb;
BEGIN
 IF p_section NOT IN ('matches','teams','tournaments','players','earnings','withdrawals','profit','verification','achievements') THEN
   RAISE EXCEPTION 'Unsupported section' USING errcode='22023';
 END IF;
 PERFORM public.moderator_access_check(p_section,'view');
 CASE p_section
 WHEN 'matches' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT m.id,m.match_type,m.match_date,m.status,m.team1_id,m.team2_id,
            m.team1_score,m.team2_score,m.winner_id,m.tournament_id,
            m.platform,m.map,m.sponsor,m.notice,m.created_at,
            coalesce(t1.team_name,'Team One') AS team1_name,
            t1.logo AS team1_logo,
            coalesce(t2.team_name,'Team Two') AS team2_name,
            t2.logo AS team2_logo,
            coalesce(w.team_name,'') AS winner_name,
            coalesce(t.name,'') AS tournament_name,
            coalesce((
              SELECT jsonb_agg(to_jsonb(ps) ORDER BY ps.kills DESC NULLS LAST) FROM (
                SELECT p.id AS player_id,coalesce(p.ign,p.full_name,'Player') AS player_name,
                       coalesce(tm.team_name,'') AS team_name,
                       s.kills,s.assists,s.damage,s.mvp,s.placement
                FROM public.match_player_stats s
                LEFT JOIN public.players p ON p.id=s.player_id
                LEFT JOIN public.teams tm ON tm.id=p.team_id
                WHERE s.match_id=m.id
                ORDER BY s.kills DESC NULLS LAST LIMIT 100
              ) ps
            ),'[]'::jsonb) AS performance
       FROM public.matches m
       LEFT JOIN public.teams t1 ON t1.id=m.team1_id
       LEFT JOIN public.teams t2 ON t2.id=m.team2_id
       LEFT JOIN public.teams w ON w.id=m.winner_id
       LEFT JOIN public.tournaments t ON t.id=m.tournament_id
       ORDER BY m.created_at DESC NULLS LAST LIMIT 200
   ) r;
 WHEN 'teams' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT id,team_name,logo,description,country,coach_name,manager_name,status,created_at,founded_year
     FROM public.teams ORDER BY created_at DESC NULLS LAST LIMIT 200
   ) r;
 WHEN 'tournaments' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT id,name,banner,description,prize_pool,entry_fee,start_date,end_date,status,
            max_teams,registration_deadline,created_at
     FROM public.tournaments ORDER BY created_at DESC NULLS LAST LIMIT 200
   ) r;
 WHEN 'players' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT id,ign,full_name,status,verified,team_name,team_id,position,country,
            matches_played,wins,total_kills,avatar_url,created_at
     FROM public.players ORDER BY created_at DESC NULLS LAST LIMIT 200
   ) r;
 WHEN 'earnings' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT e.id,e.player_id,coalesce(p.ign,p.full_name,'Player') AS player_name,
            e.match_id,e.amount,e.percentage,e.created_at
     FROM public.player_earnings e LEFT JOIN public.players p ON p.id=e.player_id
     ORDER BY e.created_at DESC NULLS LAST LIMIT 200
   ) r;
 WHEN 'withdrawals' THEN
   -- No receiver phone, transaction reference, rejection reason or payment notes.
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT w.id,w.player_id,coalesce(p.ign,p.full_name,'Player') AS player_name,
            w.provider,w.amount,w.transfer_fee,w.net_payout,w.status,w.created_at
     FROM public.withdrawal_requests w LEFT JOIN public.players p ON p.id=w.player_id
     ORDER BY w.created_at DESC NULLS LAST LIMIT 200
   ) r;
 WHEN 'profit' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT id,match_id,team_id,entry_fee,prize_money,profit,expense,created_at
     FROM public.match_finance ORDER BY created_at DESC NULLS LAST LIMIT 200
   ) r;
 WHEN 'verification' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT id,ign,full_name,status,verified,created_at
     FROM public.players ORDER BY created_at DESC NULLS LAST LIMIT 200
   ) r;
 WHEN 'achievements' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO v_rows FROM (
     SELECT id,title,file_path,category,sort_order,is_published,created_at,team_id
     FROM public.achievement_gallery ORDER BY created_at DESC NULLS LAST LIMIT 200
   ) r;
 END CASE;
 RETURN v_rows;
END; $function$
;