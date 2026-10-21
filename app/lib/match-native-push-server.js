// Firebase HTTP v1 native notifications are distinct from browser Web Push.
// Firebase service credentials are read ONLY on the trusted server at runtime.
import {initializeApp,cert,getApps} from 'firebase-admin/app';
import {getMessaging} from 'firebase-admin/messaging';

export function nativeMessaging(){
 const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
 if(!raw)return null;
 try{
  const account=JSON.parse(raw);
  if(!account.project_id||!account.client_email||!account.private_key)return null;
  const app=getApps().find(a=>a.name==='over-power-match-push')||
   initializeApp({credential:cert({
    projectId:account.project_id,
    clientEmail:account.client_email,
    privateKey:account.private_key
   })},'over-power-match-push');
  return getMessaging(app);
 }catch(e){
  console.error('Firebase native push configuration invalid:',e.message);
  return null;
 }
}
export async function sendNativeMatchAlert(db,messaging,note,schedule,tokens){
 if(!messaging||!tokens.length||schedule?.status!=='published')return {delivered:0,failed:0,retry:false};
 const labels={created:'New Match Published','60m':'Match Begins in 1 Hour',
  '30m':'Match Begins in 30 Minutes','15m':'Match Begins in 15 Minutes'};
 const message={
  tokens:tokens.map(t=>t.token),
  data:{title:labels[note.event_key]||'Match Reminder',
   body:schedule.title+' • '+new Date(schedule.starts_at).toLocaleString('en-BD',{
    timeZone:'Asia/Dhaka',day:'2-digit',month:'short',hour:'numeric',minute:'2-digit'}),
   url:'/app?tab=matches',notification_id:note.id},
  android:{priority:'high',ttl:Math.max(60000,Math.min(86400000,
   new Date(schedule.starts_at).getTime()-Date.now()))}
 };
 const response=await messaging.sendEachForMulticast(message);
 let retry=false,failed=0;
 for(let i=0;i<response.responses.length;i++){
  const outcome=response.responses[i];
  if(outcome.success)continue;
  failed++;
  const code=outcome.error?.code||'unknown';
  if(['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(code)){
   await db.from('op_match_native_push_tokens').delete().eq('id',tokens[i].id);
  }else{
   retry=true;
   console.warn('FCM native push failed:',code);
  }
 }
 return {delivered:response.successCount,failed,retry};
}
