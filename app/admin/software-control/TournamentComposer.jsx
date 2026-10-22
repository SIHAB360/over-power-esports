'use client';
import {useState} from 'react';
import {supabase} from '../../lib/supabase';
export default function TournamentComposer(){
 const [form,setForm]=useState({title:'OVER POWER Elite',date:'',platform:'Discord Voice',timezone:'BST',instructions:'All players must be online before the scheduled time.',events:[{name:'CHAMPION RUSH',time:'5:00 PM'}]});
 const [preview,setPreview]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const change=(key,value)=>{setForm(x=>({...x,[key]:value}));setPreview('')};
 const input={padding:12,borderRadius:9,border:'1px solid #94a3b8',width:'100%',fontSize:16,color:'#111827',background:'#fff'};
 async function submit(action){
  setBusy(true);setMessage('');
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token)throw Error('Admin login required');
   const response=await fetch('/api/software/tournament-announcement',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({...form,action,customText:action==='publish'?preview:''})});
   const result=await response.json();
   if(!response.ok)throw Error(result.message||'Request failed');
   if(action==='preview'){setPreview(result.text);setMessage('Preview generated. Review before sending.')}
   else setMessage('Published. Android push delivered to '+result.pushSent+' devices; failed: '+(result.pushFailed||0)+(result.warning?' '+result.warning:''));
  }catch(e){setMessage(e.message)}finally{setBusy(false)}
 }
 return <section style={{border:'1px solid #64748b',padding:18,borderRadius:14,display:'grid',gap:12,marginBottom:20}}>
 <h2>🏆 Tournament Announcement + Android Push</h2>
 <p>Compose, preview, edit and send to registered players.</p>
 {['title','date','platform','timezone'].map(key=><label key={key} style={{display:'grid',gap:5}}>{key.toUpperCase()}<input style={input} value={form[key]} onChange={e=>change(key,e.target.value)} placeholder={key==='date'?'24 Oct 2026':''}/></label>)}
 <strong>Matches / Schedule</strong>
 {form.events.map((event,i)=><div key={i} style={{display:'flex',gap:6,flexWrap:'wrap'}}><input style={{...input,flex:2,width:120}} aria-label="Match name" value={event.name} onChange={e=>change('events',form.events.map((v,j)=>j===i?{...v,name:e.target.value}:v))}/><input style={{...input,flex:1,width:100}} aria-label="Match time" value={event.time} onChange={e=>change('events',form.events.map((v,j)=>j===i?{...v,time:e.target.value}:v))}/><button type="button" onClick={()=>change('events',form.events.filter((_,j)=>j!==i))}>Remove</button></div>)}
 <button type="button" disabled={form.events.length>=8} onClick={()=>change('events',[...form.events,{name:'',time:''}])}>+ Add Match</button>
 <label>Player Instructions<textarea style={input} rows={2} value={form.instructions} onChange={e=>change('instructions',e.target.value)}/></label>
 <button type="button" disabled={busy} onClick={()=>submit('preview')} style={{padding:13,background:'#0f766e',color:'#fff',borderRadius:10}}>Generate Smart Preview</button>
 {preview&&<><label>Editable Announcement<textarea style={{...input,whiteSpace:'pre-wrap'}} rows={12} maxLength={1500} value={preview} onChange={e=>setPreview(e.target.value)}/></label><button type="button" disabled={busy} onClick={()=>submit('publish')} style={{padding:14,background:'#b45309',color:'#fff',borderRadius:10,fontWeight:700}}>Publish & Send Android Notification</button></>}
 <p role="status">{message}</p>
 </section>
}
