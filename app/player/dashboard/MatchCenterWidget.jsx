'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {supabase} from '../../lib/supabase';
import {FiBell,FiBellOff,FiCalendar,FiClock,FiCheck,FiRefreshCw} from 'react-icons/fi';
import './match-center-widget.css';

const dayFmt=new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',weekday:'long',day:'2-digit',month:'short'});
const timeFmt=new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hour12:true});
const currency=v=>'৳'+Number(v||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const encodeKey=b64=>{
 const s=(b64+'='.repeat((4-b64.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/');
 return Uint8Array.from(atob(s),c=>c.charCodeAt(0));
};
const alerts={created:'New match published', '60m':'1 hour left','30m':'30 minutes left','15m':'15 minutes left'};
export default function PlayerMatchCenter(){
 const [data,setData]=useState({schedules:[],inbox:[],unread:0});
 const [loading,setLoading]=useState(true),[working,setWorking]=useState(false);
 const [message,setMessage]=useState(''),[enabled,setEnabled]=useState(false),[supported,setSupported]=useState(false);
 const [showInbox,setShowInbox]=useState(false);
 const lastUnread=useRef(0);
 const api=useCallback(async(path,method='GET',body)=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('Please sign in again.');
  const res=await fetch(path,{method,cache:'no-store',headers:{
   Authorization:'Bearer '+session.access_token,...(body?{'Content-Type':'application/json'}:{})
  },body:body?JSON.stringify(body):undefined});
  const json=await res.json();
  if(!res.ok)throw Error(json.message||'Match Center could not update');
  return json;
 },[]);
 const refresh=useCallback(async()=>{
  try{
   const d=await api('/api/player/match-schedules');
   setData(d);
   const count=Number(d.unread||0);
   if(count>lastUnread.current)setShowInbox(true);
   lastUnread.current=count;
   setMessage('');
  }catch(e){setMessage(e.message)}
  finally{setLoading(false)}
 },[api]);
 useEffect(()=>{
  setSupported(typeof window!=='undefined'&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window);
  refresh();
  api('/api/player/match-subscription').then(s=>setEnabled(s.subscribed)).catch(()=>{});
  const t=setInterval(()=>{if(document.visibilityState==='visible')refresh()},45000);
  const focus=()=>refresh();
  window.addEventListener('focus',focus);
  return()=>{clearInterval(t);window.removeEventListener('focus',focus)};
 },[api,refresh]);
 const toggle=async()=>{
  setWorking(true);setMessage('');
  try{
   if(enabled){
    const reg=await navigator.serviceWorker.getRegistration('/match-notifications-sw.js');
    const sub=await reg?.pushManager.getSubscription();
    await api('/api/player/match-subscription','DELETE');
    await sub?.unsubscribe();setEnabled(false);setMessage('Phone push notifications turned off.');
   }else{
    if(!supported)throw Error('Web Push is unavailable in this browser. Keep using this inbox, or install the website on your phone.');
    const permission=await Notification.requestPermission();
    if(permission!=='granted')throw Error('Notification permission was not granted. Your in-app match inbox will still work.');
    const status=await api('/api/player/match-subscription');
    if(!status.vapidPublicKey)throw Error('Mobile push configuration is not ready yet.');
    const reg=await navigator.serviceWorker.register('/match-notifications-sw.js',{scope:'/'});
    await navigator.serviceWorker.ready;
    const subscription=await reg.pushManager.subscribe({
     userVisibleOnly:true,applicationServerKey:encodeKey(status.vapidPublicKey)
    });
    await api('/api/player/match-subscription','POST',{subscription:subscription.toJSON()});
    setEnabled(true);setMessage('Mobile match reminders enabled! Keep notifications allowed in your phone settings.');
   }
  }catch(e){setMessage(e.message)}
  finally{setWorking(false)}
 };
 const markRead=async(note)=>{
  try{await api('/api/player/match-schedules','PATCH',{id:note.id});
   if(!note.read_at)lastUnread.current=Math.max(0,lastUnread.current-1);
   setData(current=>({...current,
    unread:Math.max(0,current.unread-(note.read_at?0:1)),
    inbox:current.inbox.map(n=>n.id===note.id?{...n,read_at:new Date().toISOString()}:n)
   }))
  }catch(e){setMessage(e.message)}
 };
 const upcoming=useMemo(()=>data.schedules.filter(s=>new Date(s.starts_at)>Date.now()).slice(0,35),[data.schedules]);
 const byDay=useMemo(()=>{
  const map=new Map();
  for(const s of upcoming){
   const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(s.starts_at));
   if(!map.has(day))map.set(day,[]);
   map.get(day).push(s);
  }
  return [...map];
 },[upcoming]);
 const titleMap=new Map(data.schedules.map(s=>[s.id,s.title]));
 return <section className="op-player-match-center" id="match-schedule" aria-label="Player Match Center">
  <div className="op-player-match-header">
   <div><p className="op-player-match-kicker"><FiCalendar/> OVER POWER ESPORTS</p>
    <h2>My Match Center</h2>
    <p>Your upcoming lobby schedule, entry fees, prize pools and timely reminders.</p>
   </div>
   <div className="op-player-match-header-actions">
    <button type="button" className="op-player-match-bell" onClick={()=>setShowInbox(s=>!s)}
     aria-expanded={showInbox}><FiBell/> Notifications {data.unread>0&&<strong>{data.unread}</strong>}</button>
    <button type="button" onClick={refresh} aria-label="Refresh match schedule"><FiRefreshCw/></button>
   </div>
  </div>
  <div className="op-player-match-alertbar">
   <div><strong>Phone alerts</strong><span>On publish, 60, 30 and 15 minutes before each match</span></div>
   <button type="button" disabled={working||loading} onClick={toggle}
    className={enabled?'op-player-push-on':''} aria-pressed={enabled}>
    {enabled?<FiBell/>:<FiBellOff/>} {working?'Please wait…':enabled?'Enabled':'Enable alerts'}
   </button>
  </div>
  {message&&<p className="op-player-match-status" role="status">{message}</p>}
  {data.unread>0&&<button type="button" className="op-player-match-new" onClick={()=>setShowInbox(true)}><FiBell/> {data.unread} new match notification{data.unread===1?'':'s'} — view your upcoming matches</button>}
  {showInbox&&<div className="op-player-match-inbox">
    <h3>Notification inbox</h3>
    {data.inbox.length===0?<p>No match notifications yet.</p>:data.inbox.map(n=><button type="button" key={n.id}
     className={n.read_at?'is-read':''} onClick={()=>markRead(n)}>
     <span><strong>{alerts[n.event_key]||'Match reminder'}</strong><small>{titleMap.get(n.schedule_id)||'Upcoming match'}</small></span>
     <time>{timeFmt.format(new Date(n.created_at))}</time>{!n.read_at&&<FiCheck aria-label="Mark read"/>}
    </button>)}
   </div>}
  <div className="op-player-match-summary">
   <span><FiClock/> {upcoming.length} upcoming matches</span>
   <span>Scheduled entry fees: {currency(upcoming.reduce((sum,s)=>sum+s.entry_fee,0))}</span>
  </div>
  {loading?<p className="op-player-match-empty">Loading match schedule…</p>:
   byDay.length===0?<p className="op-player-match-empty">No upcoming matches yet. New schedules will appear here automatically.</p>:
   byDay.map(([day,items])=><div className="op-player-match-day" key={day}>
    <div className="op-player-match-date"><strong>{dayFmt.format(new Date(items[0].starts_at))}</strong>
     <small>{items.length} match{items.length===1?'':'es'} · {currency(items.reduce((n,s)=>n+s.entry_fee,0))} entry fees</small></div>
    {items.map((s,i)=><div key={s.id} className="op-player-match-fixture">
     <div className="op-player-match-time"><FiClock/><strong>{timeFmt.format(new Date(s.starts_at))}</strong><small>Match {i+1}</small></div>
     <div className="op-player-match-info"><h3>{s.title}</h3>
      <div><span className="fee">Entry {currency(s.entry_fee)}</span><span className="prize">Prize: {s.prize_pool}</span></div>
      {s.lobby_details&&<p>{s.lobby_details}</p>}{s.notes&&<small>{s.notes}</small>}
     </div>
    </div>)}
   </div>)}
  <p className="op-player-match-footnote">Approved players can see matches assigned to their squad (or all squads). Inactive roster status only affects match lineup eligibility. Reminder times use Bangladesh Standard Time (UTC+6). Phone alerts require permission and supported browser/PWA installation. You can always read alerts here.</p>
 </section>;
}
