"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {supabase} from "../../lib/supabase";
import styles from "../moderators/moderators.module.css";
export default function AdminManagement(){
 const [people,setPeople]=useState([]),[history,setHistory]=useState([]),[me,setMe]=useState(""),[search,setSearch]=useState(""),[roleFilter,setRoleFilter]=useState("all"),[selectedAdmin,setSelectedAdmin]=useState(""),[busy,setBusy]=useState(""),[loading,setLoading]=useState(true),[notice,setNotice]=useState("");
 const call=useCallback(async(method="GET",body)=>{const {data:{session}}=await supabase.auth.getSession();if(!session?.access_token)throw Error("Session expired. Sign in again.");const r=await fetch("/api/admin/admin-management",{method,cache:"no-store",headers:{Authorization:"Bearer "+session.access_token,...(body?{"Content-Type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.message||"Admin management failed");return j},[]);
 const refresh=useCallback(async()=>{setLoading(true);try{const d=await call();setPeople(d.people||[]);setHistory(d.history||[]);setMe(d.me||"");setNotice("")}catch(e){setNotice(e.message)}finally{setLoading(false)}},[call]);useEffect(()=>{refresh()},[refresh]);
 const admins=useMemo(()=>people.filter(p=>p.role==="admin"),[people]);
 const verified=useMemo(()=>people.filter(p=>p.verified).length,[people]);
 const filtered=useMemo(()=>people.filter(p=>(p.email+" "+p.display_name).toLowerCase().includes(search.toLowerCase())&&(roleFilter==="all"||p.role===roleFilter)),[people,search,roleFilter]);
 const [page,setPage]=useState(1);const pageSize=8;const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));const visible=filtered.slice((page-1)*pageSize,page*pageSize);
 useEffect(()=>setPage(1),[search,roleFilter]);
 async function change(p,makeAdmin){if(!window.confirm("Are you sure you want to "+(makeAdmin?"grant administrator access to ":"revoke administrator access from ")+p.email+"?"))return;setBusy(p.user_id);setNotice("");try{await call("POST",{userId:p.user_id,makeAdmin});setNotice("Administrator access updated successfully.");await refresh()}catch(e){setNotice(e.message)}finally{setBusy("")}}
 const initials=p=>(p.display_name||p.email||"U").trim().charAt(0).toUpperCase();
 return <main className={styles.page+" op-admin-management-page"}>
  <header className="op-am-hero"><div className="op-am-hero-copy"><span className="op-am-eyebrow">OVER POWER ESPORTS <i/> ACCESS CONTROL</span><h1>Admin <em>Management</em></h1><p>Manage administrator access, verify account status and review every role change.</p></div><div className="op-am-hero-mark" aria-hidden="true">♛</div></header>
  <section className="op-am-stats">
   <article className="op-am-stat op-am-purple"><span className="op-am-stat-icon">♙</span><div><small>Total Accounts</small><strong>{people.length}</strong></div><i/></article>
   <article className="op-am-stat op-am-green"><span className="op-am-stat-icon">✓</span><div><small>Verified Accounts</small><strong>{verified}</strong></div><i/></article>
   <article className="op-am-stat op-am-gold"><span className="op-am-stat-icon">♛</span><div><small>Administrators</small><strong>{admins.length}</strong></div><i/></article>
   <article className="op-am-stat op-am-blue"><span className="op-am-stat-icon">⌘</span><div><small>Players (Only)</small><strong>{people.length-admins.length}</strong></div><i/></article>
  </section>
  {notice&&<div className="op-am-notice" role="status">{notice}</div>}
  <div className="op-am-content-grid">
   <section className="op-am-panel op-am-directory"><div className="op-am-panel-heading"><h2><span>♧</span> Account Directory</h2><span className="op-am-count">{filtered.length} ACCOUNTS</span></div>
    <div className="op-am-toolbar"><label className="op-am-search"><span>⌕</span><input aria-label="Search accounts" placeholder="Search by email or name..." value={search} onChange={e=>setSearch(e.target.value)}/></label><select aria-label="Filter by role" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}><option value="all">All Roles</option><option value="admin">Administrators</option><option value="player">Players</option></select><button className="op-am-icon-btn" onClick={refresh} disabled={loading} aria-label="Refresh accounts">↻</button></div>
    <div className="op-am-table-wrap">{loading?<div className="op-am-empty">Loading accounts…</div>:<table className="op-am-table"><thead><tr><th>#</th><th>Account</th><th>Verified</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead><tbody>{visible.map((p,i)=><tr key={p.user_id}><td className="op-am-row-num">{(page-1)*pageSize+i+1}</td><td><div className="op-am-account"><span className="op-am-avatar">{initials(p)}</span><span><b>{p.display_name||"User"}</b><small>{p.email}</small></span></div></td><td>{p.verified?<span className="op-am-verified">● Yes</span>:<span className="op-am-unverified">● No</span>}</td><td><span className={"op-am-role "+(p.role==="admin"?"is-admin":"")}>{p.role==="admin"?"♛ Admin":"⌘ Player"}</span></td><td>{p.created_at?new Date(p.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td><td>{p.user_id===me?<span className="op-am-you">YOU</span>:p.role==="admin"?<button className="op-am-revoke" disabled={!!busy} onClick={()=>change(p,false)}>{busy===p.user_id?"Saving…":"Revoke"}</button>:<button className="op-am-grant" disabled={!!busy||!p.verified} title={!p.verified?"Email verification required":""} onClick={()=>change(p,true)}>{busy===p.user_id?"Saving…":"♛ Make Admin"}</button>}</td></tr>)}</tbody></table>}</div>
    {!loading&&<div className="op-am-pagination"><span>Showing {filtered.length?((page-1)*pageSize+1):0}–{Math.min(page*pageSize,filtered.length)} of {filtered.length}</span><div><button disabled={page<=1} onClick={()=>setPage(x=>x-1)}>‹</button><b>{page} / {pageCount}</b><button disabled={page>=pageCount} onClick={()=>setPage(x=>x+1)}>›</button></div></div>}
   </section>
   <aside className="op-am-side">
    <section className="op-am-panel op-am-access"><h2><span>⬡</span> Access Control</h2><p>Select an administrator to review their current account status.</p><select value={selectedAdmin} onChange={e=>setSelectedAdmin(e.target.value)}><option value="">Select an administrator</option>{admins.map(a=><option key={a.user_id} value={a.user_id}>{a.email}</option>)}</select>
     {selectedAdmin?<div className="op-am-selected"><span className="op-am-avatar">{initials(admins.find(a=>a.user_id===selectedAdmin)||{})}</span><div><b>{admins.find(a=>a.user_id===selectedAdmin)?.display_name||"Administrator"}</b><small>{admins.find(a=>a.user_id===selectedAdmin)?.email}</small></div><span className="op-am-verified">● ACTIVE</span></div>:<div className="op-am-access-note"><span>♛</span><b>Administrator access</b><small>Only verified accounts can be promoted. Role changes are protected and recorded.</small></div>}
    </section>
    <section className="op-am-panel op-am-history"><h2><span>◷</span> Recent Access Changes</h2>{!history.length?<div className="op-am-no-history">No access changes recorded yet.</div>:history.slice(0,8).map((h,i)=><div className="op-am-history-item" key={i}><span className={"op-am-history-icon "+(h.new_role==="admin"?"granted":"revoked")}>{h.new_role==="admin"?"＋":"－"}</span><div><b>{h.new_role==="admin"?"Admin Granted":"Admin Revoked"}</b><small>{people.find(p=>p.user_id===h.target_user_id)?.email||"Account"}</small><time>{new Date(h.changed_at).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</time></div></div>)}</section>
   </aside>
  </div>
 </main>
}
