"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import PlayerWithdrawal from "../dashboard/PlayerWithdrawal";
import styles from "./withdrawal-page.module.css";

export default function WithdrawalPage() {
  const router = useRouter();
  const [access, setAccess] = useState("checking");
  useEffect(() => {
    let active = true;
    async function verify() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data?.user) { router.replace("/login"); return; }
      const { data: player, error: playerError } = await supabase.from("players")
        .select("id").eq("user_id", data.user.id).eq("status", "approved").maybeSingle();
      if (!active) return;
      setAccess(playerError || !player?.id ? "denied" : "allowed");
    }
    verify();
    return () => { active = false; };
  }, [router]);

  if (access === "checking") return <main className={styles.page}><div className={styles.state} role="status">ওয়ালেট যাচাই হচ্ছে...</div></main>;
  if (access === "denied") return <main className={styles.page}><div className={styles.state}><h1>ওয়ালেট ব্যবহার করা যাচ্ছে না</h1><p>এই পেজটি অনুমোদিত প্লেয়ারদের জন্য।</p><button onClick={() => router.push("/player/dashboard")}>ড্যাশবোর্ডে ফিরে যান</button></div></main>;

  return <main className={styles.page}>
    <div className={styles.wrap}>
      <header className={styles.topbar}>
        <button type="button" className={styles.back} onClick={() => router.push("/player/dashboard")}>← ড্যাশবোর্ডে ফিরে যান</button>
        <span className={styles.brand}>OVER POWER ESPORTS</span>
      </header>
      <PlayerWithdrawal />
    </div>
  </main>;
}
