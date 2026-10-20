'use client';
import {useEffect} from 'react';

// Register the same worker for installability/offline fallback AND for push.
// This does not ask for browser permission or collect private information.
export default function PwaBootstrap(){
 useEffect(()=>{
  if(!('serviceWorker' in navigator))return;
  const register=()=>navigator.serviceWorker.register('/match-notifications-sw.js',{scope:'/'})
   .catch(error=>console.warn('PWA setup unavailable:',error?.message||'registration failed'));
  if(document.readyState==='complete')register();
  else{window.addEventListener('load',register,{once:true});return()=>window.removeEventListener('load',register)}
 },[]);
 return null;
}
