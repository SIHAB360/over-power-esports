'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {FiBell,FiBellOff,FiCheckCircle,FiAlertCircle} from 'react-icons/fi';

export default function NativePushManager(){
 const [native,setNative]=useState(false);
 const [status,setStatus]=useState('Checking phone notification support…');
 const [enabled,setEnabled]=useState(false);
 const [busy,setBusy]=useState(false);
 const tokenRef=useRef('');
 const actionRef=useRef('sync');
 const mountedRef=useRef(true);
 const api=useCallback(async(method,token)=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw Error('Sign in to enable notifications.');
  const response=await fetch('/api/player/native-push',{
   method,cache:'no-store',
   headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
   body:method!=='GET'?JSON.stringify({token,platform:'android',version:'2.1.0'}):undefined
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(result.message||'Unable to update phone notifications.');
  return result;
 },[]);
 useEffect(()=>{
  mountedRef.current=true;
  const bridge=window.OverPowerNative;
  if(!bridge?.postMessage)return ()=>{mountedRef.current=false};
  setNative(true);
  bridge.onmessage=async event=>{
   if(!mountedRef.current)return;
   let data;try{data=JSON.parse(event.data)}catch{return}
   if(data.type==='status'){
    if(data.message==='unconfigured')setStatus('Android system push is awaiting Firebase setup by Admin.');
    else setStatus('System notifications are available on this Android device.');
    return;
   }
   if(data.type==='error'){
    setStatus(data.message||'Could not enable push notifications.');
    setBusy(false);
    return;
   }
   if(data.type==='disabled'){
    setEnabled(false);
    setBusy(false);
    setStatus('System notifications are off. Enable them for match alerts.');
    return;
   }
   if(data.type!=='token'||typeof data.token!=='string')return;
   try{
    const token=data.token;
    if(actionRef.current==='disable'){
     await api('DELETE',token);
     tokenRef.current='';
     setEnabled(false);setStatus('System notifications disabled.');
    }else{
     await api('POST',token);
     tokenRef.current=token;
     setEnabled(true);
     setStatus('System notifications enabled. Match alerts can appear even when this app is closed.');
    }
   }catch(error){
    setStatus(error.message||'Push registration failed. Retry in the app.');
    setEnabled(false);
   }finally{setBusy(false)}
  };
  actionRef.current='sync';
  bridge.postMessage(JSON.stringify({action:'status'}));
  bridge.postMessage(JSON.stringify({action:'sync'}));
  return ()=>{mountedRef.current=false;bridge.onmessage=null};
 },[api]);
 const toggle=()=>{
  if(!window.OverPowerNative?.postMessage)return;
  setBusy(true);setStatus('Updating Android system notifications…');
  actionRef.current=enabled?'disable':'enable';
  window.OverPowerNative.postMessage(JSON.stringify({action:enabled?'disable':'enable'}));
 };
 if(!native)return null;
 return <section className="op-app-native-push" aria-label="Android system notifications">
  <span className="op-app-native-push-icon">{enabled?<FiCheckCircle/>:<FiBell/>}</span>
  <span className="op-app-native-push-copy">
   <strong>Android System Notifications</strong>
   <small role="status">{status}</small>
  </span>
  <button type="button" disabled={busy} onClick={toggle} aria-pressed={enabled}>
   {busy?'Please wait…':enabled?'Disable':'Enable Alerts'}
  </button>
 </section>;
}
