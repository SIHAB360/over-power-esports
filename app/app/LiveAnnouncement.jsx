'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';
export default function LiveAnnouncement({onSettings,hidden=false}){
 const [settings,setSettings]=useState(null);
 useEffect(()=>{
  let active=true;
  async function refresh(){
   try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.access_token)return;
    const response=await fetch('/api/software/settings',{cache:'no-store',headers:{Authorization:'Bearer '+session.access_token}});
    if(!response.ok)return;
    const json=await response.json();
    if(active){setSettings(json.settings);onSettings?.(json.settings)}
   }catch{}
  }
  refresh();
  const interval=setInterval(refresh,60000);
  const visibility=()=>{if(!document.hidden)refresh()};
  document.addEventListener('visibilitychange',visibility);
  return()=>{active=false;clearInterval(interval);document.removeEventListener('visibilitychange',visibility)};
 },[]);
 if(hidden||!settings?.announcement_enabled||!settings.announcement)return null;
 return <aside role="status" aria-label="Official announcement" style={{margin:'16px 0',padding:'16px',borderRadius:14,background:'rgba(14,165,233,.15)',border:'1px solid rgba(14,165,233,.45)',color:'inherit'}}>
  <strong style={{display:'block',marginBottom:6}}>OFFICIAL ANNOUNCEMENT</strong>
  <div style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{settings.announcement}</div>
 </aside>;
}
