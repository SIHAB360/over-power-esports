import {identity,HttpError,errResponse,noStore} from '../../../lib/match-center-server';
export const dynamic='force-dynamic';
const fields=['announcement','announcement_enabled','app_title','welcome_message','banner_url','accent_color','maintenance_enabled','matches_enabled','wallet_enabled','tournaments_enabled'];
const defaults={announcement:'',announcement_enabled:false,app_title:'OVER POWER ESPORTS',welcome_message:'Your team, matches, inbox and wallet in one app.',banner_url:'',accent_color:'#0ea5e9',maintenance_enabled:false,matches_enabled:true,wallet_enabled:true,tournaments_enabled:true};
export async function GET(request){
 try{
  const {db}=await identity(request);
  const {data,error}=await db.from('op_software_settings').select(fields.join(',')).eq('id',1).maybeSingle();
  if(error)throw new HttpError('Unable to load software settings.',503);
  return Response.json({settings:{...defaults,...data}},{headers:noStore});
 }catch(error){return errResponse(error)}
}
export async function PUT(request){
 try{
  const {db}=await identity(request,true);
  const body=await request.json().catch(()=>null);
  if(!body||typeof body!=='object')throw new HttpError('Invalid settings.');
  const textLimits={announcement:300,app_title:60,welcome_message:180,banner_url:500};
  const flags=['announcement_enabled','maintenance_enabled','matches_enabled','wallet_enabled','tournaments_enabled'];
  const updates={id:1,updated_at:new Date().toISOString()};
  for(const [key,limit] of Object.entries(textLimits)){
   if(typeof body[key]!=='string'||body[key].length>limit)throw new HttpError('Invalid '+key);
   updates[key]=body[key].trim();
  }
  for(const key of flags){
   if(typeof body[key]!=='boolean')throw new HttpError('Invalid '+key);
   updates[key]=body[key];
  }
  if(!/^#[0-9a-fA-F]{6}$/.test(body.accent_color||''))throw new HttpError('Invalid accent color.');
  updates.accent_color=body.accent_color;
  if(updates.banner_url){
   let parsed;
   try{parsed=new URL(updates.banner_url)}catch{throw new HttpError('Invalid banner URL.')}
   if(parsed.protocol!=='https:')throw new HttpError('Banner URL must use HTTPS.');
  }
  const {data,error}=await db.from('op_software_settings').upsert(updates,{onConflict:'id'}).select(fields.join(',')).single();
  if(error)throw new HttpError('Unable to save software settings.',503);
  return Response.json({settings:data},{headers:noStore});
 }catch(error){return errResponse(error)}
}
