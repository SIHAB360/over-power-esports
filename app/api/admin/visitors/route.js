import {NextResponse} from 'next/server';
import {supabaseAdmin} from '../../../lib/supabase-admin';
export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const respond=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(request){
 try{
  const token=request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if(!token)return respond({message:'Sign in required'},401);
  const {data:{user},error}=await supabaseAdmin.auth.getUser(token);
  if(error||!user)return respond({message:'Session expired'},401);
  const {data:profile,error:roleError}=await supabaseAdmin.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(roleError||profile?.role!=='admin'||user.app_metadata?.role!=='admin')return respond({message:'Main Admin only'},403);
  const query=new URL(request.url).searchParams;
  const session=query.get('session');
  if(session){
   if(!uuid.test(session))return respond({message:'Invalid session'},400);
   const {data,error:dbError}=await supabaseAdmin.rpc('visitor_timeline',{p_session:session});
   return dbError?respond({message:'Timeline unavailable'},503):respond({timeline:data||[]});
  }
  const hours=Number(query.get('hours')||24),page=Number(query.get('page')||1),search=(query.get('search')||'').trim();
  if(![24,168,720].includes(hours)||!Number.isInteger(page)||page<1||page>625||search.length>90)return respond({message:'Invalid report filter'},400);
  const {data,error:dbError}=await supabaseAdmin.rpc('visitor_dashboard',{p_hours:hours,p_offset:(page-1)*40,p_search:search});
  if(dbError){console.error('VISITOR_ANALYTICS_READ',dbError.code);return respond({message:'Analytics not available'},503)}
  return respond(data||{});
 }catch{return respond({message:'Analytics request failed'},503)}
}
