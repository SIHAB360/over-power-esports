'use client';
import {useState} from 'react';
import {supabase} from '../../lib/supabase';
import './tournament-composer.css';
const SQUADS=['OVER POWER Elite','OVER POWER','All Squads'];
const MATCHES=['CHAMPION RUSH','Daily Scrim','BR Lobby','CS Ranked','Custom Match','Practice Match','Scrim'];
const TIMES=['12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM','12:00 AM'];
const RULES=['সব প্লেয়ার ম্যাচের ১৫ মিনিট আগে Discord Voice-এ যোগ দিন এবং গেমে অনলাইন থাকুন।','ম্যাচ শুরুর ১০ মিনিট আগে গেম ও Discord-এ প্রস্তুত থাকুন।','Discord-এ নির্ধারিত Voice Channel-এ যোগ দিন, মাইক পরীক্ষা করুন এবং অ্যাডমিনের নির্দেশনা অনুসরণ করুন।','ম্যাচের সময়মতো লবিতে প্রবেশ করুন। রুম ID ও পাসওয়ার্ড অ্যাডমিন জানাবেন।'];
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export default function TournamentComposer({onPublished}){
 const [form,setForm]=useState({title:SQUADS[0],date:today(),platform:'Discord Voice',timezone:'BST',instructions:RULES[0],events:[{name:MATCHES[0],time:'5:00 PM'}]});
 const [entryFee,setEntryFee]=useState('0'),[prizePool,setPrizePool]=useState(''),[targetSquad,setTargetSquad]=useState('');
 const [preview,setPreview]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[mode,setMode]=useState('template'),[confirmed,setConfirmed]=useState(false);
 const update=(key,value)=>{setForm(old=>({...old,[key]:value}));setPreview('');setConfirmed(false)};
 const eventUpdate=(i,key,value)=>update('events',form.events.map((x,j)=>i===j?{...x,[key]:value}:x));
 const select=(label,value,options,onChange)=><label className="op-tc-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x} value={x}>{x}</option>)}</select></label>;
 const localToIso=(date,time)=>{
  const match=String(time).match(/^(\\d{1,2}):(\\d{2})\\s*(AM|PM)$/i);
  if(!match)throw Error('Select a valid match time.');
  let hour=Number(match[1])%12;if(match[3].toUpperCase()==='PM')hour+=12;
  const iso=new Date(date+'T'+String(hour).padStart(2,'0')+':'+match[2]+':00+06:00');
  if(!Number.isFinite(iso.getTime()))throw Error('Select a valid match date.');
  return date+'T'+String(hour).padStart(2,'0')+':'+match[2];
 };
 async function submit(action){
  setBusy(true);setMessage('');
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token)throw Error('Admin login required.');
   const headers={Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'};
   if(action==='preview'){
    const res=await fetch('/api/software/tournament-announcement',{method:'POST',headers,body:JSON.stringify({...form,action})});
    const result=await res.json();
    if(!res.ok)throw Error(result.message||'Could not generate preview.');
    setPreview(result.text);setMode(result.mode||'template');setConfirmed(false);setMessage('Preview ready. Check the selected details.');
   }else{
    if(!confirmed)throw Error('Confirm match dates and times first.');
    let completed=0;
    for(const event of form.events){
     const local_time=localToIso(form.date,event.time);
     if(new Date(local_time+':00+06:00').getTime()<=Date.now())throw Error('Match time must be in the future: '+event.name);
     const res=await fetch('/api/admin/match-schedules',{method:'POST',headers,body:JSON.stringify({
      title:event.name,local_time,entry_fee:Number(entryFee||0),prize_pool:prizePool,
      lobby_details:form.platform+' · '+form.title,notes:form.instructions,team_id:targetSquad||null
     })});
     const result=await res.json();
     if(!res.ok)throw Error((result.message||'Could not publish match')+' ('+event.name+'). '+completed+' already published.');
     completed++;
    }
    setConfirmed(false);setPreview('');
    setMessage(completed+' match schedule(s) published. Player alerts and Android push are queued automatically.');
    onPublished?.();
   }
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
  <div className="op-tc-grid">
   <label className="op-tc-field"><span>Entry Fee (৳)</span><input type="number" min="0" value={entryFee} onChange={e=>{setEntryFee(e.target.value);setPreview('');setConfirmed(false)}}/></label>
   <label className="op-tc-field"><span>Prize Pool (optional)</span><input value={prizePool} onChange={e=>{setPrizePool(e.target.value);setPreview('');setConfirmed(false)}} placeholder="৳2,000 + bonus"/></label>
  </div>
  {select('Discord & Player Instructions',form.instructions,RULES,v=>update('instructions',v))}
  <p className="op-tc-help">নির্দেশনা স্বয়ংক্রিয়ভাবে ম্যাচের সঙ্গে যুক্ত হবে। প্লেয়ারদের সময়মতো Discord Voice ও গেমে যোগ দিতে বলা হবে।</p>
  <button className="op-tc-generate" type="button" disabled={busy||!form.date} onClick={()=>submit('preview')}>{busy?'Please wait…':'✨ Generate Announcement Preview'}</button>
  {preview&&<div className="op-tc-preview"><div className="op-tc-subhead"><h3>Announcement Preview</h3><span>{mode==='ai'?'AI generated':'Auto formatted'}</span></div><pre>{preview}</pre><p>All details are generated from your selections. Review before publishing.</p><label className="op-tc-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>I confirm the date and match times are correct.</span></label><button className="op-tc-publish" type="button" disabled={busy||!confirmed} onClick={()=>submit('publish')}>🚀 Publish Matches & Notify Players</button></div>}
  {message&&<p className="op-tc-status" role="status">{message}</p>}
 </section>;
}
