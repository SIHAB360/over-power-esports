"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
import styles from "./staff.module.css";
import {STAFF_SECTIONS,STAFF_ACTIONS} from "../../lib/staff-sections";
const EMPTY=[];
export default function StaffManagement(){
 const [players,setPlayers]=useState([]),[permissions,setPermissions]=useState([]);
 const [selected,setSelected]=useState(""),[section,setSection]=useState("matches"),[flags,setFlags]=useState(EMPTY);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
 async function api(method="GET",body){
   const {data:{session}}=await supabase.auth.getSession();
   if(!session?.access_token)throw Error("লগইন করুন");
   const res=await fetch("/api/admin/staff-permissions",{method,cache:"no-store",headers:{Authorization:"Bearer "+session.access_token,...(body?{"Content-Type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{})});
   const payload=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(payload.message||"অনুরোধ ব্যর্থ");
   return payload;
 }
 async function refresh(){setLoading(true);try{const d=await api();setPlayers(d.players);setPermissions(d.permissions);setMessage("");}catch(e){setMessage(e.message);}finally{setLoading(false)}}
 useEffect(()=>{refresh()},[]);
 useEffect(()=>{const p=permissions.find(x=>x.user_id===selected);setFlags(permissions.filter(p=>p.user_id===selected&&p.section===section).map(p=>p.action))},[selected,section,permissions]);
 async function save(){if(!selected)return;setSaving(true);try{await api("POST",{userId:selected,section,actions:flags});setMessage("পারমিশন সংরক্ষণ হয়েছে");await refresh();}catch(e){setMessage(e.message)}finally{setSaving(false)}}
 return <main className={styles.page}><div className={styles.wrap}>
 <header><Link href="/admin/dashboard">← Admin Dashboard</Link><span>SUPER ADMIN · ACCESS CONTROL</span></header>
 <h1>স্টাফ ও পারমিশন ম্যানেজমেন্ট</h1><p>রেজিস্টার্ড প্লেয়ারকে ওয়েবসাইটের যেকোনো বিভাগের নির্দিষ্ট দায়িত্ব দিন। কোনো প্লেয়ারকে Global Admin বানানো হবে না।</p>
 <section className={styles.panel}><h2>সেকশনভিত্তিক পারমিশন</h2>
 {message&&<p role="status" className={styles.notice}>{message}</p>}
 <label htmlFor="player">স্টাফ হিসেবে প্লেয়ার নির্বাচন</label>
 <select id="player" value={selected} onChange={e=>setSelected(e.target.value)} disabled={loading||saving}>
 <option value="">প্লেয়ার নির্বাচন করুন</option>{players.map(p=><option key={p.user_id} value={p.user_id}>{p.full_name||p.ign||p.user_id} {p.ign?"("+p.ign+")":""}</option>)}
 </select>
 <label htmlFor="section">ওয়েবসাইটের বিভাগ নির্বাচন</label>
 <select id="section" value={section} onChange={e=>setSection(e.target.value)}>
 {STAFF_SECTIONS.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
 </select>
 <div className={styles.choices}>
 {STAFF_ACTIONS.map(action=><label key={action}><input type="checkbox" checked={flags.includes(action)} onChange={e=>setFlags(prev=>{
 if(e.target.checked)return [...new Set([...prev,"view",action])];
 return action==="view"?[]:prev.filter(x=>x!==action);
 })}/>{action.toUpperCase()}</label>)}
 </div>
 <button disabled={!selected||saving||loading} onClick={save}>{saving?"সংরক্ষণ হচ্ছে...":"পারমিশন সংরক্ষণ করুন"}</button>
 <p className={styles.warning}>নিরাপত্তা যাচাই ও Match Center-এর server-side authorization সম্পন্ন না হওয়া পর্যন্ত নতুন Staff-এর কার্যকর Admin অ্যাক্সেস দেওয়া হবে না।</p>
 </section></div></main>
}
