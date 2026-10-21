import {identity,playerFor,errResponse,HttpError,noStore} from '../../../lib/match-center-server';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const validToken=t=>typeof t==='string' && t.length>=40 && t.length<=4096 &&
 /^[A-Za-z0-9:._-]+$/.test(t);
export async function POST(req){
 try{
  const {db,user,role}=await identity(req);
  if(role!=='player')throw new HttpError('Player account required.',403);
  await playerFor(db,user.id);
  const body=await req.json().catch(()=>null);
  if(!validToken(body?.token)||body?.platform!=='android')throw new HttpError('Invalid device registration.');
  const now=new Date().toISOString();
  const {error}=await db.from('op_match_native_push_tokens').upsert({
   token:body.token,user_id:user.id,platform:'android',updated_at:now
  },{onConflict:'token'});
  if(error)throw new HttpError('Unable to register device.',503);
  const {data:devices,error:listError}=await db.from('op_match_native_push_tokens')
   .select('id').eq('user_id',user.id).order('updated_at',{ascending:false});
  if(listError)throw new HttpError('Unable to validate registered devices.',503);
  if(devices.length>5){
   await db.from('op_match_native_push_tokens').delete().in('id',devices.slice(5).map(x=>x.id)).eq('user_id',user.id);
  }
  return Response.json({ok:true},{headers:noStore});
 }catch(e){return errResponse(e)}
}
export async function DELETE(req){
 try{
  const {db,user,role}=await identity(req);
  if(role!=='player')throw new HttpError('Player account required.',403);
  const body=await req.json().catch(()=>null);
  if(!validToken(body?.token))throw new HttpError('Invalid device token.');
  const {error}=await db.from('op_match_native_push_tokens').delete().eq('user_id',user.id).eq('token',body.token);
  if(error)throw new HttpError('Unable to remove device.',503);
  return Response.json({ok:true},{headers:noStore});
 }catch(e){return errResponse(e)}
}
