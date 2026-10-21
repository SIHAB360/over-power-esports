import {HttpError} from './match-center-server';
import {nativeMessaging,sendNativeMatchAlert} from './match-native-push-server';

const EVENT_LABEL={created:'New match published', '60m':'Match starts in 1 hour',
 '30m':'Match starts in 30 minutes', '15m':'Match starts in 15 minutes'};
export async function queueSchedule(db,schedule,eventKey='created'){
 // The privileged SQL function chooses approved, authenticated recipients and
 // enforces uniqueness; an orphan roster record cannot fail the whole send.
 if(eventKey!=='created')throw new HttpError('Unsupported publication event.');
 const {data,error}=await db.rpc('op_enqueue_match_publication',{p_schedule_id:schedule.id});
 if(error)throw new HttpError('Could not enqueue approved-player notifications.',503);
 return Number(data||0);
}
export async function flushPush(db,limit=180){
 const {data:pending,error}=await db.from('op_match_notifications')
 .select('id,user_id,schedule_id,event_key,created_at')
 .is('push_sent_at',null)
 .gte('created_at',new Date(Date.now()-10*60000).toISOString())
 .order('created_at',{ascending:true}).limit(limit);
 if(error)throw new HttpError('Could not read queued notifications.',503);
 if(!pending?.length)return {processed:0,pushed:0,enabled:Boolean(process.env.VAPID_PUBLIC_KEY)};
 // All scheduled notifications exist in the in-app inbox regardless of push permission.
 const [webpush,{data:schedules},{data:subs},{data:nativeTokens}]=await Promise.all([
  import('web-push'),
  db.from('op_match_schedules').select('id,title,starts_at,status').in('id',[...new Set(pending.map(p=>p.schedule_id))]),
  db.from('op_match_push_subscriptions').select('id,user_id,endpoint,p256dh,auth').in('user_id',[...new Set(pending.map(p=>p.user_id))]),
  db.from('op_match_native_push_tokens').select('id,user_id,token').in('user_id',[...new Set(pending.map(p=>p.user_id))])
 ]);
 const ready=Boolean(process.env.VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY);
 const messaging=nativeMessaging();
 if(ready)webpush.default.setVapidDetails('https://over-power-esports.vercel.app',
  process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
 const scheduleMap=new Map((schedules||[]).map(s=>[s.id,s]));
 const subMap=new Map();
 for(const sub of subs||[]){if(!subMap.has(sub.user_id))subMap.set(sub.user_id,[]);subMap.get(sub.user_id).push(sub)}
 const nativeMap=new Map();
 for(const token of nativeTokens||[]){
  if(!nativeMap.has(token.user_id))nativeMap.set(token.user_id,[]);
  nativeMap.get(token.user_id).push(token);
 }
 let pushed=0,nativePushed=0;
 for(const note of pending){
  const s=scheduleMap.get(note.schedule_id);
  // Canceled schedules are not sent; old messages remain visible as history.
  let retryLater=false;
  if(ready&&s?.status==='published'){
   const payload=JSON.stringify({
    title:EVENT_LABEL[note.event_key]||'Upcoming match',
    body:s.title+' • '+new Date(s.starts_at).toLocaleString('en-BD',{timeZone:'Asia/Dhaka',hour:'numeric',minute:'2-digit',day:'2-digit',month:'short'}),
    url:'/player/dashboard#match-schedule',tag:'match-'+note.id
   });
   for(const sub of subMap.get(note.user_id)||[]){
    try{await webpush.default.sendNotification({
     endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}
    },payload,{TTL:Math.max(60,Math.min(86400,Math.floor((new Date(s.starts_at)-Date.now())/1000))),
      urgency:'high'});pushed++}
    catch(e){
     if([404,410].includes(Number(e.statusCode))){
      await db.from('op_match_push_subscriptions').delete().eq('id',sub.id);
     }else{retryLater=true;console.warn('Match push delivery error',e.statusCode||'transient')}
    }
   }
  }
  const devices=nativeMap.get(note.user_id)||[];
  if(devices.length&&s?.status==='published'){
   if(messaging){
    try{
     const result=await sendNativeMatchAlert(db,messaging,note,s,devices);
     nativePushed+=result.delivered;
     if(result.retry)retryLater=true;
    }catch(e){retryLater=true;console.warn('Native FCM send failed',e.code||e.message)}
   }else{
    retryLater=true; // Do not falsely mark native devices delivered without Firebase credentials.
   }
  }
  // Mark attempt finished, including users who declined push. The inbox row
  // remains unread until the player opens it. No silent permission requests.
  if(!retryLater)await db.from('op_match_notifications').update({push_sent_at:new Date().toISOString()}).eq('id',note.id);
 }
 return {processed:pending.length,pushed,nativePushed,enabled:ready,nativeConfigured:!!messaging};
}
