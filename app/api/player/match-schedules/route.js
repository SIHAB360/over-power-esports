import {identity,playerFor,errResponse,noStore,HttpError,goodUuid,sanitizeSchedule} from '../../../lib/match-center-server';
export const dynamic='force-dynamic';
export async function GET(req){
 try{
  const {db,user,role}=await identity(req);
  const player=role==='player'?await playerFor(db,user.id):null;
  const floor=new Date(Date.now()-2*86400000).toISOString();
  let q=db.from('op_match_schedules').select('*').gte('starts_at',floor)
   .eq('status','published').order('starts_at',{ascending:true}).limit(150);
  const {data:schedules,error}=await q;
  if(error)throw new HttpError('Unable to load schedules.',503);
  const permitted=(schedules||[]).filter(s=>!s.team_id||role==='admin'||s.team_id===player?.team_id);
  const {data:inbox,error:ie}=await db.from('op_match_notifications')
   .select('id,schedule_id,event_key,created_at,read_at').eq('user_id',user.id)
   .order('created_at',{ascending:false}).limit(100);
  if(ie)throw new HttpError('Unable to load your notifications.',503);
  const allowed=new Set(permitted.map(s=>s.id));
  return Response.json({schedules:permitted.map(sanitizeSchedule),
    inbox:(inbox||[]).filter(n=>allowed.has(n.schedule_id)),
    unread:(inbox||[]).filter(n=>allowed.has(n.schedule_id)&&!n.read_at).length},
    {headers:noStore});
 }catch(e){return errResponse(e)}
}
export async function PATCH(req){
 try{
  const {db,user,role}=await identity(req);
  if(role==='player')await playerFor(db,user.id);
  const b=await req.json().catch(()=>null);
  if(!goodUuid(b?.id))throw new HttpError('Invalid notification.');
  const {data,error}=await db.from('op_match_notifications').update({read_at:new Date().toISOString()})
   .eq('id',b.id).eq('user_id',user.id).select('id').maybeSingle();
  if(error||!data)throw new HttpError('Notification not found.',404);
  return Response.json({ok:true},{headers:noStore});
 }catch(e){return errResponse(e)}
}
