-- Draft, not for production until the complete capability UI has been tested.
-- All operations run inside a single database transaction and require live RBAC grants.
CREATE OR REPLACE FUNCTION public.moderator_delegate_action(
 p_section text, p_action text, p_record_id uuid, p_payload jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $function$
DECLARE
 actor uuid:=auth.uid(); v_before jsonb; v_after jsonb;
 operation text:=coalesce(p_payload->>'operation',''); v_team uuid; v_entry uuid;
 v_match uuid; v_id uuid; v_count integer; v_name text; v_status text;
BEGIN
 IF p_section NOT IN ('matches','teams','tournaments','players','profit','achievements') OR
    p_action NOT IN ('create','edit','delete','approve') THEN
   RAISE EXCEPTION 'Unsupported delegated action' USING errcode='22023';
 END IF;
 IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' OR octet_length(p_payload::text)>10000 THEN
   RAISE EXCEPTION 'Invalid payload' USING errcode='22023';
 END IF;
 PERFORM public.moderator_access_check(p_section,p_action);
 IF p_record_id IS NULL AND p_action<>'create' THEN
   RAISE EXCEPTION 'Missing target record' USING errcode='22023';
 END IF;
 CASE p_section
 WHEN 'players' THEN
   IF p_action <> 'approve' THEN RAISE EXCEPTION 'Only player approval is supported' USING errcode='22023'; END IF;
   SELECT jsonb_build_object('id',p.id,'status',p.status,'verified',p.verified)
     INTO v_before FROM public.players p WHERE p.id=p_record_id FOR UPDATE;
   IF v_before IS NULL THEN RAISE EXCEPTION 'Player not found' USING errcode='P0002'; END IF;
   PERFORM set_config('op.moderator_delegate_scope','players:approve',true);
   UPDATE public.players p SET status='approved' WHERE p.id=p_record_id;
   PERFORM set_config('op.moderator_delegate_scope','',true);
   SELECT jsonb_build_object('id',p.id,'status',p.status,'verified',p.verified)
     INTO v_after FROM public.players p WHERE p.id=p_record_id;
 WHEN 'teams' THEN
   IF p_action <> 'edit' OR operation NOT IN ('assign_player','remove_player') THEN
     RAISE EXCEPTION 'Unsupported team management action' USING errcode='22023'; END IF;
   v_team:=nullif(p_payload->>'teamId','')::uuid;
   IF v_team IS NULL THEN RAISE EXCEPTION 'Team required' USING errcode='22023'; END IF;
   PERFORM 1 FROM public.teams t WHERE t.id=v_team FOR SHARE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Team missing' USING errcode='P0002'; END IF;
   SELECT jsonb_build_object('id',p.id,'team_id',p.team_id)
     INTO v_before FROM public.players p WHERE p.id=p_record_id FOR UPDATE;
   IF v_before IS NULL THEN RAISE EXCEPTION 'Player not found' USING errcode='P0002'; END IF;
   IF operation='assign_player' THEN
     IF (v_before->>'team_id') IS NOT NULL AND (v_before->>'team_id')<>'' THEN
       RAISE EXCEPTION 'Player already belongs to a team' USING errcode='42501'; END IF;
     PERFORM set_config('op.moderator_delegate_scope','teams:edit',true);
     UPDATE public.players p SET team_id=v_team WHERE p.id=p_record_id;
     PERFORM set_config('op.moderator_delegate_scope','',true);
   ELSE
     IF (v_before->>'team_id') IS DISTINCT FROM v_team::text THEN
       RAISE EXCEPTION 'Player does not belong to target team' USING errcode='42501'; END IF;
     PERFORM set_config('op.moderator_delegate_scope','teams:edit',true);
     UPDATE public.players p SET team_id=NULL WHERE p.id=p_record_id;
     PERFORM set_config('op.moderator_delegate_scope','',true);
   END IF;
   SELECT jsonb_build_object('id',p.id,'team_id',p.team_id)
     INTO v_after FROM public.players p WHERE p.id=p_record_id;
 WHEN 'tournaments' THEN
   IF p_action <> 'edit' OR operation NOT IN ('register_team','remove_team') THEN
     RAISE EXCEPTION 'Unsupported tournament management action' USING errcode='22023'; END IF;
   v_team:=nullif(p_payload->>'teamId','')::uuid;
   IF v_team IS NULL THEN RAISE EXCEPTION 'Team required' USING errcode='22023'; END IF;
   PERFORM 1 FROM public.tournaments t WHERE t.id=p_record_id FOR SHARE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Tournament missing' USING errcode='P0002'; END IF;
   PERFORM 1 FROM public.teams t WHERE t.id=v_team FOR SHARE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Team missing' USING errcode='P0002'; END IF;
   IF operation='register_team' THEN
     IF EXISTS(SELECT 1 FROM public.tournament_teams WHERE tournament_id=p_record_id AND team_id=v_team) THEN
       RAISE EXCEPTION 'Team already registered' USING errcode='23505'; END IF;
     INSERT INTO public.tournament_teams(tournament_id,team_id,status)
       VALUES(p_record_id,v_team,'registered') RETURNING id INTO v_entry;
     v_after:=jsonb_build_object('id',v_entry,'tournament_id',p_record_id,'team_id',v_team,'status','registered');
   ELSE
     SELECT jsonb_build_object('id',tt.id,'tournament_id',tt.tournament_id,'team_id',tt.team_id,'status',tt.status)
       INTO v_before FROM public.tournament_teams tt
       WHERE tt.tournament_id=p_record_id AND tt.team_id=v_team FOR UPDATE;
     IF v_before IS NULL THEN RAISE EXCEPTION 'Registration missing' USING errcode='P0002'; END IF;
     DELETE FROM public.tournament_teams WHERE id=(v_before->>'id')::uuid;
     v_after:=jsonb_build_object('id',(v_before->>'id')::uuid,'removed',true,'team_id',v_team);
   END IF;
 WHEN 'achievements' THEN
   IF p_action='create' THEN
     IF p_record_id IS NOT NULL THEN RAISE EXCEPTION 'Create cannot specify ID' USING errcode='22023'; END IF;
     v_name:=btrim(coalesce(p_payload->>'title',''));
     IF length(v_name)>130 THEN RAISE EXCEPTION 'Title too long' USING errcode='22023'; END IF;
     IF nullif(p_payload->>'file_path','') IS NULL OR length(p_payload->>'file_path')>600 OR
        left(p_payload->>'file_path',length(actor::text)+1) <> actor::text||'/' THEN
       RAISE EXCEPTION 'Upload screenshot to your own folder first' USING errcode='42501'; END IF;
     IF NOT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='achievement-gallery'
                    AND o.name=p_payload->>'file_path') THEN
       RAISE EXCEPTION 'Achievement file not found' USING errcode='22023'; END IF;
     INSERT INTO public.achievement_gallery(file_path,title,category,team_id,is_published,sort_order,created_by)
     VALUES(p_payload->>'file_path',nullif(v_name,''),left(coalesce(p_payload->>'category','general'),90),
       nullif(p_payload->>'team_id','')::uuid,false,0,actor) RETURNING id INTO v_id;
     p_record_id:=v_id;
     v_after:=jsonb_build_object('id',v_id,'title',v_name,'is_published',false);
   ELSIF p_action='edit' THEN
     SELECT jsonb_build_object('id',g.id,'title',g.title,'category',g.category,'team_id',g.team_id,'sort_order',g.sort_order)
       INTO v_before FROM public.achievement_gallery g WHERE g.id=p_record_id FOR UPDATE;
     IF v_before IS NULL THEN RAISE EXCEPTION 'Screenshot missing' USING errcode='P0002'; END IF;
     UPDATE public.achievement_gallery g SET
       title=case when p_payload?'title' then left(coalesce(p_payload->>'title',''),130) else g.title end,
       category=case when p_payload?'category' then left(coalesce(p_payload->>'category',''),90) else g.category end,
       team_id=case when p_payload?'team_id' then nullif(p_payload->>'team_id','')::uuid else g.team_id end,
       sort_order=case when p_payload?'sort_order' then (p_payload->>'sort_order')::integer else g.sort_order end
       WHERE g.id=p_record_id;
     SELECT jsonb_build_object('id',g.id,'title',g.title,'category',g.category,'team_id',g.team_id,'sort_order',g.sort_order)
       INTO v_after FROM public.achievement_gallery g WHERE g.id=p_record_id;
   ELSIF p_action='approve' THEN
     SELECT jsonb_build_object('id',g.id,'is_published',g.is_published)
       INTO v_before FROM public.achievement_gallery g WHERE g.id=p_record_id FOR UPDATE;
     IF v_before IS NULL THEN RAISE EXCEPTION 'Screenshot missing' USING errcode='P0002'; END IF;
     UPDATE public.achievement_gallery SET is_published=coalesce((p_payload->>'is_published')::boolean,false)
       WHERE id=p_record_id;
     SELECT jsonb_build_object('id',g.id,'is_published',g.is_published)
       INTO v_after FROM public.achievement_gallery g WHERE g.id=p_record_id;
   ELSIF p_action='delete' THEN
     SELECT jsonb_build_object('id',g.id,'file_path',g.file_path,'is_published',g.is_published)
       INTO v_before FROM public.achievement_gallery g WHERE g.id=p_record_id FOR UPDATE;
     IF v_before IS NULL THEN RAISE EXCEPTION 'Screenshot missing' USING errcode='P0002'; END IF;
     DELETE FROM public.achievement_gallery WHERE id=p_record_id;
     v_after:=jsonb_build_object('id',p_record_id,'deleted',true,'file_path',v_before->>'file_path');
   ELSE RAISE EXCEPTION 'Unsupported gallery action' USING errcode='22023'; END IF;
 WHEN 'matches' THEN
   IF p_action <> 'delete' THEN RAISE EXCEPTION 'Unsupported match operation' USING errcode='22023';END IF;
   SELECT jsonb_build_object('id',m.id,'status',m.status,'entry_fee',m.entry_fee,'prize_money',m.prize_money)
     INTO v_before FROM public.matches m WHERE m.id=p_record_id FOR UPDATE;
   IF v_before IS NULL THEN RAISE EXCEPTION 'Match missing' USING errcode='P0002'; END IF;
   -- Settlement safeguard: never delete a completed match with pending or paid withdrawals.
   IF EXISTS(SELECT 1 FROM public.player_earnings pe JOIN public.withdrawal_requests w
              ON w.player_id=pe.player_id
             WHERE pe.match_id=p_record_id AND w.status IN ('pending','approved','paid')) THEN
      RAISE EXCEPTION 'Match has outstanding or settled withdrawals' USING errcode='42501'; END IF;
   DELETE FROM public.matches WHERE id=p_record_id;
   v_after:=jsonb_build_object('id',p_record_id,'deleted',true);
 WHEN 'profit' THEN
   IF p_action <> 'delete' THEN RAISE EXCEPTION 'Unsupported finance action' USING errcode='22023';END IF;
   SELECT jsonb_build_object('id',f.id,'match_id',f.match_id,'entry_fee',f.entry_fee,
       'prize_money',f.prize_money,'profit',f.profit)
     INTO v_before FROM public.match_finance f WHERE f.id=p_record_id FOR UPDATE;
   IF v_before IS NULL THEN RAISE EXCEPTION 'Finance record not found' USING errcode='P0002'; END IF;
   v_match:=(v_before->>'match_id')::uuid;
   IF v_match IS NOT NULL AND EXISTS(SELECT 1 FROM public.player_earnings pe JOIN public.withdrawal_requests w
       ON pe.player_id=w.player_id WHERE pe.match_id=v_match AND w.status IN ('pending','approved','paid')) THEN
       RAISE EXCEPTION 'Finance record locked because of withdrawals' USING errcode='42501'; END IF;
   DELETE FROM public.match_finance WHERE id=p_record_id;
   v_after:=jsonb_build_object('id',p_record_id,'deleted',true);
 END CASE;
 INSERT INTO public.moderator_operation_audit(actor_id,section,action,record_id,before_data,after_data)
 VALUES(actor,p_section,p_action,coalesce(p_record_id,v_id),v_before,v_after);
 RETURN coalesce(v_after,'{}'::jsonb);
END;$function$;
REVOKE ALL ON FUNCTION public.moderator_delegate_action(text,text,uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.moderator_delegate_action(text,text,uuid,jsonb) TO authenticated;
