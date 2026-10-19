"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
export default function ModeratorShortcut(){
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{let active=true;(async()=>{
  const {data:{session}}=await supabase.auth.getSession();if(!session)return;
  const res=await fetch("/api/moderator/me",{cache:"no-store",headers:{Authorization:`Bearer ${session.access_token}`}}).catch(()=>null);
  if(!active||!res?.ok)return;const body=await res.json().catch(()=>({}));
  if(active)setEnabled(body.enabled&&body.permissions?.some(x=>x.action==="view"));
 })();return()=>{active=false}},[]);
 if(!enabled)return null;
 return <Link href="/moderator/dashboard" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:54,padding:"12px 20px",borderRadius:16,background:"linear-gradient(110deg,#49d6de,#2ea6b9)",color:"#071a28",fontSize:16,fontWeight:800,textDecoration:"none",border:"1px solid #9ceaf0"}}>⚙ MODERATOR PANEL ↗</Link>;
}
