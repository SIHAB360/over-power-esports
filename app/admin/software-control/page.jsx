'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';
const initial={announcement:'',announcement_enabled:false,app_title:'OVER POWER ESPORTS',welcome_message:'Your team, matches, inbox and wallet in one app.',banner_url:'',accent_color:'#0ea5e9',maintenance_enabled:false,matches_enabled:true,wallet_enabled:true,tournaments_enabled:true};
const flags=[['announcement_enabled','Show announcement'],['maintenance_enabled','Maintenance notice'],['matches_enabled','Show match features'],['wallet_enabled','Show wallet feature'],['tournaments_enabled','Show tournament feature']];
export default function SoftwareControl(){
 const [form,setForm]=useState(initial),[message,setMessage]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 async function call(method='GET',body){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('Please sign in as administrator.');
  const response=await fetch('/api/software/settings',{method,cache:'no-store',headers:{Authorization:'Bearer '+session.access_token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const json=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(json.message||'Request failed');
  return json.settings;
 }
 useEffect(()=>{call().then(s=>setForm({...initial,...s})).catch(e=>setMessage(e.message)).finally(()=>setLoading(false))},[]);
 const change=(key,value)=>setForm(old=>({...old,[key]:value}));
 async function save(e){e.preventDefault();setSaving(true);setMessage('Saving...');try{setForm({...initial,...await call('PUT',form)});setMessage('Published successfully. Player apps update while open or on return.')}catch(e){setMessage(e.message)}finally{setSaving(false)}}
 const inputStyle={padding:12,border:'1px solid #64748b',borderRadius:10,color:'#0f172a',background:'#fff',width:'100%',fontSize:16};
 const field=(label,key,maxLength)=> <label style={{display:'grid',gap:8}} key={key}><strong>{label}</strong><input style={inputStyle} value={form[key]} maxLength={maxLength} onChange={e=>change(key,e.target.value)}/></label>;
 return <main style={{maxWidth:850,margin:'24px auto',padding:24,color:'inherit'}}>
  <h1>Software Control Center</h1><p>Publish live content and choose which player modules appear in the installed app. Changes do not require an APK update.</p>
  {loading?<p>Loading...</p>:<form onSubmit={save} style={{display:'grid',gap:20}}>
   {field('App title','app_title',60)}
   {field('Welcome message','welcome_message',180)}
   <label style={{display:'grid',gap:8}}><strong>Announcement</strong><textarea rows={4} style={inputStyle} value={form.announcement} maxLength={300} onChange={e=>change('announcement',e.target.value)}/></label>
   {field('Banner image URL (HTTPS)','banner_url',500)}
   <label style={{display:'flex',alignItems:'center',gap:12}}><strong>Accent color</strong><input type="color" value={form.accent_color} onChange={e=>change('accent_color',e.target.value)}/><code>{form.accent_color}</code></label>
   <section style={{display:'grid',gap:14}}><h2>Player App Controls</h2>{flags.map(([key,label])=><label key={key} style={{display:'flex',gap:12,alignItems:'center'}}><input type="checkbox" checked={form[key]} onChange={e=>change(key,e.target.checked)}/>{label}</label>)}</section>
   <button disabled={saving} type="submit" style={{padding:16,borderRadius:12,background:'#0284c7',color:'white',fontWeight:700,fontSize:16}}>{saving?'Publishing...':'Save & Publish to Apps'}</button>
  </form>}
  <p role="status" style={{marginTop:16}}>{message}</p>
 </main>;
}
