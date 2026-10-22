'use client';
import {useEffect,useMemo,useState} from 'react';
import {supabase} from '../../lib/supabase';
import TournamentComposer from '../software-control/TournamentComposer';
import {FiCalendar,FiClock,FiPlus,FiBell,FiRefreshCw,FiEdit2,FiXCircle,FiCheckCircle,FiDollarSign,FiAward} from 'react-icons/fi';
import './schedule-center.css';
import './schedule-premium-lighting.css';

const fmtTime=new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hour12:true});
const fmtDay=new Intl.DateTimeFormat('en-BD',{timeZone:'Asia/Dhaka',weekday:'long',month:'short',day:'2-digit',year:'numeric'});
const localInput=s=>{
 if(!s)return'';
 const p=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(s));
 return p.replace(' ','T');
};
const blank=()=>({title:'',local_time:localInput(Date.now()+86400000),entry_fee:'',prize_pool:'',lobby_details:'',notes:'',team_id:''});
const money=v=>'৳'+Number(v||0).toLocaleString('en-BD',{maximumFractionDigits:2});
export default function AdminMatchScheduleCenter(){
 const [form,setForm]=useState(blank);
 const [rows,setRows]=useState([]),[teams,setTeams]=useState([]);
 const [selectedDate,setSelectedDate]=useState('');
 const [view,setView]=useState('today');
 const [editing,setEditing]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const [notice,setNotice]=useState(''),[err,setErr]=useState('');
 const [pendingCancel,setPendingCancel]=useState(null);
 const [pushHealth,setPushHealth]=useState(null);
 const [pushHealthError,setPushHealthError]=useState(false);
 const checkPushHealth=async()=>{
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token)return;
   const r=await fetch('/api/admin/match-push-status',{cache:'no-store',
    headers:{Authorization:'Bearer '+session.access_token}});
   if(!r.ok)throw Error('Unavailable');
   const body=await r.json();
   setPushHealth(body);setPushHealthError(false);
  }catch{setPushHealthError(true)}
 };
 const request=async(method='GET',body=null)=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('Admin login required');
  const res=await fetch('/api/admin/match-schedules',{method,headers:{
   Authorization:'Bearer '+session.access_token,...(body?{'Content-Type':'application/json'}:{})
  },body:body?JSON.stringify(body):undefined,cache:'no-store'});
  const json=await res.json();
  if(!res.ok)throw Error(json.message||'Could not update schedule');
  return json;
 };
 const load=async()=>{
  setLoading(true);
  try{const d=await request();setRows(d.schedules||[]);setTeams(d.teams||[])}
  catch(e){setErr(e.message)}
  finally{setLoading(false)}
 };
 useEffect(()=>{load();checkPushHealth()},[]);
 const upcoming=rows.filter(r=>r.status==='published'&&new Date(r.starts_at).getTime()>Date.now());
 const days=useMemo(()=>{
  const map=new Map();
  for(const s of rows){
   const day=localInput(s.starts_at).slice(0,10);
   if(view==='today'&&day!==localInput(Date.now()).slice(0,10))continue;
   if(view==='upcoming'&&(s.status!=='published'||new Date(s.starts_at).getTime()<Date.now()))continue;
   if(view==='history'&&s.status==='published'&&new Date(s.starts_at).getTime()>=Date.now())continue;
   if(selectedDate&&day!==selectedDate)continue;
   if(!map.has(day))map.set(day,[]);
   map.get(day).push(s);
  }
  return [...map].sort((a,b)=>a[0].localeCompare(b[0]));
 },[rows,selectedDate]);
 const totalFee=upcoming.reduce((sum,r)=>sum+Number(r.entry_fee||0),0);
 const update=(k,v)=>setForm(f=>({...f,[k]:v}));
 const publish=async(e)=>{
  e.preventDefault();setErr('');setNotice('');setSaving(true);
  try{
   const payload={...form,entry_fee:Number(form.entry_fee),team_id:form.team_id||null};
   const d=await request(editing?'PATCH':'POST',editing?{...payload,id:editing,action:'edit'}:payload);
   setNotice(editing?'Match schedule updated.':d.notificationWarning?'Match saved, but player alerts could not be queued. Use Sync alerts for this match.':'Match published! '+d.notified+' approved-player inbox alert(s) added. Phone push requires player opt-in.');
   setEditing(null);setForm(blank());await load();
  }catch(e){setErr(e.message)}
  finally{setSaving(false)}
 };
 const syncAlerts=async(row)=>{
  setSaving(true);setErr('');setNotice('');
  try{
   const result=await request('PATCH',{action:'retry_notifications',id:row.id});
   setNotice('Notification sync complete for '+row.title+'. '+result.notified+
    ' new approved-player inbox alert(s) added; existing alerts were not duplicated.');
  }catch(e){setErr(e.message)}
  finally{setSaving(false)}
 };
 const edit=row=>{setEditing(row.id);setForm({
  title:row.title,local_time:localInput(row.starts_at),entry_fee:String(row.entry_fee),
  prize_pool:row.prize_pool,lobby_details:row.lobby_details,notes:row.notes,team_id:row.team_id||''
 });document.querySelector('.op-schedule-form')?.scrollIntoView({behavior:'smooth',block:'start'});};
 const cancel=async()=>{
  if(!pendingCancel)return;
  setSaving(true);setErr('');
  try{await request('PATCH',{action:'cancel',id:pendingCancel.id});
   setNotice('Match schedule cancelled. Future reminders will not be sent.');
   setPendingCancel(null);await load();
  }catch(e){setErr(e.message)}
  finally{setSaving(false)}
 };
 return <main className="op-schedule-center">
  <header className="op-schedule-header">
   <div className="op-schedule-kicker"><FiCalendar/> OVER POWER • PREMIUM MATCH OPERATIONS</div>
   <h1>Match Schedule Center</h1>
   <p>Publish daily lobby schedules and send player reminders automatically. Prize pool is display-only; only the entry fee contributes to the operational schedule total.</p>
   <div className="op-schedule-reminder-badges">
    <span><FiBell/> On publish</span><span>60 min before</span><span>30 min before</span><span>15 min before</span>
   </div>
  </header>
  <div className="op-schedule-kpis">
   <div><FiCalendar/><span>Upcoming matches</span><strong>{upcoming.length}</strong></div>
   <div><FiDollarSign/><span>Upcoming entry fee total</span><strong>{money(totalFee)}</strong></div>
   <div><FiAward/><span>Prize pools</span><strong>Display only</strong></div>
  </div>
  {notice&&<div className="op-schedule-success" role="status"><FiCheckCircle/>{notice}</div>}
  {err&&<div className="op-schedule-error" role="alert">{err}</div>}
  <section className="op-schedule-card" style={{marginBottom:20}}><div className="op-schedule-heading"><FiBell/><h2>Tournament Announcements</h2></div><p>Manually select the tournament, date, platform, schedule and player instructions. Generate a preview before sending Android push.</p><TournamentComposer/></section>
  <div className="op-schedule-columns">
   <section className="op-schedule-card op-schedule-form" aria-label="Create match schedule">
    <div className="op-schedule-heading"><FiPlus/><h2>{editing?'Edit match schedule':'Publish a match'}</h2></div>
    <form onSubmit={publish}>
     <label>Match name / lobby number<input required minLength={3} maxLength={120} value={form.title}
       onChange={e=>update('title',e.target.value)} placeholder="BR Lobby #01 • Evening"/></label>
     <label>Date and time (Bangladesh, UTC+6)<input type="datetime-local" required
       value={form.local_time} onChange={e=>update('local_time',e.target.value)}/></label>
     <div className="op-schedule-form-pair">
      <label>Lobby entry fee (৳)<input required type="number" min="0" max="1000000" step="0.01"
       value={form.entry_fee} onChange={e=>update('entry_fee',e.target.value)} placeholder="80"/></label>
      <label>Prize pool (text, not calculated)<input value={form.prize_pool} maxLength={160}
       onChange={e=>update('prize_pool',e.target.value)} placeholder="৳2,000 + bonus"/></label>
     </div>
     <label>Notify which squad? (select All for every approved player)<select value={form.team_id} onChange={e=>update('team_id',e.target.value)}>
      <option value="">All approved players (both squads)</option>
      {teams.map(t=><option key={t.id} value={t.id}>{t.team_name}</option>)}
     </select></label>
     <label>Lobby / room details<input maxLength={500} value={form.lobby_details}
       onChange={e=>update('lobby_details',e.target.value)} placeholder="Map • Mode • Rules"/></label>
     <label>Additional instructions<textarea rows={3} maxLength={1000} value={form.notes}
       onChange={e=>update('notes',e.target.value)} placeholder="Be ready 10 minutes early…"/></label>
     <div className="op-schedule-form-actions">
      <button type="submit" disabled={saving}>{saving?'Saving…':editing?'Save schedule changes':'Publish & notify players'}</button>
      {editing&&<button type="button" className="op-schedule-secondary" onClick={()=>{setEditing(null);setForm(blank())}}>Cancel edit</button>}
     </div>
    </form>
   </section>
   <section className="op-schedule-card" aria-label="Published schedule timeline">
    <div className="op-schedule-heading"><FiClock/><h2>Match timeline</h2></div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{[["today","Today"],["upcoming","Upcoming"],["history","History"],["all","All Matches"]].map(([key,label])=><button type="button" key={key} aria-pressed={view===key} onClick={()=>{setView(key);setSelectedDate("")}} style={{padding:"10px 16px",borderRadius:12,border:"1px solid #617ca6",background:view===key?"#2563eb":"#182c49",color:"#fff",fontWeight:700}}>{label}</button>)}</div>
    <div className="op-schedule-filters">
     <label>Filter match date <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}/></label>
     <button type="button" className="op-schedule-secondary" disabled={loading} onClick={()=>{setSelectedDate('');load()}}><FiRefreshCw/> Refresh</button>
    </div>
    {loading?<p className="op-schedule-empty">Loading schedules…</p>:days.length===0?
     <p className="op-schedule-empty">No matches scheduled for this date.</p>:
    days.map(([day,items])=><div className="op-schedule-day" key={day}>
     <div className="op-schedule-day-title"><strong>{fmtDay.format(new Date(day+'T12:00:00+06:00'))}</strong>
      <span>{items.filter(s=>s.status==='published').length} matches · Entry fees: {money(items.filter(s=>s.status==='published').reduce((n,s)=>n+Number(s.entry_fee),0))}</span>
     </div>
     {items.map((s,index)=><article className={'op-schedule-match'+(s.status==='cancelled'?' is-cancelled':'')} key={s.id}>
      <div className="op-schedule-match-time"><span>{fmtTime.format(new Date(s.starts_at))}</span><small>#{index+1}</small></div>
      <div className="op-schedule-match-main"><h3>{s.title}</h3>
       <div><span>Entry {money(s.entry_fee)}</span><span>Prize: {s.prize_pool}</span></div>
       <small>{teams.find(t=>t.id===s.team_id)?.team_name||'All squads'} · {s.lobby_details||'Details pending'}</small>
       {s.notes&&<p>{s.notes}</p>}
      </div>
      {s.status==='published'?<div className="op-schedule-match-buttons">
       <button type="button" aria-label={'Sync alerts for '+s.title} disabled={saving} onClick={()=>syncAlerts(s)}><FiBell/> Sync alerts</button>
       <button type="button" aria-label={'Edit '+s.title} onClick={()=>edit(s)}><FiEdit2/> Edit</button>
       <button type="button" aria-label={'Cancel '+s.title} onClick={()=>setPendingCancel(s)}><FiXCircle/> Cancel</button>
      </div>:<span className="op-schedule-cancelled">Cancelled</span>}
     </article>)}
    </div>)}
    <section className="op-schedule-native-status" aria-label="System push notification status">
     <div className="op-schedule-native-status-head">
      <strong><FiBell aria-hidden="true"/> Android Push Readiness</strong>
      <button type="button" className="op-schedule-secondary" onClick={checkPushHealth} aria-label="Refresh Android push readiness">
       <FiRefreshCw/> Check
      </button>
     </div>
     {pushHealth?
      <div className="op-schedule-native-status-grid">
       <span><b>{pushHealth.registeredAndroidDevices}</b> Android devices opted in</span>
       <span><b>{pushHealth.webPushDevices}</b> browser push devices</span>
       <span><b>{pushHealth.firebaseConfigured?'Configured':'Not configured'}</b> Firebase server</span>
      </div>:
      <p>{pushHealthError?'Could not load push readiness. Match inbox alerts still work.':'Checking push setup…'}</p>}
     {pushHealth&&(!pushHealth.firebaseConfigured||!pushHealth.registeredAndroidDevices)&&
      <p className="op-schedule-native-status-warning">
       {pushHealth.firebaseConfigured?'No Android player has opted into notifications yet.':'Firebase server credentials are not set, so Android closed-app banners cannot be sent yet.'}
       {' '}Each approved player must enable Android Notifications from their app Home or Inbox.
      </p>}
     <p className="op-schedule-native-status-info">This is configuration and enrollment status, not proof of push delivery. <a href="https://firebase.google.com/docs/cloud-messaging/android/get-started" target="_blank" rel="noopener noreferrer">Firebase setup guide</a></p>
    </section>
    <aside className="op-schedule-insight" aria-label="Match notification timing">
     <div className="op-schedule-insight-inner">
      <div className="op-schedule-insight-title"><FiBell aria-hidden="true"/> Automatic reminder sequence</div>
      <p>Players receive an in-app alert when a match is published and before kickoff. Phone push alerts are sent only to players who enable them.</p>
      <div className="op-schedule-insight-steps" aria-label="Four match notification milestones">
       <span>Published</span><span>60 minutes</span><span>30 minutes</span><span>15 minutes</span>
      </div>
      <p className="op-schedule-insight-note">Entry fees count toward the schedule total. Prize pools remain informational only.</p>
     </div>
    </aside>
   </section>
  </div>
  {pendingCancel&&<div className="op-schedule-modal-backdrop" role="presentation"><div role="dialog" aria-modal="true" aria-label="Confirm schedule cancellation" className="op-schedule-modal">
   <h3>Cancel “{pendingCancel.title}”?</h3><p>Players will no longer receive upcoming reminders for this match. History remains saved.</p>
   <div><button type="button" disabled={saving} onClick={cancel}>Confirm cancellation</button><button type="button" onClick={()=>setPendingCancel(null)} className="op-schedule-secondary">Keep match</button></div>
  </div></div>}
 </main>;
}
