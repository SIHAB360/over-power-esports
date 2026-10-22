'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

const flag='op-native-push-opted-in';
const tokenKey='op-native-push-token';
const ownerKey='op-native-push-user-id';

export default function NativePushSetup({hideWebHint=false}){
 const [native,setNative]=useState(false);
 const [status,setStatus]=useState('');
 const [loading,setLoading]=useState(false);
 const [registered,setRegistered]=useState(false);
 const [serverReady,setServerReady]=useState(false);

 useEffect(()=>{
  let alive=true,observer=null;
  const attach=()=>{
   const bridge=window.OverPowerNative;
   if(!bridge?.postMessage)return;
   if(alive)setNative(true);
   if(!observer){
    observer=async(event)=>{
     if(!alive)return;
     let data;
     try{data=JSON.parse(event.data||'{}')}catch{return}
     if(data.type==='push-error'){
      setLoading(false);setStatus(data.message||'Device notifications are unavailable.');
      return;
     }
     if(data.type==='push-disabled'){
      setRegistered(false);setLoading(false);
      setStatus('Android match notifications disabled on this device.');
      return;
     }
     if(data.type==='push-token'&&typeof data.token==='string'){
      try{
       const {data:{session}}=await supabase.auth.getSession();
       if(!session?.access_token||!session.user?.id)throw Error('Sign in first.');
       const response=await fetch('/api/player/native-push',{
        method:'POST',cache:'no-store',
        headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
        body:JSON.stringify({token:data.token,platform:'android'})
       });
       const body=await response.json().catch(()=>({}));
       if(!response.ok)throw Error(body.message||'Device registration failed.');
       window.localStorage.setItem(tokenKey,data.token);
       window.localStorage.setItem(ownerKey,session.user.id);
       window.localStorage.setItem(flag,'true');
       if(alive){
        setRegistered(true);setServerReady(Boolean(body.deliveryConfigured));
        setStatus(body.deliveryConfigured
         ?'Match alerts enabled. Android can show notifications when this app is closed.'
         :'Device registered. Firebase server setup is pending; background alerts are NOT active yet.');
       }
      }catch(e){if(alive)setStatus(e.message||'Unable to register device.')}
      finally{if(alive)setLoading(false)}
     }
    };
    bridge.addEventListener?.('message',observer);
    // Resync rotated FCM tokens after returning to the app without reprompting
    // the operating-system permission (only for the previously opted-in user).
    if(window.localStorage.getItem(flag)==='true'){
     supabase.auth.getUser().then(({data:{user}})=>{
      if(!alive||!user?.id)return;
      if(window.localStorage.getItem(ownerKey)!==user.id)return;
      setRegistered(true);
      bridge.postMessage('refresh-push');
     }).catch(()=>{});
    }
   }
  };
  attach();
  const timer=setInterval(attach,800);
  return()=>{
   alive=false;clearInterval(timer);
   if(observer)window.OverPowerNative?.removeEventListener?.('message',observer);
  };
 },[]);
 const enable=()=>{
  setLoading(true);setStatus('Requesting Android notification permission…');
  try{
   if(!window.OverPowerNative?.postMessage)throw Error('Install the current Android APK to enable native push.');
   window.OverPowerNative.postMessage('enable-push');
  }catch(e){setStatus(e.message);setLoading(false)}
 };
 const disable=async()=>{
  setLoading(true);
  const token=window.localStorage.getItem(tokenKey);
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(token&&session?.access_token){
    const response=await fetch('/api/player/native-push',{method:'DELETE',
     headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
     body:JSON.stringify({token})});
    if(!response.ok)throw Error('Could not remove this device. Please retry.');
   }
   window.OverPowerNative?.postMessage?.('disable-push');
   window.localStorage.removeItem(flag);
   window.localStorage.removeItem(tokenKey);
   window.localStorage.removeItem(ownerKey);
   setRegistered(false);setServerReady(false);
   setStatus('Match notifications were turned off for this device.');
  }catch(e){setStatus(e.message||'Could not disable notifications.')}
  finally{setLoading(false)}
 };
 if(!native&&hideWebHint)return null;
 if(!native)return <p className="op-app-native-hint">
  For alerts when the app is closed, install the latest Android app.
  On supported browsers, you can also enable Web Push below.
 </p>;
 return <div className="op-app-native-push">
  <h3>Android Match Notifications</h3>
  <p>Get a high-priority system notification when your squad's match is published,
   and 60, 30 and 15 minutes before start. Android permission and Firebase
   server activation are required.</p>
  <button className="op-app-primary" type="button" disabled={loading} onClick={enable}>
   {loading?'Setting up notifications…':registered?'Refresh Notification Registration':'Enable Android Notifications'}
  </button>
  {registered&&<button type="button" className="op-app-link" disabled={loading} onClick={disable}>
   Disable Notifications on This Device
  </button>}
  {status&&<p role="status">{status}</p>}
  {registered&&!serverReady&&<p className="op-app-native-hint">
   Firebase server setup is still pending. Inbox notices remain available,
   but background banners are not guaranteed yet.
  </p>}
 </div>;
}
