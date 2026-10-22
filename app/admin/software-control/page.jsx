'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../../lib/supabase';
export default function SoftwareControl(){
 const [announcement,setAnnouncement]=useState('');
 const [enabled,setEnabled]=useState(false);
 const [message,setMessage]=useState('');
 const [loading,setLoading]=useState(true);
 async function call(method='GET'){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('Please sign in as administrator.');
  const response=await fetch('/api/software/settings',{method,cache:'no-store',headers:{Authorization:'Bearer '+session.access_token,...(method==='PUT'?{'Content-Type':'application/json'}:{})},body:method==='PUT'?JSON.stringify({announcement,announcement_enabled:enabled}):undefined});
  const json=await response.json();
  if(!response.ok)throw Error(json.message||'Request failed');
  return json.settings;
 }
 useEffect(()=>{call().then(s=>{setAnnouncement(s.announcement||'');setEnabled(!!s.announcement_enabled)}).catch(e=>setMessage(e.message)).finally(()=>setLoading(false))},[]);
 async function save(e){e.preventDefault();setMessage('Saving...');try{await call('PUT');setMessage('Saved. Installed apps will refresh the announcement automatically.')}catch(e){setMessage(e.message)}}
 return <main style={{maxWidth:780,margin:'40px auto',padding:24,color:'var(--foreground,#fff)'}}>
  <h1>Software Control Center</h1><p>Manage the live announcement displayed in the installed Android software. Existing matches, accounts and wallet data remain unchanged.</p>
  {loading?<p>Loading settings...</p>:<form onSubmit={save} style={{display:'grid',gap:18}}>
   <label style={{display:'grid',gap:8}}>Announcement text<textarea value={announcement} maxLength={300} onChange={e=>setAnnouncement(e.target.value)} rows={4} style={{padding:12,color:'#111',borderRadius:8}}/></label>
   <label><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Show announcement to players</label>
   <button type="submit" style={{padding:14,borderRadius:8,background:'#0ea5e9',color:'#fff',fontWeight:700}}>Save & Publish</button>
  </form>}
  <p role="status">{message}</p>
 </main>;
}
