import {identity,errResponse,noStore,HttpError} from '../../../lib/match-center-server';

export const dynamic='force-dynamic';

export async function GET(request){
 try{
  const {db,user,role}=await identity(request);
  const {data:profile,error:profileError}=await db.from('profiles')
   .select('full_name,email,role,avatar').eq('id',user.id).maybeSingle();
  if(profileError||!profile)throw new HttpError('Unable to load your account.',503);
  const safeProfile={
   full_name:profile.full_name||'',email:profile.email||user.email||'',
   role,avatar:typeof profile.avatar==='string'&&/^https:\/\//.test(profile.avatar)?profile.avatar:''
  };
  if(role==='admin'){
   const sources=['players','teams','matches','tournaments','op_match_schedules'];
   const counts=await Promise.all(sources.map(table=>db.from(table).select('id',{head:true,count:'exact'})));
   if(counts.some(c=>c.error))throw new HttpError('Unable to load admin summaries.',503);
   return Response.json({
    role,profile:safeProfile,
    counts:Object.fromEntries(sources.map((t,i)=>[t,counts[i].count||0]))
   },{headers:noStore});
  }
  const {data:player,error:playerError}=await db.from('players')
   .select('id,status,is_active,ign,full_name,team_id,team_name,verified,matches_played,wins,total_kills,profile_image,avatar_url,freefire_uid,country,age,phone,position,experience,joining_date,birth_date,primary_role,secondary_role,device,internet_connection,practice_time,game_experience,tournament_experience,average_br_kd_rate,expert_weapon,previous_team,social_media_link,facebook_link,instagram_link,tiktok_link,youtube_link,earning_percentage,created_at')
   .eq('user_id',user.id).maybeSingle();
  if(playerError)throw new HttpError('Player profile is temporarily unavailable.',503);
  let team=null;
  if(player?.team_id){
   const {data,error}=await db.from('teams')
    .select('id,team_name,logo,description,coach_name,manager_name,country,founded_year,total_winnings')
    .eq('id',player.team_id).maybeSingle();
   if(error)throw new HttpError('Team information is temporarily unavailable.',503);
   team=data;
  }
  const {data:tournaments,error:te}=await db.from('tournaments')
   .select('id,name,status,start_date,prize_pool')
   .order('start_date',{ascending:false}).limit(6);
  if(te)throw new HttpError('Tournaments temporarily unavailable.',503);
  const {data:matchStats,error:statsError}=player?await db.from('match_player_stats').select('id,kills,assists,damage,mvp,placement,team_id_at_match,matches(match_date,status,match_type,map,platform,entry_fee,prize_money,team_id)').eq('player_id',player.id).order('created_at',{ascending:false}).limit(60):{data:[],error:null};
  if(statsError)throw new HttpError('Match statistics temporarily unavailable.',503);
  const {data:withdrawals,error:withdrawalsError}=player?await db.from('withdrawal_requests').select('id,amount,status,provider,created_at,processed_at,transfer_fee,net_payout').eq('player_id',player.id).order('created_at',{ascending:false}).limit(30):{data:[],error:null};
  if(withdrawalsError)throw new HttpError('Withdrawal history temporarily unavailable.',503);
  return Response.json({
   role,profile:safeProfile,
   player:player?{
    status:player.status||'',is_active:!!player.is_active,
    ign:player.ign||'',full_name:player.full_name||'',
    avatar:[player.avatar_url,player.profile_image].find(v=>typeof v==='string'&&/^https:\/\//.test(v))||'',
    team_id:player.team_id||null,team_name:team?.team_name||player.team_name||'',
    verified:!!player.verified,matches_played:Number(player.matches_played||0),
    wins:Number(player.wins||0),total_kills:Number(player.total_kills||0),
    ...Object.fromEntries(['freefire_uid','country','age','phone','position','experience','joining_date','birth_date','primary_role','secondary_role','device','internet_connection','practice_time','game_experience','tournament_experience','average_br_kd_rate','expert_weapon','previous_team','social_media_link','facebook_link','instagram_link','tiktok_link','youtube_link','earning_percentage','created_at'].map(key=>[key,player[key]??null]))
   }:null,
   team:team?{name:team.team_name||'',logo:team.logo||'',description:team.description||'',
    coach_name:team.coach_name||'',manager_name:team.manager_name||'',country:team.country||'',founded_year:team.founded_year||null,total_winnings:team.total_winnings||0}:null,
   matchStats:matchStats||[],withdrawals:withdrawals||[],
   tournaments:(tournaments||[]).map(x=>({
    id:x.id,name:x.name,status:x.status,start_date:x.start_date,
    prize_pool:Number(x.prize_pool||0)
   }))
  },{headers:noStore});
 }catch(error){return errResponse(error)}
}
