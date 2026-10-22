import {identity,errResponse,HttpError,noStore,recipients} from '../../../lib/match-center-server';
import {nativeMessaging} from '../../../lib/match-native-push-server';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const clean=(v,n)=>String(v??'').trim().slice(0,n);
function draft(b){
 const title=clean(b.title,80)||'OVER POWER ESPORTS';
 const date=clean(b.date,32),platform=clean(b.platform,60)||'Discord Voice',zone=clean(b.timezone,24)||'BST';
 const events=(Array.isArray(b.events)?b.events:[]).slice(0,8).map(x=>({name:clean(x.name,80),time:clean(x.time,40)})).filter(x=>x.name&&x.time);
 if(!date||!events.length)throw new HttpError('Date and at least one event with a time are required.');
 const lines=['🏆 TOURNAMENT ANNOUNCEMENT','📅 Date — '+date,'🎮 Platform — '+platform,'🌐 Time Zone — '+zone,'','🟢 '+title,'',...events.map(e=>'🏆 '+e.name+' — '+e.time),'','⚠️ '+(clean(b.instructions,220)||'All players must be online before the scheduled time.')];
 return lines.join('\n');
}
export async function POST(req){
 try{
  const {db}=await identity(req,true);
  const b=await req.json().catch(()=>null);
  if(!b||typeof b!=='object')throw new HttpError('Invalid announcement.');
  const text=clean(b.customText,1500)||draft(b);
  if(b.action==='preview')return Response.json({text},{headers:noStore});
  if(b.action!=='publish')throw new HttpError('Invalid action.');
  if(text.length<15||text.length>1500)throw new HttpError('Announcement must contain 15–1500 characters.');
  const title=clean(b.pushTitle,100)||'🏆 Tournament Announcement';
  const body=clean(b.pushBody,230)||text.split('\n').filter(Boolean).slice(1,4).join(' • ');
  const {error:saveError}=await db.from('op_software_settings').update({announcement:text,announcement_enabled:true,updated_at:new Date().toISOString()}).eq('id',1);
  if(saveError)throw new HttpError('Unable to publish in-app announcement.',503);
  const messaging=nativeMessaging();
  if(!messaging)return Response.json({published:true,pushSent:0,warning:'In-app announcement published, but Firebase push is not configured.'},{headers:noStore});
  const ids=await recipients(db,null);
  let sent=0,failed=0;
  for(let i=0;i<ids.length;i+=100){
   const {data:devices,error}=await db.from('op_match_native_push_tokens').select('id,token').in('user_id',ids.slice(i,i+100));
   if(error)throw new HttpError('Announcement published, but device lookup failed.',503);
   for(let j=0;j<(devices||[]).length;j+=500){
    const batch=devices.slice(j,j+500);
    if(!batch.length)continue;
    const result=await messaging.sendEachForMulticast({tokens:batch.map(x=>x.token),data:{title,body,url:'/app',type:'tournament-announcement'},android:{priority:'high',ttl:86400000}});
    sent+=result.successCount;failed+=result.failureCount;
    for(let k=0;k<result.responses.length;k++){
     const code=result.responses[k].error?.code;
     if(['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(code))await db.from('op_match_native_push_tokens').delete().eq('id',batch[k].id);
    }
   }
  }
  return Response.json({published:true,pushSent:sent,pushFailed:failed,recipientCount:ids.length},{headers:noStore});
 }catch(e){return errResponse(e)}
}
