'use client';

import {useEffect,useState} from 'react';
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
  const [theme,setTheme]=useState('dark');
  useEffect(()=>{
    const current=savedTheme();
    setTheme(current);
    applyTheme(current);
    const sync=(event)=>{
      if(event.type==='storage'&&event.key!==KEY&&event.key!==null)return;
      const next=savedTheme();setTheme(next);applyTheme(next);
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
  function select(value){
    try{localStorage.setItem(KEY,value)}catch{}
    setTheme(value);applyTheme(value);
    window.dispatchEvent(new Event(EVENT));
  }
  return (
    <div className="op-admin-theme-tools" role="group" aria-label="Admin appearance: light or dark">
      <span className="op-admin-theme-caption">THEME</span>
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
}
