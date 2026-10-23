'use client';
import {useState} from 'react';
import {supabase} from '../../lib/supabase';
import './tournament-composer.css';
const SQUADS=['OVER POWER Elite','OVER POWER','All Squads'];
const MATCHES=['CHAMPION RUSH','Daily Scrim','BR Lobby','CS Ranked','Custom Match','Practice Match','Scrim'];
const pad=n=>String(n).padStart(2,'0');
const bdParts=()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());return Object.fromEntries(parts.map(x=>[x.type,x.value]));};
const autoSlot=()=>{const p=bdParts();let mins=Number(p.hour)*60+Number(p.minute)+30;mins=Math.ceil(mins/15)*15;const dayOffset=Math.floor(mins/1440);mins%=1440;const base=new Date(p.year+'-'+p.month+'-'+p.day+'T00:00:00+06:00');base.setUTCDate(base.getUTCDate()+dayOffset);return {date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(base).filter(x=>['year','month','day'].includes(x.type)).reduce((a,x)=>({...a,[x.type]:x.value}),{}),time:pad(Math.floor(mins/60))+':'+pad(mins%60),dayOffset};};
const initialSlot=()=>{const x=autoSlot();return {date:x.date.year+'-'+x.date.month+'-'+x.date.day,time:x.time};};
const displayTime=t=>{const [h,m]=t.split(':').map(Number);return (h%12||12)+':'+pad(m)+' '+(h>=12?'PM':'AM');};
const RULES=['সব প্লেয়ার ম্যাচের ১৫ মিনিট আগে Discord Voice-এ যোগ দিন এবং গেমে অনলাইন থাকুন।','ম্যাচ শুরুর ১০ মিনিট আগে গেম ও Discord-এ প্রস্তুত থাকুন।','Discord-এ নির্ধারিত Voice Channel-এ যোগ দিন, মাইক পরীক্ষা করুন এবং অ্যাডমিনের নির্দেশনা অনুসরণ করুন।','ম্যাচের সময়মতো লবিতে প্রবেশ করুন। রুম ID ও পাসওয়ার্ড অ্যাডমিন জানাবেন।'];
const today=()=>initialSlot().date;
const monthLabel=(year,month)=>new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(Date.UTC(year,month,1)));
export default function TournamentComposer({onPublished}){
 const [form,setForm]=useState(()=>{const slot=initialSlot();return {title:SQUADS[0],date:slot.date,platform:'Discord Voice',timezone:'BST',instructions:RULES[0],events:[{name:MATCHES[0],time:slot.time}]};});
 const quickDate=days=>{const p=bdParts();const d=new Date(p.year+'-'+p.month+'-'+p.day+'T12:00:00+06:00');d.setUTCDate(d.getUTCDate()+days);update('date',new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(x=>['year','month','day'].includes(x.type)).reduce((a,x)=>({...a,[x.type]:x.value}),{}).year+'-'+pad(Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',month:'numeric'}).format(d)))+'-'+pad(Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',day:'numeric'}).format(d))));};
 const setTimePart=(i,part,v)=>{const [hh,mm]=form.events[i].time.split(':').map(Number);const h12=hh%12||12;const period=hh>=12?'PM':'AM';const h=part==='hour'?Number(v):h12;const m=part==='minute'?Number(v):mm;const p=part==='period'?v:period;eventUpdate(i,'time',pad(h%12+(p==='PM'?12:0))+':'+pad(m));};
 const quickTime=(i,h)=>eventUpdate(i,'time',pad(h)+':00');
 const [entryFee,setEntryFee]=useState('0'),[prizePool,setPrizePool]=useState(''),[targetSquad,setTargetSquad]=useState('');
 const [preview,setPreview]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[mode,setMode]=useState('template'),[confirmed,setConfirmed]=useState(false);
 const update=(key,value)=>{setForm(old=>({...old,[key]:value}));setPreview('');setConfirmed(false)};
 const eventUpdate=(i,key,value)=>update('events',form.events.map((x,j)=>i===j?{...x,[key]:value}:x));
 const select=(label,value,options,onChange)=><label className="op-tc-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x} value={x}>{x}</option>)}</select></label>;
 const localToIso=(date,time)=>{
  if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)||!/^\\d{2}:\\d{2}$/.test(time))throw Error('Select a valid date and time.');
  const iso=new Date(date+'T'+time+':00+06:00');
  if(!Number.isFinite(iso.getTime()))throw Error('Select a valid Bangladesh date and time.');
  return date+'T'+time;
 };
 const useAutoTime=(i)=>{const slot=initialSlot();setForm(old=>({...old,date:slot.date,events:old.events.map((e,j)=>j===i?{...e,time:slot.time}:e)}));setPreview('');setConfirmed(false);};
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
    const prepared=form.events.map(event=>({...event,local_time:localToIso(form.date,event.time)}));
    for(const event of prepared){if(new Date(event.local_time+':00+06:00').getTime()<Date.now()+120000)throw Error('Schedule every match at least 2 minutes ahead: '+event.name);}
    let completed=0;
    for(const event of prepared){
     const local_time=event.local_time;
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

   {select('Platform',form.platform,['Discord Voice','Discord Stage','In-Game Voice','TeamSpeak'],v=>update('platform',v))}

  </div>
  <section className="op-tc-smart-scheduler" aria-label="Smart Match Scheduler">
   <header className="op-tc-smart-header"><strong><span className="op-tc-smart-led"/> SMART MATCH SCHEDULER</strong><small>ONE-CLICK DATE &amp; TIME</small></header>
   <div className="op-tc-smart-grid">
    <div className="op-tc-smart-panel">
     <label htmlFor="op-tc-smart-date">▦ SELECT MATCH DATE</label>
     <input id="op-tc-smart-date" aria-label="Choose match date" type="date" min={today()} value={form.date} onChange={e=>update('date',e.target.value)}/>
     <span className="op-tc-smart-caption">QUICK DATE</span>
     <div className="op-tc-smart-shortcuts">{[['Today',0],['Tomorrow',1],['Day After',2]].map(([label,offset])=><button key={label} type="button" onClick={()=>quickDate(offset)}>{label}</button>)}</div>
    </div>
    <div className="op-tc-smart-panel">
     <label>⏰ SELECT MATCH TIME</label>
     <div className="op-tc-smart-time-stack">{form.events.map((event,i)=>{const [hh,mm]=event.time.split(':').map(Number);return <div className="op-tc-smart-time-item" key={i}>
      {form.events.length>1&&<span className="op-tc-smart-time-name">{i+1}. {event.name}</span>}
      <div className="op-tc-smart-time-selects">
       <select aria-label={event.name+' hour'} value={hh%12||12} onChange={e=>setTimePart(i,'hour',e.target.value)}>{Array.from({length:12},(_,j)=>j+1).map(n=><option key={n} value={n}>{pad(n)}</option>)}</select>
       <span>:</span>
       <select aria-label={event.name+' minute'} value={mm} onChange={e=>setTimePart(i,'minute',e.target.value)}>{Array.from({length:60},(_,j)=>j).map(n=><option key={n} value={n}>{pad(n)}</option>)}</select>
       <select aria-label={event.name+' AM or PM'} value={hh>=12?'PM':'AM'} onChange={e=>setTimePart(i,'period',e.target.value)}><option>AM</option><option>PM</option></select>
      </div>
      <span className="op-tc-smart-caption">QUICK TIME</span>
      <div className="op-tc-smart-shortcuts">{[['6 PM',18],['8 PM',20],['10 PM',22],['12 AM',0]].map(([label,h])=><button type="button" key={label} className={hh===h&&mm===0?'is-active':''} onClick={()=>quickTime(i,h)}>{label}</button>)}</div>
     </div>})}</div>
    </div>
   </div>
   <div className="op-tc-smart-live"><strong>✦ LIVE MATCH SCHEDULE</strong><span>{form.date||'Choose match date'} · {form.events.map(x=>displayTime(x.time)).join(' · ')}</span></div>
  </section>
  <div className="op-tc-subhead"><h3>Match Schedule</h3><span>{form.events.length} selected</span></div>
  <div className="op-tc-events">{form.events.map((event,i)=><div className="op-tc-event" key={i}><span className="op-tc-number">{String(i+1).padStart(2,'0')}</span>{select('Match',event.name,MATCHES,v=>eventUpdate(i,'name',v))}<div className="op-tc-field op-tc-time-field"><span>🕒 Start Time</span><div className="op-tc-smart-time-readout">{displayTime(event.time)} <small>Set above ↑</small></div></div><button type="button" className="op-tc-remove" disabled={form.events.length===1} onClick={()=>update('events',form.events.filter((_,j)=>j!==i))} aria-label="Remove match">✕</button></div>)}</div>
  <button className="op-tc-add" type="button" disabled={form.events.length>=8} onClick={()=>{const last=form.events[form.events.length-1];const [h,m]=last.time.split(':').map(Number);const next=pad((h+1)%24)+':'+pad(m);update('events',[...form.events,{name:MATCHES[0],time:next}])}}>+ Add another match</button>
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
