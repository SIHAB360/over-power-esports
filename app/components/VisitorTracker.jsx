'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {supabase} from '../lib/supabase';

const CONSENT='op-analytics-consent-v1';
const SESSION='op-analytics-session-v1';

function currentConsent(){
 try{
  // Browser privacy signals always take precedence over a stored preference.
  if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1')return 'no';
  const value=localStorage.getItem(CONSENT);
  return value==='yes'||value==='no'?value:'unset';
 }catch{return 'no'}
}
function sessionIdentity(){
 let info;try{info=JSON.parse(sessionStorage.getItem(SESSION)||'null')}catch{}
 if(!info||!info.id||Date.now()-info.started>24*3600*1000){
  info={id:crypto.randomUUID(),started:Date.now()};
  sessionStorage.setItem(SESSION,JSON.stringify(info));
 }
 return info.id;
}
function referrerOrigin(){
 // Never transmit referrer URLs, paths, query strings, or fragments to analytics.
 try{
  const url=new URL(document.referrer);
  return url.protocol==='https:'||url.protocol==='http:'?url.origin:'';
 }catch{return ''}
}
export default function VisitorTracker(){
 const path=usePathname()||'/';
 const [consent,setConsent]=useState('loading');
 useEffect(()=>{
  setConsent(currentConsent());
  // A decision in another browser tab must stop (or enable) tracking here too.
  const onStorage=(event)=>{
   if(event.key!==CONSENT&&event.key!==null)return;
   const next=currentConsent();
   if(next!=='yes'){try{sessionStorage.removeItem(SESSION)}catch{}}
   setConsent(next);
  };
  window.addEventListener('storage',onStorage);
  return()=>window.removeEventListener('storage',onStorage);
 },[]);
 useEffect(()=>{
  if(consent!=='yes')return;
  let active=true,exitSent=false,cachedToken='';
  const refer=referrerOrigin();
  const send=async(kind,route)=>{
   const isExit=kind==='exit';
   if(currentConsent()!=='yes'||(!active&&!isExit))return;
   try{
    // Leaving a page cannot wait for asynchronous auth lookups.
    // Reuse the most recently verified client token for keepalive exit events.
    if(!isExit){
     const {data:{session}}=await supabase.auth.getSession();
     cachedToken=session?.access_token||'';
    }
    if(currentConsent()!=='yes'||(!active&&!isExit))return;
    await fetch('/api/analytics/track',{
     method:'POST',keepalive:isExit,
     headers:{'Content-Type':'application/json',...(cachedToken?{Authorization:'Bearer '+cachedToken}:{})},
     body:JSON.stringify({kind,sessionId:sessionIdentity(),eventId:crypto.randomUUID(),
      path:route,referrer:refer,language:navigator.language})
    });
   }catch{}
  };
  void send('page',path);
  const heartbeat=setInterval(()=>{if(document.visibilityState==='visible')void send('heartbeat',path)},45000);
  const exitOnce=()=>{if(!exitSent){exitSent=true;void send('exit',path)}};
  const onVisibility=()=>{
   if(document.visibilityState==='hidden')exitOnce();
   else{exitSent=false;void send('heartbeat',path)}
  };
  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('pagehide',exitOnce);
  return()=>{
   active=false;clearInterval(heartbeat);
   document.removeEventListener('visibilitychange',onVisibility);
   window.removeEventListener('pagehide',exitOnce);
  };
 },[path,consent]);
 function change(value){
  try{
   localStorage.setItem(CONSENT,value);
   if(value!=='yes')sessionStorage.removeItem(SESSION);
  }catch{setConsent('no');return}
  setConsent(currentConsent());
 }
 if(consent!=='unset')return null;
 return <div role="dialog" aria-label="Privacy and website analytics" style={{position:'fixed',bottom:14,left:14,right:14,zIndex:3000,maxWidth:525,margin:'0 auto',background:'#12202b',border:'1px solid #9be95c',color:'#fafcfb',boxShadow:'0 13px 55px #000b',borderRadius:15,padding:'17px 18px',fontFamily:'system-ui,sans-serif'}}>
  <strong style={{display:'block',fontSize:15,marginBottom:7,color:'#c3ff75'}}>Website Analytics &amp; Privacy</strong>
  <p style={{fontSize:13,lineHeight:1.5,margin:'0 0 12px'}}>May we collect anonymous visit statistics, page views, device type and approximate location? Signed-in accounts may be linked to their email. No precise GPS or raw IP is stored. <Link href="/privacy" style={{color:'#f9bb64',textDecoration:'underline'}}>Privacy details</Link></p>
  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button type="button" onClick={()=>change('yes')} style={{flex:1,minHeight:42,background:'#bcff6a',border:0,borderRadius:9,fontWeight:800,color:'#102015',cursor:'pointer'}}>Allow analytics</button><button type="button" onClick={()=>change('no')} style={{flex:1,minHeight:42,background:'transparent',border:'1px solid #8296a2',color:'white',borderRadius:9,fontWeight:750,cursor:'pointer'}}>Decline</button></div>
 </div>;
}
