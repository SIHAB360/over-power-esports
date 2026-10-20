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
    if(!session?.access_token)throw Error("Your session has expired. Please sign in again.");
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
    if(!active&&!window.confirm("Revoke all access for this moderator?"))return;
    if(chosen?.status!=="approved"&&active){setNotice("Only approved players can be moderators.");return;}
    setSaving(true);try{
      const payload={userId:selected,enabled:active,grants:active?normalizeModeratorGrants(allowed):empty};
      await call("POST",payload);await refresh();setNotice(active?"Moderator permissions saved successfully.":"Moderator access has been revoked.");
    }catch(e){setNotice(e.message)}finally{setSaving(false)}
  }
  return <main data-op-moderators-page className={styles.page}><div data-op-moderators-wrap className={styles.wrap}>
    <header data-op-moderators-header className={styles.header}><Link href="/admin/dashboard">← Admin Dashboard</Link><span className={styles.eyebrow}>OVER POWER ESPORTS  /  ADMIN CONSOLE</span></header>
    <div data-op-moderators-heading className={styles.heading}><div><span className={styles.kicker}>Access Control Center</span><h1>Moderator Management</h1><p>Assign trusted players and manage their section-level permissions. · অনুমতি আপনি নিয়ন্ত্রণ করবেন।</p></div><span className={styles.shield}>✧</span></div>
    <div className={styles.metrics}><div><strong>{players.length}</strong><small>Registered Players</small></div><div><strong>{moderators.filter(x=>x.enabled).length}</strong><small>Active Moderators</small></div><div><strong>{grants.length}</strong><small>Permission Grants</small></div></div>
    {notice&&<p role="status" className={styles.notice}>{notice}</p>}
    <div className={styles.layout}><section data-op-moderators-panel className={styles.panel}>
      <h2><span className={styles.step}>01</span>Select Player</h2><input className={styles.input} aria-label="Search players" placeholder="Search name or IGN..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className={styles.roster} role="listbox" aria-label="Player selection for moderator role">
        {loading?<p>Loading...</p>:filtered.length===0?<p>No matching players found.</p>:filtered.map(player=>{
          const member=moderators.find(m=>m.user_id===player.user_id);return <button key={player.user_id} className={`${styles.rosterEntry} ${selected===player.user_id?styles.rosterSelected:""}`} role="option" aria-selected={selected===player.user_id} type="button" onClick={()=>setSelected(player.user_id)}>
            <span className={styles.avatar}>{(player.full_name||player.ign||"P").charAt(0).toUpperCase()}</span><span><strong>{player.full_name||player.ign||"Player"}</strong><small>{player.ign||"—"} · {player.status==="approved"?"Approved":"Not approved"}</small></span>{member?.enabled&&<span className={styles.activeDot}>ACTIVE</span>}
          </button>
        })}
      </div>
    </section>
    <section data-op-moderators-panel className={styles.panel}>
      <h2><span className={styles.step}>02</span>Configure Permissions</h2>
      {!selected?<p className={styles.hint}>Select a player to configure moderator access.</p>:<>
        <div className={styles.memberHead}><strong>{chosen?.full_name||chosen?.ign||"Selected player"}</strong><label className={styles.toggle}><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Moderator Active</label></div>
        <p className={styles.hint}>Only approved permissions appear on the Moderator Dashboard. Unavailable actions remain locked until securely supported.</p>
        <div className={styles.sectionTabs}>{MODERATOR_SECTIONS.map(item=><button key={item.id} className={section===item.id?styles.tabActive:""} type="button" onClick={()=>setSection(item.id)}>{item.label}</button>)}</div>
        <div className={styles.actionPane}><h3>{MODERATOR_SECTIONS.find(x=>x.id===section)?.label}</h3><p>{MODERATOR_SECTIONS.find(x=>x.id===section)?.description}</p><div className={styles.actions}>{MODERATOR_ACTIONS.map(action=><label key={`${section}.${action}`}><input type="checkbox" checked={allowed.some(x=>x.section===section&&x.action===action)} disabled={!enabled||!MODERATOR_SECTIONS.find(s=>s.id===section)?.actions.includes(action)} onChange={e=>toggle(section,action,e.target.checked)}/><span>{section==="withdrawals"&&action==="edit"?"Mark Paid":section==="withdrawals"&&action==="approve"?"Review / Approve":section==="achievements"&&action==="approve"?"Publish":section==="players"&&action==="approve"?"Approve Player":section==="tournaments"&&action==="approve"?"Finance Approval":section==="matches"&&action==="approve"?"Results & Finance":ACTION_LABELS[action]}{!MODERATOR_SECTIONS.find(s=>s.id===section)?.actions.includes(action)?" · Locked":""}</span></label>)}</div></div>
        <div className={styles.summary}><strong>Permission Summary</strong><p>{new Set(allowed.map(x=>x.section)).size} sections · {allowed.length} actions</p></div>
        <div className={styles.buttons}><button disabled={saving||loading} onClick={()=>save(enabled)} className={styles.save}>{saving?"Saving...":"Save Permissions"}</button><button disabled={saving||loading} onClick={()=>save(false)} className={styles.revoke}>Revoke Access</button></div>
      </>}
    </section></div>
    <section className={`${styles.panel} ${styles.auditPanel}`}><div className={styles.auditHeader}><h2>Permission & Activity History</h2><button type="button" onClick={refresh} disabled={loading}>Refresh</button></div>
      {audit.length===0&&operationAudit.length===0?<p className={styles.hint}>No permission changes or moderator activity yet.</p>:<div className={styles.auditList}>
      {[
        ...audit.map(item=>({key:`a-${item.user_id}-${item.created_at}`,time:item.created_at,who:item.user_id,label:`${item.new_enabled?"Permissions updated":"Access revoked"} · ${(item.new_permissions||[]).length} grants`,type:"permission"})),
        ...operationAudit.map(item=>({key:`o-${item.record_id}-${item.created_at}`,time:item.created_at,who:item.actor_id,label:`${item.section} · ${item.action}`,type:"operation"}))
      ].sort((a,b)=>new Date(b.time)-new Date(a.time)).slice(0,30).map(item=><div className={styles.auditItem} key={item.key}><span><strong>{item.label}</strong><small>{item.who||"System"}</small></span><time dateTime={item.time}>{item.time?new Date(item.time).toLocaleString("en-BD"):"—"}</time></div>)}
      </div>}
    </section>
    <p className={styles.footnote}>Security: Moderator permissions are scoped and audited. No global admin privileges are assigned. All actions are verified server-side.</p>
  </div></main>;
}
