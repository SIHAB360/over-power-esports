"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "../../lib/supabase";
import {STAFF_SECTIONS} from "../../lib/staff-sections";
export default function StaffPortal(){
 const router=useRouter(),[grants,setGrants]=useState([]),[status,setStatus]=useState("লোড হচ্ছে...");
 useEffect(()=>{let active=true;(async()=>{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){router.replace("/login");return}
  const res=await fetch("/api/player/staff-access",{headers:{Authorization:"Bearer "+session.access_token},cache:"no-store"});
  if(!active)return;
  if(!res.ok){setStatus("স্টাফ অ্যাক্সেস এখনো চালু হয়নি");return}
  const body=await res.json();setGrants(body.grants||[]);setStatus("");
 })();return()=>{active=false}},[router]);
 const allowed=STAFF_SECTIONS.filter(section=>grants.some(g=>g.section===section.id&&g.action==="view"));
 return <main style={{minHeight:"100vh",padding:"clamp(20px,4vw,54px)",color:"white",background:"linear-gradient(135deg,#090d20,#25112d)",fontFamily:"var(--font-bangla),sans-serif"}}>
 <Link href="/player/dashboard" style={{color:"#ffb4d4"}}>← প্লেয়ার ড্যাশবোর্ড</Link>
 <h1>Staff Control Panel</h1><p>আপনার অনুমোদিত সেকশনগুলো এখানে দেখা যাবে।</p>
 {status?<p role="status">{status}</p>:allowed.length===0?<p>আপনাকে এখনো কোনো সেকশনের অনুমতি দেওয়া হয়নি।</p>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16}}>
 {allowed.map(section=><article key={section.id} style={{padding:24,border:"1px solid #784c88",borderRadius:16,background:"#1a2036"}}>
 <h2>{section.label}</h2><p>{grants.filter(g=>g.section===section.id).map(g=>g.action).join(" · ")}</p>
 <small>এই সেকশনের সার্ভার-সাইড নিরাপত্তা সংযোগ সম্পন্ন হলে এখান থেকে কাজ করা যাবে।</small>
 </article>)}</div>}</main>;
}
