"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {supabase} from "../../lib/supabase";
import {ACTION_LABELS,MODERATOR_ACTIONS,MODERATOR_SECTIONS,normalizeModeratorGrants} from "../../lib/moderator-capabilities";
import styles from "./moderators.module.css";
const empty=[];
export default function ModeratorManagement(){
  const [players,setPlayers]=useState([]),[moderators,setModerators]=useState([]),[grants,setGrants]=useState([]);
  const [audit,setAudit]=useState([]),[operationAudit,setOperationAudit]=useState([]);
  const [selected,setSelected]=useState(""),[search,setSearch]=useState(""),[allowed,setAllowed]=useState([]);
  const [enabled,setEnabled]=useState(true),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true),[notice,setNotice]=useState("");
  const [section,setSection]=useState("matches");
  const call=useCallback(async(method="GET",body)=>{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.access_token)throw Error("আপনার সেশন শেষ হয়েছে। আবার লগইন করুন।");
    const res=await fetch("/api/admin/moderators",{method,cache:"no-store",headers:{Authorization:`Bearer ${session.access_token}`,...(body?{"Content-Type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{})});
    const out=await res.json().catch(()=>({}));if(!res.ok)throw Error(out.message||"Moderator Service unavailable");return out;
  },[]);
  const refresh=useCallback(async()=>{
    setLoading(true);try{const result=await call();setPlayers(result.players||[]);setModerators(result.moderators||[]);setGrants(result.grants||[]);setAudit(result.audit||[]);setOperationAudit(result.operationAudit||[]);setNotice("");}
    catch(e){setNotice(e.message)}finally{setLoading(false)}
  },[call]);
  useEffect(()=>{refresh()},[refresh]);
  useEffect(()=>{
    const member=moderators.find(x=>x.user_id===selected);
    setEnabled(member?member.enabled:true);
    setAllowed(grants.filter(x=>x.user_id===selected).map(x=>({section:x.section,action:x.action})));
  },[selected,moderators,grants]);
  const chosen=useMemo(()=>players.find(p=>p.user_id===selected),[selected,players]);
  const filtered=useMemo(()=>players.filter(x=>`${x.full_name||""} ${x.ign||""}`.toLowerCase().includes(search.toLowerCase())),[search,players]);
  function toggle(sectionId,action,checked){
    setAllowed(old=>{let next=old.filter(x=>!(x.section===sectionId&&x.action===action));
      if(action==="view"&&!checked)return next.filter(x=>x.section!==sectionId);
      if(checked){next=[...next,{section:sectionId,action}];if(action!=="view"&&!next.some(x=>x.section===sectionId&&x.action==="view"))next.push({section:sectionId,action:"view"});}
      return next;
    });
  }
  async function save(active=enabled){
    if(!selected||saving)return;
    if(!active&&!window.confirm("এই মডারেটরের সব অ্যাক্সেস বন্ধ করবেন?"))return;
    if(chosen?.status!=="approved"&&active){setNotice("শুধু অনুমোদিত প্লেয়ারকে মডারেটর করা যাবে।");return;}
    setSaving(true);try{
      const payload={userId:selected,enabled:active,grants:active?normalizeModeratorGrants(allowed):empty};
      await call("POST",payload);await refresh();setNotice(active?"Moderator Permissions সংরক্ষণ হয়েছে।":"Moderator Access বন্ধ হয়েছে।");
    }catch(e){setNotice(e.message)}finally{setSaving(false)}
  }
  return <main className={styles.page}><div className={styles.wrap}>
    <header className={styles.header}><Link href="/admin/dashboard">← অ্যাডমিন ড্যাশবোর্ড</Link><span className={styles.eyebrow}>OVER POWER ESPORTS · SUPER ADMIN</span></header>
    <div className={styles.heading}><div><h1>মডারেটর ম্যানেজমেন্ট</h1><p>প্লেয়ারকে Moderator বানান এবং প্রতিটি সেকশনের কাজ আলাদাভাবে নিয়ন্ত্রণ করুন।</p></div><span className={styles.shield}>♜</span></div>
    <div className={styles.metrics}><div><strong>{players.length}</strong><small>রেজিস্টার্ড প্লেয়ার</small></div><div><strong>{moderators.filter(x=>x.enabled).length}</strong><small>সক্রিয় মডারেটর</small></div><div><strong>{grants.length}</strong><small>সেকশন পারমিশন</small></div></div>
    {notice&&<p role="status" className={styles.notice}>{notice}</p>}
    <div className={styles.layout}><section className={styles.panel}>
      <h2>১. প্লেয়ার নির্বাচন করুন</h2><input className={styles.input} aria-label="প্লেয়ার খুঁজুন" placeholder="নাম বা IGN দিয়ে খুঁজুন..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className={styles.roster} role="listbox" aria-label="Moderator হিসেবে নির্বাচন করার জন্য প্লেয়ার">
        {loading?<p>লোড হচ্ছে...</p>:filtered.length===0?<p>কোনো প্লেয়ার পাওয়া যায়নি।</p>:filtered.map(player=>{
          const member=moderators.find(m=>m.user_id===player.user_id);return <button key={player.user_id} className={`${styles.rosterEntry} ${selected===player.user_id?styles.rosterSelected:""}`} role="option" aria-selected={selected===player.user_id} onClick={()=>setSelected(player.user_id)}>
            <span className={styles.avatar}>{(player.full_name||player.ign||"P").charAt(0).toUpperCase()}</span><span><strong>{player.full_name||player.ign||"Player"}</strong><small>{player.ign||"—"} · {player.status==="approved"?"অনুমোদিত":"অননুমোদিত"}</small></span>{member?.enabled&&<span className={styles.activeDot}>MOD</span>}
          </button>
        })}
      </div>
    </section>
    <section className={styles.panel}>
      <h2>২. মডারেটর ও পারমিশন সেট করুন</h2>
      {!selected?<p className={styles.hint}>বাঁ পাশ থেকে একজন প্লেয়ার নির্বাচন করুন।</p>:<>
        <div className={styles.memberHead}><strong>{chosen?.full_name||chosen?.ign||"Selected player"}</strong><label className={styles.toggle}><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Moderator Active</label></div>
        <p className={styles.hint}>নিচে যে বিভাগের Permission দেবেন, Moderator Dashboard-এ শুধু সেই কাজগুলো থাকবে। নিরাপদ Backend তৈরি নেই এমন Permission এখন বন্ধ।</p>
        <div className={styles.sectionTabs}>{MODERATOR_SECTIONS.map(item=><button key={item.id} className={section===item.id?styles.tabActive:""} type="button" onClick={()=>setSection(item.id)}>{item.label}</button>)}</div>
        <div className={styles.actionPane}><h3>{MODERATOR_SECTIONS.find(x=>x.id===section)?.label}</h3><p>{MODERATOR_SECTIONS.find(x=>x.id===section)?.description}</p><div className={styles.actions}>{MODERATOR_ACTIONS.map(action=><label key={`${section}.${action}`}><input type="checkbox" checked={allowed.some(x=>x.section===section&&x.action===action)} disabled={!enabled||!MODERATOR_SECTIONS.find(s=>s.id===section)?.actions.includes(action)} onChange={e=>toggle(section,action,e.target.checked)}/><span>{ACTION_LABELS[action]}{!MODERATOR_SECTIONS.find(s=>s.id===section)?.actions.includes(action)?" · পরে":""}</span></label>)}</div></div>
        <div className={styles.summary}><strong>অনুমতির সারাংশ</strong><p>{new Set(allowed.map(x=>x.section)).size}টি সেকশন · {allowed.length}টি কাজ</p></div>
        <div className={styles.buttons}><button disabled={saving||loading} onClick={()=>save(enabled)} className={styles.save}>{saving?"সংরক্ষণ হচ্ছে...":"পারমিশন সংরক্ষণ"}</button><button disabled={saving||loading} onClick={()=>save(false)} className={styles.revoke}>সব অ্যাক্সেস বন্ধ</button></div>
      </>}
    </section></div>
    <section className={styles.panel} style={{marginTop:22}}><div className={styles.auditHeader}><h2>মডারেটর কার্যক্রম ও অনুমতির ইতিহাস</h2><button type="button" onClick={refresh} disabled={loading}>রিফ্রেশ</button></div>
      {audit.length===0&&operationAudit.length===0?<p className={styles.hint}>এখনো কোনো কার্যক্রম নেই।</p>:<div className={styles.auditList}>
      {[
        ...audit.map(item=>({key:`a-${item.user_id}-${item.created_at}`,time:item.created_at,who:item.user_id,label:`${item.new_enabled?"অনুমতি আপডেট":"অ্যাক্সেস বন্ধ"} · ${(item.new_permissions||[]).length}টি`,type:"permission"})),
        ...operationAudit.map(item=>({key:`o-${item.record_id}-${item.created_at}`,time:item.created_at,who:item.actor_id,label:`${item.section} · ${item.action}`,type:"operation"}))
      ].sort((a,b)=>new Date(b.time)-new Date(a.time)).slice(0,30).map(item=><div className={styles.auditItem} key={item.key}><span><strong>{item.label}</strong><small>{item.who||"সিস্টেম"}</small></span><time dateTime={item.time}>{item.time?new Date(item.time).toLocaleString("bn-BD"):"—"}</time></div>)}
      </div>}
    </section>
    <p className={styles.footnote}>নিরাপত্তা: Moderator Permission আলাদা টেবিলে থাকবে, পুরোনো Global Admin/Moderator Role দেওয়া হবে না। সেকশনগুলোতে কাজ করতে Server-side Permission Enforcement সম্পূর্ণ হওয়া বাধ্যতামূলক।</p>
  </div></main>;
}
