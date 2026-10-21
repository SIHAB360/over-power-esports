// Firebase service account credentials stay on the Vercel server only.
let firebase;
async function messaging(){
 if(firebase)return firebase;
 const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
 if(!raw)return null;
 const {initializeApp,getApps,cert}=await import('firebase-admin/app');
 const {getMessaging}=await import('firebase-admin/messaging');
 const name='over-power-esports-fcm';
 let app=getApps().find(a=>a.name===name);
 if(!app){
  const info=JSON.parse(raw);
  app=initializeApp({credential:cert(info)},name);
 }
 firebase=getMessaging(app);
 return firebase;
}
const badCodes=new Set(['messaging/registration-token-not-registered','messaging/invalid-registration-token']);
export async function sendNativeMatchPush(db,deviceRows,note,schedule){
 if(!deviceRows?.length)return {sent:0,retry:false};
 const gateway=await messaging().catch(error=>{
  console.error('Firebase gateway unavailable',error.message);return null;
 });
 if(!gateway)return {sent:0,retry:true};
 const label={created:'New match published','60m':'Match starts in 1 hour','30m':'Match starts in 30 minutes','15m':'Match starts in 15 minutes'};
 const title=label[note.event_key]||'OVER POWER match alert';
 const body=(schedule.title||'Match')+' • '+new Date(schedule.starts_at)
   .toLocaleString('en-BD',{timeZone:'Asia/Dhaka',hour:'numeric',minute:'2-digit',day:'2-digit',month:'short'});
 let sent=0,retry=false;
 const ttlMs=Math.max(60000,Math.min(86400000,new Date(schedule.starts_at).getTime()-Date.now()));
 for(const device of deviceRows){
  try{
   await gateway.send({
    token:device.token,
    data:{title,body,url:'/app?tab=alerts',notificationId:String(note.id)},
    android:{priority:'high',ttl:ttlMs,collapseKey:'op-match-'+note.id}
   });
   sent++;
  }catch(e){
   if(badCodes.has(e.code))await db.from('op_native_push_tokens').delete().eq('id',device.id);
   else{retry=true;console.warn('FCM delivery request failed',e.code||'unknown')}
  }
 }
 return {sent,retry};
}
