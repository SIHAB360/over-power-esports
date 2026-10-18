"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiLock, FiUnlock, FiShield, FiRefreshCw, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import styles from "./WithdrawalAccessPanel.module.css";

const readableDate = (value) => {
  if (!value) return "Never";
  const v = new Date(value);
  return Number.isNaN(v.getTime()) ? "Unknown" : v.toLocaleString("en-BD",{
    day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",
  });
};

export default function WithdrawalAccessPanel() {
  const [players,setPlayers] = useState([]);
  const [audit,setAudit] = useState([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  const [selection,setSelection] = useState(null);
  const [reason,setReason] = useState("");
  const seq=useRef(0);

  const token = useCallback(async () => {
    const { data:{ session },error:authError } = await supabase.auth.getSession();
    if(authError || !session?.access_token) throw new Error("Admin session expired. Sign in again.");
    return session.access_token;
  },[]);

  const refresh = useCallback(async () => {
    const current=++seq.current;
    setLoading(true);setError("");
    try{
      const key=await token();
      const res=await fetch("/api/admin/withdrawals/access",{
        cache:"no-store",headers:{Authorization:"Bearer "+key},
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data.message || "Could not read player withdrawal permissions.");
      if(current !== seq.current) return;
      setPlayers(Array.isArray(data.players)?data.players:[]);
      setAudit(Array.isArray(data.audit)?data.audit:[]);
    }catch(e){
      if(current!==seq.current)return;
      setError(e.message||"Unable to load permissions.");
    }finally{
      if(current===seq.current)setLoading(false);
    }
  },[token]);

  useEffect(()=>{refresh();return()=>{seq.current++;};},[refresh]);

  const choose=(player)=>{
    if(saving)return;
    setError("");setSuccess("");setReason("");
    setSelection({playerId:player.playerId,name:player.name,enabled:!player.enabled});
  };

  async function confirm(){
    if(!selection || saving)return;
    setSaving(true);setError("");setSuccess("");
    try{
      const key=await token();
      const res=await fetch("/api/admin/withdrawals/access",{
        method:"POST",
        cache:"no-store",
        headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},
        body:JSON.stringify({
          playerId:selection.playerId,
          enabled:selection.enabled,
          reason:reason.trim()||null,
        }),
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.message||"Access update failed.");
      setSuccess(selection.name+" — withdrawal "+(selection.enabled?"ENABLED":"DISABLED")+".");
      setSelection(null);setReason("");
      await refresh();
    }catch(e){setError(e.message||"Unable to update withdrawal access.");}
    finally{setSaving(false);}
  }

  return(
    <section className={styles.shell} aria-label="Admin player withdrawal access control">
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}><FiShield aria-hidden="true"/> FINANCIAL SECURITY / ADMIN-ONLY ACCESS</div>
          <h3>Player <span>Withdrawal Access</span></h3>
          <p>প্রত্যেক Player-এর Withdrawal Request চালু বা বন্ধ করুন। Admin ON না করা পর্যন্ত নতুন Request পাঠানো যাবে না।</p>
        </div>
        <button type="button" className={styles.refresh} onClick={refresh} disabled={loading||saving} aria-label="Refresh player withdrawal access">
          <FiRefreshCw aria-hidden="true"/>{loading?"Loading…":"Refresh Access"}
        </button>
      </header>
      <div className={styles.notice}>
        <FiLock aria-hidden="true"/>
        <span><strong>Default OFF.</strong> ON থাকলে Player Available Balance অনুযায়ী Request পাঠাতে পারবে। OFF করলে নতুন Request বন্ধ হবে; পুরোনো Request বা Earnings মুছে যাবে না।</span>
      </div>
      {error && <div role="alert" className={styles.error}><FiAlertTriangle aria-hidden="true"/>{error}</div>}
      {success && <div role="status" className={styles.success}><FiCheckCircle aria-hidden="true"/>{success}</div>}
      {loading ? <p className={styles.empty} role="status">Loading secured player access…</p>
      : players.length===0 ? <p className={styles.empty}>No players available.</p>
      : <div className={styles.grid}>
          {players.map(player=>(
            <div className={styles.player} key={player.playerId}>
              <div className={styles.playerDetail}>
                <strong>{player.name}</strong>
                <small>{player.playerStatus==="approved"?"Approved player":player.playerStatus||"Player"} · Last change: {readableDate(player.updatedAt)}</small>
              </div>
              <span className={[styles.status,player.enabled?styles.on:styles.off].join(" ")}>
                {player.enabled?<FiUnlock aria-hidden="true"/>:<FiLock aria-hidden="true"/>}
                {player.enabled?"ON / ALLOWED":"OFF / LOCKED"}
              </span>
              <button type="button" role="switch" aria-label={"Withdrawal permission for "+player.name}
                aria-checked={player.enabled} disabled={loading||saving}
                className={[styles.toggle,player.enabled?styles.active:""].join(" ")}
                onClick={()=>choose(player)}>
                <span aria-hidden="true"/>
              </button>
            </div>
          ))}
        </div>}
      {selection && <div className={styles.confirm} role="group" aria-label="Confirm withdrawal access change">
        <div>
          <strong>{selection.enabled?"Enable":"Disable"} withdrawals for {selection.name}?</strong>
          <p>{selection.enabled
            ?"This allows new withdrawal requests until you switch it OFF."
            :"New requests will be blocked immediately. Existing requests remain unchanged."}</p>
        </div>
        <label>Security note (optional, max 250 characters)
          <textarea rows={2} maxLength={250} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason for the change"/>
        </label>
        <div className={styles.actions}>
          <button type="button" onClick={()=>setSelection(null)} disabled={saving}>Cancel</button>
          <button type="button" className={selection.enabled?styles.allowBtn:styles.blockBtn} disabled={saving} onClick={confirm}>
            {saving?"Saving…":selection.enabled?"Confirm Enable":"Confirm Disable"}
          </button>
        </div>
      </div>}
      {audit.length>0 && <div className={styles.audit}>
        <h4>RECENT SECURITY CHANGES</h4>
        {audit.slice(0,6).map((event,i)=>{
          const player=players.find(x=>x.playerId===event.player_id);
          return <div key={event.player_id+"-"+event.created_at+"-"+i} className={styles.auditRow}>
            <span>{player?.name||"Player"} → <b>{event.enabled?"ENABLED":"DISABLED"}</b></span>
            <time>{readableDate(event.created_at)}</time>
          </div>;
        })}
      </div>}
    </section>
  );
}
