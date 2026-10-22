'use client';
import {useState} from 'react';
import {supabase} from '../../lib/supabase';
export default function TournamentComposer(){
 const [form,setForm]=useState({title:'OVER POWER Elite',date:'',platform:'Discord Voice',timezone:'BST',instructions:'All players must be online before the scheduled time.',events:[{name:'CHAMPION RUSH',time:'5:00 PM'}]});
 const [preview,setPreview]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[mode,setMode]=useState('template'),[confirm,setConfirm]=useState(false);
 const change=(key,value)=>{setForm(x=>({...x,[key]:value}));setPreview('');setConfirm(false)};
 const input={padding:12,borderRadius:9,border:'1px solid #94a3b8',width:'100%',fontSize:16,color:'#111827',background:'#fff'};
 async function submit(action){
  setBusy(true);setMessage('');
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token)throw Error('Admin login required');
   const response=await fetch('/api/software/tournament-announcement',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({...form,action,customText:action==='publish'?preview:''})});
   const result=await response.json();
   if(!response.ok)throw Error(result.message||'Request failed');
   if(action==='preview'){setPreview(result.text);setMode(result.mode||'template');setConfirm(false);setMessage(result.mode==='ai'?'AI draft ready. Verify all times before publishing.':'Smart template ready. Verify all times before publishing.')}
   else {setConfirm(false);setMessage('Published. Firebase accepted '+result.pushSent+' device messages; failed: '+(result.pushFailed||0)+(result.warning?' '+result.warning:''));}
  }catch(e){setMessage(e.message)}finally{setBusy(false)}
 }
 return <section style={{border:'1px solid #64748b',padding:18,borderRadius:14,display:'grid',gap:12,marginBottom:20}}>
 <h2>🏆 Tournament Announcement + Android Push</h2>
 <p>Enter your tournament details, generate an AI-assisted draft (when configured), review and publish to registered Android players.</p>
 <div className="op-tournament-fields"><label>Tournament / Squad<input style={input} value={form.title} maxLength={80} onChange={e=>change('title',e.target.value)}/></label><label>Match Date<input type="date" style={input} value={form.date} onChange={e=>change('date',e.target.value)}/></label><label>Platform<select style={input} value={form.platform} onChange={e=>change('platform',e.target.value)}><option>Discord Voice</option><option>Discord Stage</option><option>In-Game Voice</option><option>Custom Platform</option></select></label><label>Time Zone<select style={input} value={form.timezone} onChange={e=>change('timezone',e.target.value)}><option value="BST">BST (Bangladesh UTC+6)</option><option value="UTC">UTC</option><option value="IST">IST (India UTC+5:30)</option></select></label></div>
 <strong>Matches / Schedule</strong>
 {form.events.map((event,i)=><div key={i} style={{display:'flex',gap:6,flexWrap:'wrap'}}><input style={{...input,flex:2,width:120}} aria-label="Match name" value={event.name} onChange={e=>change('events',form.events.map((v,j)=>j===i?{...v,name:e.target.value}:v))}/><input style={{...input,flex:1,width:100}} aria-label="Match time" value={event.time} onChange={e=>change('events',form.events.map((v,j)=>j===i?{...v,time:e.target.value}:v))}/><button type="button" onClick={()=>change('events',form.events.filter((_,j)=>j!==i))}>Remove</button></div>)}
 <button type="button" disabled={form.events.length>=8} onClick={()=>change('events',[...form.events,{name:'',time:''}])}>+ Add Match</button>
 <label>Player Instructions<textarea style={input} rows={2} value={form.instructions} onChange={e=>change('instructions',e.target.value)}/></label>
 <button type="button" disabled={busy} onClick={()=>submit('preview')} style={{padding:13,background:'#0f766e',color:'#fff',borderRadius:10}}>Generate Smart Preview</button>
 {preview&&<><p role="status">Draft type: {mode==='ai'?'AI generated':'Smart template'}. Review before publishing.</p><label>Editable Announcement<textarea style={{...input,whiteSpace:'pre-wrap'}} rows={12} maxLength={1500} value={preview} onChange={e=>setPreview(e.target.value)}/></label><label style={{display:'flex',alignItems:'center',gap:10}}><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)} style={{width:18,height:18}}/> I have verified the schedule and want to notify registered players.</label><button type="button" disabled={busy||!confirm||preview.trim().length<15} onClick={()=>submit('publish')} style={{padding:14,background:'#b45309',color:'#fff',borderRadius:10,fontWeight:700}}>Publish & Send Android Notification</button></>}
 <p role="status">{message}</p>
 </section>
}
