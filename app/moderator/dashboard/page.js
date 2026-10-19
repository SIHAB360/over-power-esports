"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
import {MODERATOR_SECTIONS,ACTION_LABELS} from "../../lib/moderator-capabilities";
export default function ModeratorDashboard(){
 const router=useRouter(),[permissions,setPermissions]=useState([]),[status,setStatus]=useState("লোড হচ্ছে...");
 useEffect(()=>{let valid=true;(async()=>{
  const {data:{session}}=await supabase.auth.getSession();if(!session){router.replace("/login");return;}
  const res=await fetch("/api/moderator/me",{cache:"no-store",headers:{Authorization:`Bearer ${session.access_token}`}}).catch(()=>null);
  if(!valid)return;if(!res?.ok){setStatus("আপনার Moderator Access নেই অথবা বন্ধ রয়েছে।");return;}
  const body=await res.json();setPermissions(body.permissions||[]);setStatus("");
 })();return()=>{valid=false}},[router]);
 const enabled=MODERATOR_SECTIONS.filter(s=>permissions.some(p=>p.section===s.id&&p.action==="view"));
 return <main style={{minHeight:"100vh",padding:"clamp(20px,4vw,55px)",background:"linear-gradient(135deg,#080d20,#231229)",color:"#fff",fontFamily:'"Hind Siliguri",sans-serif'}}>
 <Link href="/player/dashboard" style={{color:"#fca8c9"}}>← প্লেয়ার ড্যাশবোর্ড</Link>
 <h1 style={{fontSize:"clamp(26px,4vw,42px)"}}>Moderator Dashboard</h1>
 <p style={{color:"#afc0d9"}}>আপনার জন্য অনুমোদিত বিভাগ এবং কাজের তালিকা</p>
 {status?<p role="status">{status}</p>:enabled.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:15}}>
 {enabled.map(s=><section key={s.id} style={{padding:22,borderRadius:17,background:"#14213b",border:"1px solid #654270"}}><h2>{s.label}</h2><p>{permissions.filter(x=>x.section===s.id).map(x=>ACTION_LABELS[x.action]).join(" · ")}</p>{s.actions.includes("view")?<Link href={`/moderator/section/${s.id}`} style={{display:"inline-block",marginTop:12,padding:"10px 14px",borderRadius:10,color:"white",textDecoration:"none",background:"linear-gradient(90deg,#9e2c80,#e13b80)"}}>বিভাগ খুলুন ↗</Link>:<small style={{color:"#becce1"}}>এই বিভাগে নিরাপদ API এখনো চালু হয়নি।</small>}</section>)}
 </div>:<p>এখনো কোনো বিভাগের অনুমতি দেওয়া হয়নি।</p>}
 </main>;
}
