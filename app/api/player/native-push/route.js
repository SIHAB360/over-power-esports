import {identity,playerFor,errResponse,noStore,HttpError} from '../../../lib/match-center-server';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const validToken=s=>typeof s==='string'&&s.length>=50&&s.length<=512&&/^[A-Za-z0-9_:\-]+$/.test(s);

export async function GET(req){
 try{
  const {db,user,role}=await identity(req);
  if(role!=='player')throw new HttpError('Approved players only.',403);
  await playerFor(db,user.id);
  const {data,error}=await db.from('op_native_push_tokens')
   .select('id').eq('user_id',user.id).limit(5);
  if(error)throw new HttpError('Notification settings unavailable.',503);
  return Response.json({registeredDevices:(data||[]).length,enabled:(data||[]).length>0},
   {headers:noStore});
 }catch(e){return errResponse(e)}
}
export async function POST(req){
 try{
  const {db,user,role}=await identity(req);
  if(role!=='player')throw new HttpError('Approved players only.',403);
  await playerFor(db,user.id);
  const body=await req.json().catch(()=>null);
  if(body?.platform!=='android'||!validToken(body?.token))
   throw new HttpError('Invalid Android FCM device token.');
  if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
   throw new HttpError('Native push gateway is not configured yet.',503);
  const {data:existing,error:ce}=await db.from('op_native_push_tokens')
   .select('id,token').eq('user_id',user.id).limit(6);
  if(ce)throw new HttpError('Cannot check device registrations.',503);
  if((existing||[]).length>=5&&!(existing||[]).some(x=>x.token===body.token))
   throw new HttpError('Maximum five notification devices per player.',409);
  const {error}=await db.from('op_native_push_tokens').upsert({
    user_id:user.id,token:body.token,platform:'android',
    app_version:String(body.version||'').slice(0,30),updated_at:new Date().toISOString()
   },{onConflict:'token'});
  if(error)throw new HttpError('Could not register this device.',503);
  return Response.json({enabled:true},{headers:noStore});
 }catch(e){return errResponse(e)}
}
export async function DELETE(req){
 try{
  const {db,user,role}=await identity(req);
  if(role!=='player')throw new HttpError('Player account required.',403);
  const body=await req.json().catch(()=>null);
  if(!validToken(body?.token))throw new HttpError('Invalid device token.');
  const {error}=await db.from('op_native_push_tokens')
   .delete().eq('user_id',user.id).eq('token',body.token);
  if(error)throw new HttpError('Could not disable phone alerts.',503);
  return Response.json({enabled:false},{headers:noStore});
 }catch(e){return errResponse(e)}
}
