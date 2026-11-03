CREATE OR REPLACE FUNCTION public.admin_update_esports_match(
  p_match_id uuid,
  p_match jsonb,
  p_players jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_is_admin boolean := false;
  v_old public.matches%ROWTYPE;
  v_team uuid;
  v_team2 uuid;
  v_winner uuid;
  v_status text;
  v_match_date timestamp;
  v_entry numeric(14,2);
  v_prize numeric(14,2);
  v_profit numeric(14,2);
  v_management numeric(14,2);
  v_player_share numeric(14,2);
  v_position integer;
  v_points integer;
  v_existing_ids uuid[];
  v_new_ids uuid[];
  v_lineup_changed boolean := false;
  v_financial_change boolean := false;
  v_count integer := 0;
  v_finance_count integer := 0;
  v_player jsonb;
  v_player_id uuid;
  v_slot integer := 0;
BEGIN
  IF v_actor IS NULL OR auth.role() IS DISTINCT FROM 'authenticated' THEN
    RAISE EXCEPTION 'Sign in required' USING errcode='42501';
  END IF;

  SELECT lower(coalesce(p.role,''))='admin'
    INTO v_is_admin
  FROM public.profiles p
  WHERE p.id=v_actor;

  IF NOT coalesce(v_is_admin,false) THEN
    PERFORM public.moderator_access_check('matches','edit');
    PERFORM public.moderator_access_check('matches','approve');
  END IF;

  IF p_match_id IS NULL OR p_match IS NULL OR jsonb_typeof(p_match) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Invalid match payload' USING errcode='22023';
  END IF;
  IF p_players IS NULL OR jsonb_typeof(p_players) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_players) <> 4 THEN
    RAISE EXCEPTION 'Exactly four players are required' USING errcode='22023';
  END IF;

  SELECT *
    INTO v_old
  FROM public.matches
  WHERE id=p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found' USING errcode='P0002';
  END IF;

  v_team := nullif(p_match->>'team1_id','')::uuid;
  v_team2 := nullif(p_match->>'team2_id','')::uuid;
  v_winner := nullif(p_match->>'winner_id','')::uuid;
  v_status := coalesce(nullif(p_match->>'status',''),'upcoming');
  v_match_date := nullif(p_match->>'match_date','')::timestamp;
  v_entry := coalesce(nullif(p_match->>'entry_fee','')::numeric,0);
  v_prize := coalesce(nullif(p_match->>'prize_money','')::numeric,0);
  v_position := nullif(p_match->>'position','')::integer;
  v_points := coalesce(nullif(p_match->>'points','')::integer,0);

  IF v_team IS NULL THEN
    RAISE EXCEPTION 'Team is required' USING errcode='22023';
  END IF;
  IF v_team2 IS NOT NULL AND v_team2=v_team THEN
    RAISE EXCEPTION 'Team 1 and Team 2 cannot be the same' USING errcode='22023';
  END IF;
  IF v_winner IS NOT NULL AND v_winner IS DISTINCT FROM v_team AND v_winner IS DISTINCT FROM v_team2 THEN
    RAISE EXCEPTION 'Winner must be one of the selected teams' USING errcode='22023';
  END IF;
  IF v_status NOT IN ('upcoming','live','completed') THEN
    RAISE EXCEPTION 'Invalid match status' USING errcode='22023';
  END IF;
  IF v_match_date IS NULL THEN
    RAISE EXCEPTION 'Match date is required' USING errcode='22023';
  END IF;
  IF v_entry < 0 OR v_prize < 0
     OR v_entry > 999999999999.99 OR v_prize > 999999999999.99
     OR v_entry <> round(v_entry,2) OR v_prize <> round(v_prize,2) THEN
    RAISE EXCEPTION 'Enter valid non-negative financial amounts (maximum 2 decimals)' USING errcode='22023';
  END IF;
  IF coalesce(nullif(p_match->>'team1_score','')::bigint,0) < 0
     OR coalesce(nullif(p_match->>'team2_score','')::bigint,0) < 0
     OR v_points < 0 OR (v_position IS NOT NULL AND v_position < 1) THEN
    RAISE EXCEPTION 'Scores, points and position must be non-negative valid values' USING errcode='22023';
  END IF;

  SELECT count(DISTINCT x->>'player_id')
    INTO v_count
  FROM jsonb_array_elements(p_players) AS x;

  IF v_count <> 4 THEN
    RAISE EXCEPTION 'Duplicate players are not allowed' USING errcode='22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_players) AS x
    WHERE nullif(x->>'player_id','') IS NULL
       OR coalesce(nullif(x->>'kills','')::integer,0) < 0
       OR coalesce(nullif(x->>'assists','')::integer,0) < 0
       OR coalesce(nullif(x->>'damage','')::integer,0) < 0
  ) THEN
    RAISE EXCEPTION 'Player IDs and stats must be valid non-negative values' USING errcode='22023';
  END IF;

  SELECT array_agg(DISTINCT mp.player_id ORDER BY mp.player_id)
    INTO v_existing_ids
  FROM public.match_players mp
  WHERE mp.match_id=p_match_id;

  SELECT array_agg((x->>'player_id')::uuid ORDER BY (x->>'player_id')::uuid)
    INTO v_new_ids
  FROM jsonb_array_elements(p_players) AS x;

  v_lineup_changed :=
    coalesce(v_existing_ids,'{}'::uuid[]) IS DISTINCT FROM coalesce(v_new_ids,'{}'::uuid[])
    OR coalesce(v_old.team1_id,v_old.team_id) IS DISTINCT FROM v_team;

  v_financial_change :=
    v_old.status IS DISTINCT FROM v_status
    OR coalesce(v_old.entry_fee,0) IS DISTINCT FROM v_entry
    OR coalesce(v_old.prize_money,0) IS DISTINCT FROM v_prize
    OR coalesce(v_old.team1_id,v_old.team_id) IS DISTINCT FROM v_team;

  IF v_old.status='completed' AND (v_lineup_changed OR v_financial_change) AND EXISTS (
    SELECT 1
    FROM public.player_earnings pe
    JOIN public.withdrawal_requests w ON w.player_id=pe.player_id
    WHERE pe.match_id=p_match_id
      AND w.status IN ('pending','approved','paid')
  ) THEN
    RAISE EXCEPTION 'This match is locked because a player has pending, approved, or paid withdrawal history. Reconcile payouts before changing its lineup or financial details.'
      USING errcode='42501';
  END IF;

  IF v_lineup_changed THEN
    SELECT count(DISTINCT p.id)
      INTO v_count
    FROM public.players p
    WHERE p.team_id=v_team
      AND p.id=ANY(v_new_ids)
      AND p.is_active
      AND lower(coalesce(p.status,'')) IN ('approved','active');

    IF v_count <> 4 THEN
      RAISE EXCEPTION 'All four players must be active and approved members of the selected team'
        USING errcode='22023';
    END IF;
  END IF;

  v_profit := round(v_prize-v_entry,2);
  v_management := CASE WHEN v_status='completed' THEN round(v_profit*0.30,2) ELSE 0 END;
  v_player_share := CASE WHEN v_status='completed' THEN v_profit-v_management ELSE 0 END;

  UPDATE public.matches
  SET tournament_id=nullif(p_match->>'tournament_id','')::uuid,
      team1_id=v_team,
      team2_id=v_team2,
      team_id=CASE WHEN v_old.team_id IS NOT NULL THEN v_team ELSE v_old.team_id END,
      team1_score=coalesce(nullif(p_match->>'team1_score','')::bigint,0),
      team2_score=coalesce(nullif(p_match->>'team2_score','')::bigint,0),
      winner_id=v_winner,
      match_date=v_match_date,
      match_type=coalesce(nullif(p_match->>'match_type',''),'Scrim'),
      status=v_status,
      entry_fee=v_entry,
      prize_money=v_prize,
      profit=v_profit,
      platform=coalesce(nullif(p_match->>'platform',''),'Free Fire'),
      map=nullif(p_match->>'map',''),
      sponsor=nullif(p_match->>'sponsor',''),
      notice=nullif(p_match->>'notice','')
  WHERE id=p_match_id;

  SELECT count(*) INTO v_finance_count
  FROM public.match_finance
  WHERE match_id=p_match_id;

  IF v_finance_count > 1 THEN
    RAISE EXCEPTION 'Multiple financial records are linked to this match. Please reconcile them before editing.'
      USING errcode='23505';
  ELSIF v_finance_count = 1 THEN
    UPDATE public.match_finance
    SET team_id=v_team,
        entry_fee=v_entry,
        prize_money=v_prize,
        profit=v_profit,
        management_percentage=30,
        management_amount=v_management,
        player_amount=v_player_share
    WHERE match_id=p_match_id;
  ELSE
    INSERT INTO public.match_finance(
      match_id,team_id,entry_fee,prize_money,profit,
      management_percentage,management_amount,player_amount
    ) VALUES (
      p_match_id,v_team,v_entry,v_prize,v_profit,30,v_management,v_player_share
    );
  END IF;

  IF v_status='completed' THEN
    UPDATE public.match_results
    SET team_id=v_team,position=v_position,points=v_points
    WHERE match_id=p_match_id;

    IF NOT FOUND THEN
      INSERT INTO public.match_results(match_id,team_id,position,points)
      VALUES(p_match_id,v_team,v_position,v_points);
    END IF;

    UPDATE public.team_earnings
    SET team_id=v_team,amount=v_management
    WHERE match_id=p_match_id;

    IF NOT FOUND THEN
      INSERT INTO public.team_earnings(match_id,team_id,amount)
      VALUES(p_match_id,v_team,v_management);
    END IF;
  ELSE
    DELETE FROM public.match_results WHERE match_id=p_match_id;
    DELETE FROM public.team_earnings WHERE match_id=p_match_id;
  END IF;

  IF v_lineup_changed THEN
    DELETE FROM public.match_players WHERE match_id=p_match_id;
    DELETE FROM public.match_player_stats WHERE match_id=p_match_id;

    FOR v_player IN SELECT value FROM jsonb_array_elements(p_players)
    LOOP
      v_slot := v_slot+1;
      v_player_id := (v_player->>'player_id')::uuid;

      INSERT INTO public.match_players(match_id,player_id,team_id,slot_number)
      VALUES(p_match_id,v_player_id,v_team,v_slot);

      INSERT INTO public.match_player_stats(
        match_id,player_id,kills,assists,damage,mvp,placement,team_id_at_match
      ) VALUES (
        p_match_id,v_player_id,
        coalesce(nullif(v_player->>'kills','')::integer,0),
        coalesce(nullif(v_player->>'assists','')::integer,0),
        coalesce(nullif(v_player->>'damage','')::integer,0),
        coalesce((v_player->>'mvp')::boolean,false),
        coalesce(v_position,0),
        v_team
      );
    END LOOP;
  ELSE
    FOR v_player IN SELECT value FROM jsonb_array_elements(p_players)
    LOOP
      v_player_id := (v_player->>'player_id')::uuid;

      UPDATE public.match_player_stats
      SET kills=coalesce(nullif(v_player->>'kills','')::integer,0),
          assists=coalesce(nullif(v_player->>'assists','')::integer,0),
          damage=coalesce(nullif(v_player->>'damage','')::integer,0),
          mvp=coalesce((v_player->>'mvp')::boolean,false),
          placement=coalesce(v_position,0),
          team_id_at_match=v_team
      WHERE match_id=p_match_id AND player_id=v_player_id;

      IF NOT FOUND THEN
        INSERT INTO public.match_player_stats(
          match_id,player_id,kills,assists,damage,mvp,placement,team_id_at_match
        ) VALUES (
          p_match_id,v_player_id,
          coalesce(nullif(v_player->>'kills','')::integer,0),
          coalesce(nullif(v_player->>'assists','')::integer,0),
          coalesce(nullif(v_player->>'damage','')::integer,0),
          coalesce((v_player->>'mvp')::boolean,false),
          coalesce(v_position,0),
          v_team
        );
      END IF;
    END LOOP;
  END IF;

  PERFORM public.rebuild_player_earnings(p_match_id);

  IF v_status='completed' AND (
    SELECT count(DISTINCT pe.player_id)
    FROM public.player_earnings pe
    WHERE pe.match_id=p_match_id
  ) <> 4 THEN
    RAISE EXCEPTION 'Earnings reconciliation failed; match update rolled back';
  END IF;

  RETURN jsonb_build_object(
    'saved',true,
    'match_id',p_match_id,
    'player_count',4,
    'lineup_changed',v_lineup_changed
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_update_esports_match(uuid,jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_esports_match(uuid,jsonb,jsonb) TO authenticated;