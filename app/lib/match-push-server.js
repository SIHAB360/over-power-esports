import {recipients,HttpError} from './match-center-server';

const EVENT_LABEL={created:'New match published', '60m':'Match starts in 1 hour',
 '30m':'Match starts in 30 minutes', '15m':'Match starts in 15 minutes'};
const chunks=(arr,n)=>Array.from({length:Math.ceil(arr.length/n)},(_,i)=>arr.slice(i*n,i*n+n));
export async function queueSchedule(db,schedule,eventKey='created'){
 const users=await recipients(db,schedule.team_id);
 let created=0;
 for(const group of chunks(users,100)){
  const {data,error}=await db.from('op_match_notifications')
   .upsert(group.map(user_id=>({schedule_id:schedule.id,user_id,event_key:eventKey})),
    {onConflict:'schedule_id,user_id,event_key',ignoreDuplicates:true})
   .select('id');
  if(error)throw new HttpError('Could not enqueue notifications.',503);
  created+=(data||[]).length;
 }
 return created;
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
 const [webpush,{data:schedules},{data:subs}]=await Promise.all([
  import('web-push'),
  db.from('op_match_schedules').select('id,title,starts_at,status').in('id',[...new Set(pending.map(p=>p.schedule_id))]),
  db.from('op_match_push_subscriptions').select('id,user_id,endpoint,p256dh,auth').in('user_id',[...new Set(pending.map(p=>p.user_id))])
 ]);
 const ready=Boolean(process.env.VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY);
 if(ready)webpush.default.setVapidDetails('mailto:admin@over-power-esports.example',
  process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
 const scheduleMap=new Map((schedules||[]).map(s=>[s.id,s]));
 const subMap=new Map();
 for(const sub of subs||[]){if(!subMap.has(sub.user_id))subMap.set(sub.user_id,[]);subMap.get(sub.user_id).push(sub)}
 let pushed=0;
 for(const note of pending){
  const s=scheduleMap.get(note.schedule_id);
  // Canceled schedules are not sent; old messages remain visible as history.
  if(ready&&s?.status==='published'){
   const payload=JSON.stringify({
    title:EVENT_LABEL[note.event_key]||'Upcoming match',
    body:s.title+' • '+new Date(s.starts_at).toLocaleString('en-BD',{timeZone:'Asia/Dhaka',hour:'numeric',minute:'2-digit',day:'2-digit',month:'short'}),
    url:'/player/dashboard#match-schedule',tag:'match-'+note.id
   });
   for(const sub of subMap.get(note.user_id)||[]){
    try{await webpush.default.sendNotification({
     endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}
    },payload,{TTL:Math.max(60,Math.floor((new Date(s.starts_at)-Date.now())/1000)),
      urgency:'high'});pushed++}
    catch(e){
     if([404,410].includes(Number(e.statusCode))){
      await db.from('op_match_push_subscriptions').delete().eq('id',sub.id);
     }else console.warn('Match push delivery error',e.statusCode||'transient');
    }
   }
  }
  // Mark attempt finished, including users who declined push. The inbox row
  // remains unread until the player opens it. No silent permission requests.
  await db.from('op_match_notifications').update({push_sent_at:new Date().toISOString()}).eq('id',note.id);
 }
 return {processed:pending.length,pushed,enabled:ready};
}
