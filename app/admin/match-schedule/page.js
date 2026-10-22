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
  <div style={{marginBottom:22}}><TournamentComposer onPublished={load}/></div>
  {pendingCancel&&<div className="op-schedule-modal-backdrop" role="presentation"><div role="dialog" aria-modal="true" aria-label="Confirm schedule cancellation" className="op-schedule-modal">
   <h3>Cancel “{pendingCancel.title}”?</h3><p>Players will no longer receive upcoming reminders for this match. History remains saved.</p>
   <div><button type="button" disabled={saving} onClick={cancel}>Confirm cancellation</button><button type="button" onClick={()=>setPendingCancel(null)} className="op-schedule-secondary">Keep match</button></div>
  </div></div>}
 </main>;
}
