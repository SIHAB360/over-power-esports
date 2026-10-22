'use client';
import {useState} from 'react';
import {createPortal} from 'react-dom';
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
function DateTimeDialog({kind,value,onSave,onClose,anchor}){
 const parsed=kind==='date'?new Date(value+'T12:00:00+06:00'):null;
 const [year,setYear]=useState(parsed?parsed.getFullYear():2026);
 const [month,setMonth]=useState(parsed?parsed.getMonth():0);
 const [hour,setHour]=useState(kind==='time'?Number(value.split(':')[0])%12||12:5);
 const [minute,setMinute]=useState(kind==='time'?Number(value.split(':')[1]):0);
 const [period,setPeriod]=useState(kind==='time'&&Number(value.split(':')[0])>=12?'PM':'AM');
 const first=new Date(Date.UTC(year,month,1)).getUTCDay();
 const days=new Date(Date.UTC(year,month+1,0)).getUTCDate();
 const move=n=>{const d=new Date(Date.UTC(year,month+n,1));setYear(d.getUTCFullYear());setMonth(d.getUTCMonth());};
 const chosen=kind==='date'?value:'';
 const dateKey=d=>year+'-'+pad(month+1)+'-'+pad(d);
 const saveTime=()=>onSave(pad(hour%12+(period==='PM'?12:0))+':'+pad(minute));
 const popWidth=Math.min(356,window.innerWidth-24);const popHeight=kind==='date'?410:340;const below=(anchor?.bottom||80)+8;const above=(anchor?.top||80)-popHeight-8;const pos={top:below+popHeight<=window.innerHeight-12?below:above>=12?above:Math.max(12,window.innerHeight-popHeight-12),left:Math.max(12,Math.min(anchor?.left||20,window.innerWidth-popWidth-12))};
 return createPortal(<><div className="op-tc-popover-dismiss" onMouseDown={onClose}/><div className="op-tc-popover" style={pos}>
  <div className="op-tc-modal" role="dialog" aria-modal="false" aria-label={kind==='date'?'Select match date':'Select match time'}>
   <div className="op-tc-modal-top"><div><span>{kind==='date'?'MATCH CALENDAR':'MATCH START TIME'}</span><h3>{kind==='date'?'Choose a Date':'Choose a Time'}</h3><p>{kind==='date'?'Select your match day':'Bangladesh local time (UTC+6)'}</p></div><button type="button" onClick={onClose} aria-label="Close">✕</button></div>
   {kind==='date'?<><div className="op-tc-calendar-bar"><button type="button" onClick={()=>move(-1)} aria-label="Previous month">‹</button><strong>{monthLabel(year,month)}</strong><button type="button" onClick={()=>move(1)} aria-label="Next month">›</button></div><div className="op-tc-calendar-grid">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=><span className="op-tc-weekday" key={x}>{x}</span>)}{Array.from({length:first},(_,i)=><span key={'blank'+i}/>)}{Array.from({length:days},(_,i)=>{const d=i+1,key=dateKey(d);return <button type="button" key={key} disabled={key<today()} className={key===chosen?'is-selected':''} onClick={()=>onSave(key)}>{d}</button>})}</div><button className="op-tc-modal-today" type="button" onClick={()=>onSave(today())}>Select Today</button></>:<><div className="op-tc-wheel-summary">{pad(hour)}:{pad(minute)} <span>{period}</span></div><div className="op-tc-wheel-picker"><div className="op-tc-wheel-col"><span>HOUR</span>{Array.from({length:12},(_,i)=>i+1).map(h=><button type="button" key={h} className={h===hour?'is-selected':''} onClick={()=>setHour(h)}>{pad(h)}</button>)}</div><div className="op-tc-wheel-col"><span>MINUTE</span>{Array.from({length:12},(_,i)=>i*5).map(m=><button type="button" key={m} className={m===minute?'is-selected':''} onClick={()=>setMinute(m)}>{pad(m)}</button>)}</div><div className="op-tc-wheel-col op-tc-wheel-period"><span>PERIOD</span>{['AM','PM'].map(p=><button type="button" key={p} className={p===period?'is-selected':''} onClick={()=>setPeriod(p)}>{p}</button>)}</div></div><button className="op-tc-modal-apply" type="button" onClick={saveTime}>Confirm Time</button></>}
  </div></div></> ,document.body);
}
export default function TournamentComposer({onPublished}){
 const [form,setForm]=useState(()=>{const slot=initialSlot();return {title:SQUADS[0],date:slot.date,platform:'Discord Voice',timezone:'BST',instructions:RULES[0],events:[{name:MATCHES[0],time:slot.time}]};});
 const [picker,setPicker]=useState(null);
 const openPicker=(kind,index,e)=>setPicker({kind,index,anchor:e.currentTarget.getBoundingClientRect().toJSON()});
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
   <div className="op-tc-field op-tc-date-field"><span>📅 Match Date</span><button className="op-tc-picker-trigger" type="button" onClick={e=>openPicker('date',null,e)}><strong>{new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'}).format(new Date(form.date+'T12:00:00+06:00'))}</strong><span>Open Calendar ↗</span></button></div>
   {select('Platform',form.platform,['Discord Voice','Discord Stage','In-Game Voice','TeamSpeak'],v=>update('platform',v))}

  </div>
  <div className="op-tc-subhead"><h3>Match Schedule</h3><span>{form.events.length} selected</span></div>
  <div className="op-tc-events">{form.events.map((event,i)=><div className="op-tc-event" key={i}><span className="op-tc-number">{String(i+1).padStart(2,'0')}</span>{select('Match',event.name,MATCHES,v=>eventUpdate(i,'name',v))}<div className="op-tc-field op-tc-time-field"><span>🕒 Start Time</span><button className="op-tc-picker-trigger" type="button" onClick={e=>openPicker('time',i,e)}><strong>{displayTime(event.time)}</strong><span>Set Time ↗</span></button></div><button type="button" className="op-tc-remove" disabled={form.events.length===1} onClick={()=>update('events',form.events.filter((_,j)=>j!==i))} aria-label="Remove match">✕</button></div>)}</div>
  <button className="op-tc-add" type="button" disabled={form.events.length>=8} onClick={()=>{const last=form.events[form.events.length-1];const [h,m]=last.time.split(':').map(Number);const next=pad((h+1)%24)+':'+pad(m);update('events',[...form.events,{name:MATCHES[0],time:next}])}}>+ Add another match</button>
  <div className="op-tc-grid">
   <label className="op-tc-field"><span>Entry Fee (৳)</span><input type="number" min="0" value={entryFee} onChange={e=>{setEntryFee(e.target.value);setPreview('');setConfirmed(false)}}/></label>
   <label className="op-tc-field"><span>Prize Pool (optional)</span><input value={prizePool} onChange={e=>{setPrizePool(e.target.value);setPreview('');setConfirmed(false)}} placeholder="৳2,000 + bonus"/></label>
  </div>
  {select('Discord & Player Instructions',form.instructions,RULES,v=>update('instructions',v))}
  <p className="op-tc-help">নির্দেশনা স্বয়ংক্রিয়ভাবে ম্যাচের সঙ্গে যুক্ত হবে। প্লেয়ারদের সময়মতো Discord Voice ও গেমে যোগ দিতে বলা হবে।</p>
  <button className="op-tc-generate" type="button" disabled={busy||!form.date} onClick={()=>submit('preview')}>{busy?'Please wait…':'✨ Generate Announcement Preview'}</button>
  {preview&&<div className="op-tc-preview"><div className="op-tc-subhead"><h3>Announcement Preview</h3><span>{mode==='ai'?'AI generated':'Auto formatted'}</span></div><pre>{preview}</pre><p>All details are generated from your selections. Review before publishing.</p><label className="op-tc-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>I confirm the date and match times are correct.</span></label><button className="op-tc-publish" type="button" disabled={busy||!confirmed} onClick={()=>submit('publish')}>🚀 Publish Matches & Notify Players</button></div>}
  {picker&&<DateTimeDialog kind={picker.kind} anchor={picker.anchor} value={picker.kind==='date'?form.date:form.events[picker.index].time} onClose={()=>setPicker(null)} onSave={v=>{if(picker.kind==='date')update('date',v);else eventUpdate(picker.index,'time',v);setPicker(null)}}/>}
  {message&&<p className="op-tc-status" role="status">{message}</p>}
 </section>;
}
