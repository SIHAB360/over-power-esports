'use client';
import {useState} from 'react';
import {supabase} from '../../lib/supabase';
import './tournament-composer.css';
const SQUADS=['OVER POWER Elite','OVER POWER','All Squads'];
const MATCHES=['CHAMPION RUSH','Daily Scrim','BR Lobby','CS Ranked','Custom Match','Practice Match','Scrim'];
const TIMES=['12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM','12:00 AM'];
const RULES=['All players must be online before the scheduled time.','Join Discord 15 minutes before kickoff.','All players must be ready 10 minutes early.','Follow tournament rules and wait for room details.'];
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export default function TournamentComposer(){
 const [form,setForm]=useState({title:SQUADS[0],date:today(),platform:'Discord Voice',timezone:'BST',instructions:RULES[0],events:[{name:MATCHES[0],time:'5:00 PM'}]});
 const [preview,setPreview]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[mode,setMode]=useState('template'),[confirmed,setConfirmed]=useState(false);
 const update=(key,value)=>{setForm(old=>({...old,[key]:value}));setPreview('');setConfirmed(false)};
 const eventUpdate=(i,key,value)=>update('events',form.events.map((x,j)=>i===j?{...x,[key]:value}:x));
 const select=(label,value,options,onChange)=><label className="op-tc-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x} value={x}>{x}</option>)}</select></label>;
 async function submit(action){
  setBusy(true);setMessage('');
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token)throw Error('Admin login required.');
   const res=await fetch('/api/software/tournament-announcement',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({...form,action,customText:action==='publish'?preview:''})});
   const result=await res.json();
   if(!res.ok)throw Error(result.message||'Request failed.');
   if(action==='preview'){setPreview(result.text);setMode(result.mode||'template');setConfirmed(false);setMessage('Preview ready. Check the selected details.');}
   else {setConfirmed(false);setMessage('Published. Firebase accepted '+result.pushSent+' push message(s). Failed: '+(result.pushFailed||0)+(result.warning?' '+result.warning:''));}
  }catch(e){setMessage(e.message)}finally{setBusy(false)}
 }
 return <section className="op-tc" aria-label="Tournament announcement builder">
  <div className="op-tc-head"><span className="op-tc-icon">🏆</span><div><h2>Smart Tournament Announcement</h2><p>Select your details. The announcement is generated automatically.</p></div></div>
  <div className="op-tc-grid">
   {select('Tournament / Squad',form.title,SQUADS,v=>update('title',v))}
   <label className="op-tc-field"><span>Match Date</span><input type="date" value={form.date} onChange={e=>update('date',e.target.value)}/></label>
   {select('Platform',form.platform,['Discord Voice','Discord Stage','In-Game Voice','TeamSpeak'],v=>update('platform',v))}
   {select('Time Zone',form.timezone,['BST','UTC','IST'],v=>update('timezone',v))}
  </div>
  <div className="op-tc-subhead"><h3>Match Schedule</h3><span>{form.events.length} selected</span></div>
  <div className="op-tc-events">{form.events.map((event,i)=><div className="op-tc-event" key={i}><span className="op-tc-number">{String(i+1).padStart(2,'0')}</span>{select('Match',event.name,MATCHES,v=>eventUpdate(i,'name',v))}{select('Start Time',event.time,TIMES,v=>eventUpdate(i,'time',v))}<button type="button" className="op-tc-remove" disabled={form.events.length===1} onClick={()=>update('events',form.events.filter((_,j)=>j!==i))} aria-label="Remove match">✕</button></div>)}</div>
  <button className="op-tc-add" type="button" disabled={form.events.length>=8} onClick={()=>update('events',[...form.events,{name:MATCHES[0],time:'8:00 PM'}])}>+ Add another match</button>
  {select('Player Instructions',form.instructions,RULES,v=>update('instructions',v))}
  <button className="op-tc-generate" type="button" disabled={busy||!form.date} onClick={()=>submit('preview')}>{busy?'Please wait…':'✨ Generate Announcement Preview'}</button>
  {preview&&<div className="op-tc-preview"><div className="op-tc-subhead"><h3>Announcement Preview</h3><span>{mode==='ai'?'AI generated':'Auto formatted'}</span></div><pre>{preview}</pre><p>All details are generated from your selections. Review before publishing.</p><label className="op-tc-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>I confirm the date and match times are correct.</span></label><button className="op-tc-publish" type="button" disabled={busy||!confirmed} onClick={()=>submit('publish')}>🚀 Publish & Send Android Push</button></div>}
  {message&&<p className="op-tc-status" role="status">{message}</p>}
 </section>;
}
