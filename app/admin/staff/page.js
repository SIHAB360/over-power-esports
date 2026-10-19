"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
import styles from "./staff.module.css";
const EMPTY={view:true,create:false,edit:false};
export default function StaffManagement(){
 const [players,setPlayers]=useState([]),[permissions,setPermissions]=useState([]);
 const [selected,setSelected]=useState(""),[flags,setFlags]=useState(EMPTY);
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
 useEffect(()=>{const p=permissions.find(x=>x.user_id===selected);setFlags(p?{view:p.match_view,create:p.match_create,edit:p.match_edit}:EMPTY)},[selected,permissions]);
 async function save(){if(!selected)return;setSaving(true);try{await api("POST",{userId:selected,...flags});setMessage("পারমিশন সংরক্ষণ হয়েছে");await refresh();}catch(e){setMessage(e.message)}finally{setSaving(false)}}
 return <main className={styles.page}><div className={styles.wrap}>
 <header><Link href="/admin/dashboard">← Admin Dashboard</Link><span>SUPER ADMIN · ACCESS CONTROL</span></header>
 <h1>স্টাফ ও পারমিশন ম্যানেজমেন্ট</h1><p>রেজিস্টার্ড প্লেয়ারকে শুধুমাত্র Match Center-এর নির্দিষ্ট দায়িত্ব দিন। কোনো প্লেয়ারকে Global Admin বানানো হবে না।</p>
 <section className={styles.panel}><h2>Match Center Permissions</h2>
 {message&&<p role="status" className={styles.notice}>{message}</p>}
 <label htmlFor="player">স্টাফ হিসেবে প্লেয়ার নির্বাচন</label>
 <select id="player" value={selected} onChange={e=>setSelected(e.target.value)} disabled={loading||saving}>
 <option value="">প্লেয়ার নির্বাচন করুন</option>{players.map(p=><option key={p.user_id} value={p.user_id}>{p.full_name||p.ign||p.user_id} {p.ign?"("+p.ign+")":""}</option>)}
 </select>
 <div className={styles.choices}>
 {[["view","ম্যাচ দেখতে পারবে"],["create","নতুন ম্যাচ তৈরি করতে পারবে"],["edit","ম্যাচ এডিট করতে পারবে"]].map(([key,label])=><label key={key}><input type="checkbox" checked={flags[key]} onChange={e=>setFlags(prev=>({...prev,[key]:e.target.checked,...(key==="view"&&!e.target.checked?{create:false,edit:false}:key!=="view"&&e.target.checked?{view:true}:{})}))}/>{label}</label>)}
 </div>
 <button disabled={!selected||saving||loading} onClick={save}>{saving?"সংরক্ষণ হচ্ছে...":"পারমিশন সংরক্ষণ করুন"}</button>
 <p className={styles.warning}>নিরাপত্তা যাচাই ও Match Center-এর server-side authorization সম্পন্ন না হওয়া পর্যন্ত নতুন Staff-এর কার্যকর ম্যাচ-এডিট অ্যাক্সেস দেওয়া হবে না।</p>
 </section></div></main>
}
