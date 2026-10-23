import {identity,HttpError,errResponse,noStore,scheduleInput,sanitizeSchedule,goodUuid} from '../../../lib/match-center-server';
import {queueSchedule,flushPush} from '../../../lib/match-push-server';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(req){
 try{
  const {db}=await identity(req,true);
  const [{data:schedules,error},{data:teams}]=await Promise.all([
   db.from('op_match_schedules').select('*').order('starts_at',{ascending:true}).limit(500),
   db.from('teams').select('id,team_name').order('team_name')
  ]);
  if(error)throw new HttpError('Unable to load match schedule.',503);
  return Response.json({schedules:(schedules||[]).map(sanitizeSchedule),teams:teams||[]},{headers:noStore});
 }catch(e){return errResponse(e)}
}
export async function POST(req){
 try{
  const {db,user}=await identity(req,true);
  const b=await req.json().catch(()=>null);if(!b)throw new HttpError('Invalid schedule form.');
  const payload=scheduleInput(b);
  const {data,error}=await db.from('op_match_schedules').insert({...payload,created_by:user.id}).select('*').single();
  if(error)throw new HttpError(error.message,400);
  let notified=0,delivered=null,notificationWarning=false;
  try{
   notified=await queueSchedule(db,data);
   delivered=await flushPush(db);
  }catch(e){
   notificationWarning=true;
   console.warn('Match schedule alert queue failed',e.message);
  }
  // Never claim 0 successful alerts means all recipients were reached.
  // The saved match can be retried idempotently without creating a duplicate.
  return Response.json({schedule:sanitizeSchedule(data),notified,push:delivered,
   notificationWarning},{status:201,headers:noStore});
 }catch(e){return errResponse(e)}
}
export async function PATCH(req){
 try{
  const {db}=await identity(req,true);
  const b=await req.json().catch(()=>null);
  if(!goodUuid(b?.id))throw new HttpError('Invalid schedule ID.');
  const {data:old,error:oldError}=await db.from('op_match_schedules').select('id,status,starts_at,team_id').eq('id',b.id).maybeSingle();
  if(oldError||!old)throw new HttpError('Schedule not found.',404);
  if(b.action==='retry_notifications'){
   if(old.status!=='published')throw new HttpError('Cancelled match cannot send alerts.');
   const {data:schedule,error:se}=await db.from('op_match_schedules')
    .select('*').eq('id',b.id).single();
   if(se||!schedule)throw new HttpError('Schedule unavailable.',503);
   const notified=await queueSchedule(db,schedule,'created');
   let delivery=null;
   try{delivery=await flushPush(db)}
   catch(e){console.warn('Push deferred (inbox alerts saved)',e.message)}
   return Response.json({notified,push:delivery,ok:true},{headers:noStore});
  }
  if(b.action==='cancel'){
   const {data,error}=await db.from('op_match_schedules').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',b.id).select('*').single();
   if(error)throw new HttpError(error.message,400);
   return Response.json({schedule:sanitizeSchedule(data)},{headers:noStore});
  }
  if(b.action!=='edit')throw new HttpError('Unsupported schedule action.');
  if(old.status==='cancelled')throw new HttpError('A cancelled schedule cannot be edited.');
  const change=scheduleInput(b,true);
  const {data,error}=await db.from('op_match_schedules')
   .update({...change,updated_at:new Date().toISOString()})
   .eq('id',b.id).select('*').single();
  if(error)throw new HttpError(error.message,400);
  // A moved start time must receive new timed reminders. Old reminder
  // milestones are discarded without touching the original publish alert.
  if(new Date(old.starts_at).getTime()!==new Date(data.starts_at).getTime()){
   await db.from('op_match_notifications').delete().eq('schedule_id',b.id)
    .in('event_key',['60m','30m','15m']);
  }
  // Newly targeted squad members get the published alert exactly once.
  if(old.team_id!==data.team_id){
   try{await queueSchedule(db,data,'created');await flushPush(db)}
   catch(e){console.warn('Edited schedule notification queue',e.message)}
  }
  return Response.json({schedule:sanitizeSchedule(data)},{headers:noStore});
 }catch(e){return errResponse(e)}
}

export async function DELETE(req){
 try{
  const {db}=await identity(req,true);
  const b=await req.json().catch(()=>null);
  if(!goodUuid(b?.id))throw new HttpError('Invalid schedule ID.');
  // Notification rows cascade with the schedule; no orphan player alerts.
  const {data,error}=await db.from('op_match_schedules').delete().eq('id',b.id).select('id').maybeSingle();
  if(error)throw new HttpError(error.message,400);
  if(!data)throw new HttpError('Schedule not found.',404);
  return Response.json({ok:true,id:data.id},{headers:noStore});
 }catch(e){return errResponse(e)}
}
