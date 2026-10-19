"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
import {MODERATOR_SECTIONS,ACTION_LABELS} from "../../lib/moderator-capabilities";
import styles from "./dashboard.module.css";

export default function ModeratorDashboard(){
  const router=useRouter();
  const [permissions,setPermissions]=useState([]);
  const [status,setStatus]=useState("Loading your permissions...");
  useEffect(()=>{
    let valid=true;
    (async()=>{
      try {
        const {data:{session}}=await supabase.auth.getSession();
        if(!session){router.replace("/login");return;}
        const res=await fetch("/api/moderator/me",{cache:"no-store",headers:{Authorization:`Bearer ${session.access_token}`}}).catch(()=>null);
        if(!valid)return;
        if(!res?.ok){setStatus("Your moderator access is unavailable or has been disabled.");return;}
        const body=await res.json();
        setPermissions(body.permissions||[]);
        setStatus("");
      }catch{if(valid)setStatus("Unable to load access. Please refresh and try again.");}
    })();
    return()=>{valid=false};
  },[router]);
  const enabled=MODERATOR_SECTIONS.filter(s=>permissions.some(p=>p.section===s.id&&p.action==="view"));
  const totalActions=permissions.length;
  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav} aria-label="Moderator navigation">
      <Link href="/player/dashboard" className={styles.back}>← Player Dashboard</Link>
      <span className={styles.brand}>OVER POWER ESPORTS <span> / MODERATOR</span></span>
    </nav>
    <div className={styles.hero}>
      <div><span className={styles.kicker}>YOUR CONTROL CENTER</span><h1>Moderator Dashboard</h1>
      <p>Your assigned sections and actions in one secure workspace.</p></div>
      <div className={styles.heroBadge} aria-hidden="true">✧</div>
    </div>
    <div className={styles.summaryGrid}>
      <div className={styles.summaryTile}><strong>{enabled.length}</strong><span>Accessible Sections</span></div>
      <div className={styles.summaryTile}><strong>{totalActions}</strong><span>Granted Actions</span></div>
      <div className={styles.summaryTile}><strong>Scoped</strong><span>Permission Mode</span></div>
    </div>
    <section className={styles.workspace} aria-label="Accessible moderator sections">
      <div className={styles.sectionHeader}><div><span className={styles.kicker}>WORKSPACE</span><h2>Assigned Sections</h2></div><span className={styles.counter}>{enabled.length} available</span></div>
      {status?<p role="status" className={styles.notice}>{status}</p>:enabled.length?
        <div className={styles.cards}>{enabled.map((s,i)=><article className={styles.card} key={s.id}>
          <div className={styles.cardTop}><span className={styles.cardIndex}>{String(i+1).padStart(2,"0")}</span><span className={styles.cardStatus}>ACTIVE</span></div>
          <h3>{s.label}</h3><p className={styles.description}>{s.description}</p>
          <div className={styles.perms}>{permissions.filter(x=>x.section===s.id).map(x=><span key={`${x.section}-${x.action}`}>{ACTION_LABELS[x.action]}</span>)}</div>
          <Link className={styles.open} href={`/moderator/section/${s.id}`}>Open Section <span aria-hidden="true">↗</span></Link>
        </article>)}</div>
        :<div className={styles.empty}><strong>No sections assigned yet</strong><p>Access is granted by the main administrator. Your player account remains unchanged.</p></div>}
    </section>
    <p className={styles.footer}>Access is limited to actions explicitly assigned by the Main Admin. Financial editing and approvals are restricted.</p>
  </div></main>;
}
