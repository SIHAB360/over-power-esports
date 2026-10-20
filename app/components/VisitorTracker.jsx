'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {supabase} from '../lib/supabase';
const CONSENT='op-analytics-consent-v1';
const SESSION='op-analytics-session-v1';
function sessionIdentity(){
 let info;try{info=JSON.parse(sessionStorage.getItem(SESSION)||'null')}catch{}
 if(!info||!info.id||Date.now()-info.started>24*3600*1000){info={id:crypto.randomUUID(),started:Date.now()};sessionStorage.setItem(SESSION,JSON.stringify(info))}
 return info.id;
}
export default function VisitorTracker(){
 const path=usePathname()||'/';
 const [consent,setConsent]=useState('loading');
 useEffect(()=>{
  try{if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'){setConsent('no');return}
   setConsent(localStorage.getItem(CONSENT)||'unset');}catch{setConsent('no')}
 },[]);
 useEffect(()=>{
  if(consent!=='yes')return;
  let live=true;let lastPath=path;
  const send=async(kind,route)=>{
   try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!live&&kind!=='exit')return;
    await fetch('/api/analytics/track',{method:'POST',keepalive:kind==='exit',
     headers:{'Content-Type':'application/json',...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{})},
     body:JSON.stringify({kind,sessionId:sessionIdentity(),eventId:crypto.randomUUID(),path:route,
      referrer:document.referrer,language:navigator.language})});
   }catch{}
  };
  send('page',path);
  const clock=setInterval(()=>{if(document.visibilityState==='visible')send('heartbeat',lastPath)},45000);
  const onVisibility=()=>{if(document.visibilityState==='hidden')send('exit',lastPath);else send('heartbeat',lastPath)};
  document.addEventListener('visibilitychange',onVisibility);
  return()=>{live=false;clearInterval(clock);document.removeEventListener('visibilitychange',onVisibility)};
 },[path,consent]);
 function change(value){try{localStorage.setItem(CONSENT,value)}catch{}setConsent(value)}
 if(consent!=='unset')return null;
 return <div role="dialog" aria-label="Privacy and website analytics" style={{position:'fixed',bottom:14,left:14,right:14,zIndex:3000,maxWidth:525,margin:'0 auto',background:'#12202b',border:'1px solid #9be95c',color:'#fafcfb',boxShadow:'0 13px 55px #000b',borderRadius:15,padding:'17px 18px',fontFamily:'system-ui,sans-serif'}}>
  <strong style={{display:'block',fontSize:15,marginBottom:7,color:'#c3ff75'}}>Website Analytics & Privacy</strong>
  <p style={{fontSize:13,lineHeight:1.5,margin:'0 0 12px'}}>May we collect anonymous visit statistics, page views, device type and approximate location? Signed-in accounts may be linked to their email. No precise GPS or raw IP is stored. <Link href="/privacy" style={{color:'#f9bb64',textDecoration:'underline'}}>Privacy details</Link></p>
  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button type="button" onClick={()=>change('yes')} style={{flex:1,minHeight:42,background:'#bcff6a',border:0,borderRadius:9,fontWeight:800,color:'#102015',cursor:'pointer'}}>Allow analytics</button><button type="button" onClick={()=>change('no')} style={{flex:1,minHeight:42,background:'transparent',border:'1px solid #8296a2',color:'white',borderRadius:9,fontWeight:750,cursor:'pointer'}}>Decline</button></div>
 </div>;
}
