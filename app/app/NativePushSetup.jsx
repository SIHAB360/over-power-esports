'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

export default function NativePushSetup(){
 const [native,setNative]=useState(false);
 const [status,setStatus]=useState('');
 const [loading,setLoading]=useState(false);

 useEffect(()=>{
  let alive=true;
  const attach=()=>{
   const bridge=window.OverPowerNative;
   if(!bridge||!bridge.postMessage)return;
   if(alive)setNative(true);
  };
  attach();
  const timer=setInterval(attach,800);
  const onMessage=async(event)=>{
   if(!alive)return;
   let data;
   try{data=JSON.parse(event.data||'{}')}catch{return}
   if(data.type==='push-error'){
    setLoading(false);
    setStatus(data.message||'Native notifications are not available.');
    return;
   }
   if(data.type==='push-token'&&typeof data.token==='string'){
    try{
     const {data:{session}}=await supabase.auth.getSession();
     if(!session?.access_token)throw Error('Sign in first.');
     const res=await fetch('/api/player/native-push',{method:'POST',
      headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
      body:JSON.stringify({token:data.token,platform:'android'})});
     if(!res.ok)throw Error('Device registration failed. Please try again.');
     window.localStorage.setItem('op-native-push-opted-in','true');
     if(alive)setStatus('Enabled. Match alerts will appear in Android notifications.');
    }catch(e){if(alive)setStatus(e.message||'Unable to register notifications.')}
    finally{if(alive)setLoading(false)}
   }
  };
  if(window.OverPowerNative?.addEventListener)
   window.OverPowerNative.addEventListener('message',onMessage);
  return()=>{
   alive=false;clearInterval(timer);
   window.OverPowerNative?.removeEventListener?.('message',onMessage);
  };
 },[]);
 const enable=()=>{
  setLoading(true);setStatus('Requesting Android permission…');
  try{
   if(!window.OverPowerNative?.postMessage){
    setStatus('Native Android push requires the updated APK.');
    setLoading(false);return;
   }
   window.OverPowerNative.postMessage('enable-push');
  }catch{setStatus('Android notification setup is unavailable.');setLoading(false)}
 };
 if(!native)return <p className="op-app-native-hint">
  For notifications while the app is closed, install the latest native Android app.
  Browser users can enable supported Web Push alerts below.
 </p>;
 return <div className="op-app-native-push">
  <h3>Android Notification Alerts</h3>
  <p>Get a notification banner when your squad's match is published and
   60, 30 and 15 minutes before start — including when the app is closed.
   Android notification permission is required.</p>
  <button className="op-app-primary" type="button" disabled={loading} onClick={enable}>
   {loading?'Setting up notifications…':'Enable Android Notifications'}
  </button>
  {status&&<p role="status">{status}</p>}
 </div>;
}
