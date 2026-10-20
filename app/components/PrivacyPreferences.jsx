'use client';
import {useEffect,useState} from 'react';
const KEY='op-analytics-consent-v1';
export default function PrivacyPreferences(){
 const [value,setValue]=useState('');
 useEffect(()=>{try{setValue(localStorage.getItem(KEY)||'not selected')}catch{setValue('unavailable')}},[]);
 function change(choice){try{localStorage.setItem(KEY,choice);sessionStorage.removeItem('op-analytics-session-v1');setValue(choice);window.location.reload()}catch{setValue('unavailable')}}
 return <section style={{marginTop:35,border:'1px solid #72935b',padding:20,borderRadius:15,background:'#1b2d2d'}}><h2 style={{marginTop:0}}>Your analytics preference</h2><p>Current choice: <strong>{value==='yes'?'Allow':value==='no'?'Decline':value}</strong>. You can change it at any time.</p><div style={{display:'flex',flexWrap:'wrap',gap:10}}><button onClick={()=>change('yes')} style={{padding:'11px 18px',borderRadius:8,border:0,background:'#c1ff78',color:'#18221b',fontWeight:800,cursor:'pointer'}}>Allow analytics</button><button onClick={()=>change('no')} style={{padding:'11px 18px',borderRadius:8,border:'1px solid #8ba0a1',background:'#172733',color:'white',fontWeight:800,cursor:'pointer'}}>Decline analytics</button></div></section>
}
