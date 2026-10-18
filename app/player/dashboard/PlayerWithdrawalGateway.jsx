"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";
import PlayerWithdrawal from "./PlayerWithdrawal";
import styles from "./PlayerWithdrawalGateway.module.css";

export default function PlayerWithdrawalGateway() {
  const [allowed,setAllowed] = useState(false);
  const [loading,setLoading] = useState(true);
  const [open,setOpen] = useState(false);
  const [error,setError] = useState("");
  const [balance,setBalance] = useState(null);
  const closeRef=useRef(null);
  const mounted=useRef(true);

  const checkAccess=useCallback(async()=>{
    setLoading(true);
    try{
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.access_token)throw new Error("Please sign in.");
      const res=await fetch("/api/player/wallet",{
        cache:"no-store",headers:{Authorization:"Bearer "+session.access_token},
      });
      const body=await res.json().catch(()=>({}));
      if(!res.ok||!body.wallet)throw new Error(body.message||"Unable to verify access.");
      if(!mounted.current)return false;
      const enabled=body.withdrawalAccess?.enabled===true;
      setAllowed(enabled);
      setBalance(Number(body.wallet.available_balance||0));
      setError("");
      return enabled;
    }catch(e){
      if(mounted.current){setAllowed(false);setError(e.message||"Access verification unavailable.");}
      return false;
    }finally{if(mounted.current)setLoading(false);}
  },[]);

  useEffect(()=>{
    mounted.current=true;
    checkAccess();
    const refresh=()=>{if(document.visibilityState==="visible")checkAccess();};
    document.addEventListener("visibilitychange",refresh);
    return()=>{mounted.current=false;document.removeEventListener("visibilitychange",refresh);};
  },[checkAccess]);

  useEffect(()=>{
    if(!open)return;
    const old=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const key=e=>{if(e.key==="Escape")setOpen(false);};
    document.addEventListener("keydown",key);
    closeRef.current?.focus();
    return()=>{document.body.style.overflow=old;document.removeEventListener("keydown",key);};
  },[open]);

  const unlockAndOpen=async()=>{
    if(loading||!allowed)return;
    const stillAllowed=await checkAccess();
    if(stillAllowed)setOpen(true);
  };

  return (
    <>
      <section className={styles.entry} aria-label="Player Withdrawal Gateway">
        <div className={styles.copy}>
          <span className={styles.eyebrow}>OP ESPORTS / SECURE WALLET</span>
          <strong>আপনার উপার্জন, আপনার ওয়ালেট</strong>
          <p>{allowed
            ?"Admin আপনার Withdrawal Access চালু রেখেছে। বিকাশ/নগদ অনুরোধ পাঠাতে পারেন।"
            :"Withdraw Request বন্ধ রয়েছে। Admin চালু করলে উত্তোলনের অনুরোধ পাঠানো যাবে।"}</p>
          <span className={[styles.access,allowed?styles.unlocked:styles.locked].join(" ")}>
            {loading?"ACCESS CHECKING…":allowed?"● WITHDRAWAL ACCESS ON":"● ADMIN WITHDRAWAL LOCKED"}
          </span>
          {balance!==null && <span className={styles.balance}>Available: ৳{balance.toFixed(2)}</span>}
          {error && <span className={styles.error} role="status">{error}</span>}
        </div>
        <div className={styles.actions}>
          <button type="button" className={[styles.cta,allowed?styles.glow:styles.disabled].join(" ")}
            onClick={unlockAndOpen} disabled={!allowed||loading}>
            <span aria-hidden="true">৳</span>
            {loading?"CHECKING ACCESS…":allowed?"উইথড্রো করুন →":"উইথড্রো লক করা আছে"}
          </button>
          <button type="button" className={styles.historyBtn} onClick={()=>setOpen(true)}>
            ওয়ালেট ও ইতিহাস দেখুন
          </button>
        </div>
      </section>
      {open && typeof document!=="undefined" && createPortal(
        <div className={styles.backdrop} onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="OP ESPORTS Withdrawal Gateway">
            <div className={styles.banner}>
              <div>
                <span>OP ESPORTS · SECURE WALLET</span>
                <strong>উইথড্রো অনুরোধ</strong>
                <small>বিকাশ / নগদ • পার্সোনাল অ্যাকাউন্ট</small>
              </div>
              <button ref={closeRef} className={styles.close} type="button" aria-label="Close withdrawal gateway" onClick={()=>{setOpen(false);checkAccess();}}>✕</button>
            </div>
            <div className={styles.content}>
              <div className={styles.disclaimer}>এটি OVER POWER ESPORTS-এর Withdrawal Request সিস্টেম। এটি bKash/Nagad-এর অফিসিয়াল পেমেন্ট পেজ নয়। কোনো PIN বা OTP দেবেন না।</div>
              <PlayerWithdrawal gateway />
            </div>
          </div>
        </div>,document.body
      )}
    </>
  );
}
