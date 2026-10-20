import {identity,playerFor,errResponse,noStore,HttpError} from '../../../../lib/match-center-server';
export const dynamic='force-dynamic';
export async function GET(req){
 try{
  const {db,user,role}=await identity(req);
  if(role==='player')await playerFor(db,user.id);
  const {data,error}=await db.from('op_match_push_subscriptions').select('id').eq('user_id',user.id).limit(1);
  if(error)throw new HttpError('Subscription unavailable.',503);
  return Response.json({subscribed:(data||[]).length>0,vapidPublicKey:process.env.VAPID_PUBLIC_KEY||null},{headers:noStore});
 }catch(e){return errResponse(e)}
}
export async function POST(req){
 try{
  const {db,user,role}=await identity(req);
  if(role==='player')await playerFor(db,user.id);
  const b=await req.json().catch(()=>null);
  const sub=b?.subscription;
  if(!sub?.endpoint?.startsWith('https://')||sub.endpoint.length>2048
      ||typeof sub.keys?.p256dh!=='string'||typeof sub.keys?.auth!=='string'
      ||sub.keys.p256dh.length>500||sub.keys.auth.length>500)
   throw new HttpError('Invalid browser push subscription.');
  const {error}=await db.from('op_match_push_subscriptions').upsert({
   user_id:user.id,endpoint:sub.endpoint,p256dh:sub.keys.p256dh,auth:sub.keys.auth,
   updated_at:new Date().toISOString()
  },{onConflict:'endpoint'});
  if(error)throw new HttpError('Could not save push subscription.',503);
  return Response.json({subscribed:true},{headers:noStore});
 }catch(e){return errResponse(e)}
}
export async function DELETE(req){
 try{
  const {db,user}=await identity(req);
  const {error}=await db.from('op_match_push_subscriptions').delete().eq('user_id',user.id);
  if(error)throw new HttpError('Unable to disable alerts.',503);
  return Response.json({subscribed:false},{headers:noStore});
 }catch(e){return errResponse(e)}
}
