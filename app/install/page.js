'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import './install.css';

const title='OVER POWER ESPORTS';
export default function InstallApp(){
 const [prompt,setPrompt]=useState(null);
 const [installed,setInstalled]=useState(false);
 const [platform,setPlatform]=useState('desktop');
 const [status,setStatus]=useState('');
 useEffect(()=>{
  const ua=navigator.userAgent||'';
  const ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const android=/Android/i.test(ua);
  const mac=/Macintosh|Mac OS X/i.test(ua)&&!ios;
  setPlatform(ios?'ios':android?'android':mac?'mac':'windows');
  setInstalled(window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true);
  const onPrompt=e=>{e.preventDefault();setPrompt(e)};
  const onInstall=()=>{setInstalled(true);setPrompt(null);setStatus('App installed successfully.')};
  window.addEventListener('beforeinstallprompt',onPrompt);
  window.addEventListener('appinstalled',onInstall);
  return()=>{
   window.removeEventListener('beforeinstallprompt',onPrompt);
   window.removeEventListener('appinstalled',onInstall);
  };
 },[]);
 const install=async()=>{
  if(!prompt)return;
  try{
   await prompt.prompt();
   const choice=await prompt.userChoice;
   if(choice?.outcome==='accepted')setStatus('Installation requested. Finish the browser confirmation.');
   else setStatus('Installation was dismissed; you can try again.');
   setPrompt(null);
  }catch{setStatus('This browser cannot install automatically. Use the manual steps below.')}
 };
 return <main className="op-install">
  <div className="op-install-nav"><Link href="/">← OVER POWER ESPORTS</Link><Link href="/login">Login →</Link></div>
  <section className="op-install-hero">
   <div className="op-install-logo" aria-hidden="true">OP</div>
   <p className="op-install-eyebrow">ONE ACCOUNT · ALL YOUR DEVICES</p>
   <h1>Get the {title} App</h1>
   <p>A dedicated app interface with Sign In, Home, Match Center, Wallet, Notifications and Profile tabs. Your public website remains separate.</p><a className="op-install-open" href="/app">Open the App →</a>
   {installed?<div className="op-install-state">✓ You are using the installed web app</div>:
     prompt?<button type="button" className="op-install-action" onClick={install}>Install {title} <span aria-hidden="true">↘</span></button>:
     <div className="op-install-state">Select your device below for the supported installation steps.</div>}
   {status&&<p role="status" className="op-install-status">{status}</p>}
  </section>
  <div className="op-install-devices">
   <button type="button" aria-pressed={platform==='android'} onClick={()=>setPlatform('android')}>Android</button>
   <button type="button" aria-pressed={platform==='ios'} onClick={()=>setPlatform('ios')}>iPhone / iPad</button>
   <button type="button" aria-pressed={platform==='mac'} onClick={()=>setPlatform('mac')}>MacBook</button>
   <button type="button" aria-pressed={platform==='windows'} onClick={()=>setPlatform('windows')}>Windows PC</button>
  </div>
  <section className="op-install-guide">
   {platform==='android'&&<>
    <h2>Install on Android</h2>
    <p>Open this page in Chrome on your Android phone. Use the Install button when shown, or open the Chrome menu and choose <strong>Install app</strong> / <strong>Add to Home screen</strong>.</p>
    <p>The Android test APK and future signed Android release are managed through the project’s GitHub Android App builds.</p>
   </>}
   {platform==='ios'&&<>
    <h2>Install on iPhone or iPad</h2>
    <p>Open this website in <strong>Safari</strong>, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong> and confirm.</p>
    <p>Open the Home Screen icon for the standalone app. On supported iOS versions, match push alerts can be enabled from inside the installed player app after login, with your permission.</p>
   </>}
   {platform==='mac'&&<>
    <h2>Install on MacBook</h2>
    <p>On macOS Sonoma or newer, open this website in <strong>Safari</strong> and choose <strong>File → Add to Dock</strong>. On Chrome, use <strong>Install page as app</strong> where offered.</p>
    <p>A separate macOS desktop application is also being prepared with Intel and Apple Silicon build packages. Unsigned test DMG files may require developer signing/notarization before normal public installation.</p>
   </>}
   {platform==='windows'&&<>
    <h2>Install on Windows PC</h2>
    <p>Open this website in <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong>, then choose <strong>Install this site as an app</strong> from the browser menu.</p>
    <p>A separate portable Windows desktop executable is also being prepared. Unsigned test builds may trigger a Windows SmartScreen warning.</p>
   </>}
   <div className="op-install-note">
    <strong>Live data, not copied data</strong>
    <p>All platforms use the same login, match schedules and financial records. Offline access to private dashboards and balances is deliberately disabled. The installed browser app supports notification opt-in where the device and browser support Web Push.</p>
   </div>
  </section>
 </main>;
}
