'use client';

import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {usePathname} from 'next/navigation';
import {FiMoon,FiSun} from 'react-icons/fi';

const KEY='op-admin-dashboard-theme';
const EVENT='op-admin-theme-change';
function savedTheme(){
  try{return localStorage.getItem(KEY)==='light'?'light':'dark';}
  catch{return 'dark';}
}
function applyTheme(value){
  document.documentElement.setAttribute('data-op-admin-theme',value);
  document.documentElement.style.colorScheme=value;
}
export default function AdminThemeControl(){
  const pathname=usePathname();
  const [theme,setTheme]=useState('dark');
  const [slot,setSlot]=useState(null);
  const onDashboard=pathname==='/admin/dashboard';

  useEffect(()=>{
    const current=savedTheme();
    setTheme(current);applyTheme(current);
    const sync=(event)=>{
      if(event.type==='storage'&&event.key!==KEY&&event.key!==null)return;
      const next=savedTheme();
      setTheme(next);applyTheme(next);
    };
    window.addEventListener('storage',sync);
    window.addEventListener(EVENT,sync);
    return()=>{
      window.removeEventListener('storage',sync);
      window.removeEventListener(EVENT,sync);
      document.documentElement.removeAttribute('data-op-admin-theme');
      document.documentElement.style.removeProperty('color-scheme');
    };
  },[]);
  useEffect(()=>{
    // Dashboard keeps its switch INSIDE the main hero, not in a global top bar.
    // The rest of the admin routes use a compact utility dock in their content.
    if(!onDashboard){setSlot(null);return;}
    let frame=0,attempts=0;
    const find=()=>{
      const target=document.querySelector('[data-op-theme-slot]');
      if(target){setSlot(target);return;}
      if(++attempts<75)frame=requestAnimationFrame(find);
    };
    find();
    return()=>{cancelAnimationFrame(frame);setSlot(null)};
  },[onDashboard]);
  function select(value){
    try{localStorage.setItem(KEY,value)}catch{}
    setTheme(value);applyTheme(value);
    window.dispatchEvent(new Event(EVENT));
  }
  const controls=(
    <div className="op-admin-theme-tools" role="group" aria-label="Admin appearance: light or dark">
      <span className="op-admin-theme-caption">APPEARANCE</span>
      <button type="button" className={theme==='light'?'op-theme-option selected':'op-theme-option'}
        aria-pressed={theme==='light'} aria-label="Activate light mode" onClick={()=>select('light')}>
        <FiSun aria-hidden="true"/><span>Light</span>
      </button>
      <button type="button" className={theme==='dark'?'op-theme-option selected':'op-theme-option'}
        aria-pressed={theme==='dark'} aria-label="Activate dark mode" onClick={()=>select('dark')}>
        <FiMoon aria-hidden="true"/><span>Dark</span>
      </button>
    </div>
  );
  if(onDashboard)return slot?createPortal(controls,slot):null;
  return controls;
}
