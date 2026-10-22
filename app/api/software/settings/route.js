import {identity,HttpError,errResponse,noStore} from '../../../lib/match-center-server';
export const dynamic='force-dynamic';
export async function GET(request){
 try{
  const {db}=await identity(request);
  const {data,error}=await db.from('op_software_settings').select('announcement,announcement_enabled,updated_at').eq('id',1).maybeSingle();
  if(error)throw new HttpError('Software settings are not ready. Apply the database migration.',503);
  return Response.json({settings:data||{announcement:'',announcement_enabled:false}},{headers:noStore});
 }catch(error){return errResponse(error)}
}
export async function PUT(request){
 try{
  const {db}=await identity(request,true);
  const body=await request.json().catch(()=>null);
  if(!body||typeof body.announcement!=='string'||typeof body.announcement_enabled!=='boolean')throw new HttpError('Invalid settings.');
  const announcement=body.announcement.trim();
  if(announcement.length>300)throw new HttpError('Announcement must be at most 300 characters.');
  const {data,error}=await db.from('op_software_settings').upsert({id:1,announcement,announcement_enabled:body.announcement_enabled,updated_at:new Date().toISOString()},{onConflict:'id'}).select('announcement,announcement_enabled,updated_at').single();
  if(error)throw new HttpError('Unable to save software settings. Check database migration.',503);
  return Response.json({settings:data},{headers:noStore});
 }catch(error){return errResponse(error)}
}
