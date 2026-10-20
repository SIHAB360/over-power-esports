import { createHmac, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {visitorAdminClient} from '../../../lib/visitor-server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const answer=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
const limit=(value,max)=>typeof value==='string'?value.slice(0,max):'';
function identifyDevice(ua){
 const mobile=/iPhone|Android.*Mobile|Windows Phone/i.test(ua),tablet=/iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
 const browser=/Edg\//.test(ua)?'Edge':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Other';
 const os=/iPhone|iPad|iPod/.test(ua)?'iOS':/Android/.test(ua)?'Android':/Windows/.test(ua)?'Windows':/Mac OS/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Other';
 return {device_type:mobile?'Mobile':tablet?'Tablet':'Desktop',browser,os_name:os};
}
function referrerHost(text){
 if(!text)return '';
 try{const uri=new URL(text);return ['https:','http:'].includes(uri.protocol)?uri.hostname.slice(0,140):''}catch{return ''}
}
export async function POST(request){
 try{
  const host=request.headers.get('host')||'';
  const origin=request.headers.get('origin');
  if(origin && new URL(origin).host!==host)return answer({ok:false},403);
  if(Number(request.headers.get('content-length')||0)>2500)return answer({ok:false},413);
  const body=await request.json().catch(()=>null);
  if(!body||Array.isArray(body)||!uuid.test(body.sessionId||'')||!uuid.test(body.eventId||'')||!['page','heartbeat','exit'].includes(body.kind))return answer({ok:false},400);
  const rawPath=limit(body.path,250);
  if(!rawPath.startsWith('/')||rawPath.length>220||/[?#\x00-\x1f]/.test(rawPath))return answer({ok:false},400);
  // Drop full IP immediately after deriving a short, daily-rotating keyed pseudonym.
  const ip=limit(request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]||'',100);
  const key=process.env.VISITOR_ANALYTICS_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key)return answer({ok:false},503);
  const day=new Date().toISOString().slice(0,10);
  const ipGroup=createHmac('sha256',key).update(day+'|'+ip).digest('hex').slice(0,16);
  const ua=limit(request.headers.get('user-agent')||'',450);
  const device=identifyDevice(ua);
  let verified=null;
  const jwt=request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if(jwt&&jwt.length<2400){const {data:{user},error}=await visitorAdminClient().auth.getUser(jwt);if(!error&&user)verified=user}
  const country=limit(request.headers.get('x-vercel-ip-country')||'',70);
  const region=limit(request.headers.get('x-vercel-ip-country-region')||'',90);
  const city=limit(decodeURIComponent(request.headers.get('x-vercel-ip-city')||''),100);
  const refer=referrerHost(body.referrer);
  const source=!refer||refer===host.split(':')[0]?'Direct / Internal':/google|bing|duckduckgo|yahoo/i.test(refer)?'Organic Search':/facebook|instagram|tiktok|youtube|twitter|x\.com/i.test(refer)?'Social':'Referral';
  const {error}=await visitorAdminClient().rpc('visitor_record',{p_session:body.sessionId,p_event:body.eventId,p_kind:body.kind,
   p_data:{path:rawPath,ip_group:ipGroup,country,region,city,referrer_host:refer,source,
      account_id:verified?.id||null,account_email:verified?.email||null,
      language_code:limit(body.language,32),...device}});
  if(error){console.error('VISITOR_ANALYTICS_INGEST',error.code);return answer({ok:false},503)}
  return answer({ok:true});
 }catch{return answer({ok:false},400)}
}
