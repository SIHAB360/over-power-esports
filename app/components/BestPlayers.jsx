"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import BestPlayerCard from "./BestPlayerCard";
import styles from "./Champions.module.css";

const REFRESH_INTERVAL = 30000;

export default function BestPlayers() {
  const [bestPlayers, setBestPlayers] = useState([]);
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let disposed = false;
    let runningController = null;

    async function loadBestPlayers() {
      if (disposed) return;
      runningController?.abort();
      const controller = new AbortController();
      runningController = controller;

      try {
        const response = await fetch("/api/champions?period=" + period, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Champion rankings could not be loaded.");
        const result = await response.json();

        if (disposed || controller.signal.aborted) return;
        setBestPlayers(Array.isArray(result.champions) ? result.champions : []);
        setUpdatedAt(result.updatedAt || null);
        setError("");
      } catch (err) {
        if (disposed || controller.signal.aborted) return;
        setError("Live rankings are temporarily unavailable. Retrying automatically.");
      } finally {
        if (!disposed && !controller.signal.aborted) setLoading(false);
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") loadBestPlayers();
    }

    loadBestPlayers();

    // Automatic fallback even if database Realtime publication is disabled.
    const timer = window.setInterval(refreshWhenVisible, REFRESH_INTERVAL);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", loadBestPlayers);

    // Refresh immediately for completed-match changes when Realtime is enabled.
    // The periodic timer above is the reliable fallback for every visitor.
    const channel = supabase
      .channel("hall-of-champions-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "match_player_stats" }, refreshWhenVisible)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, refreshWhenVisible)
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, refreshWhenVisible)
      .subscribe();

    return () => {
      disposed = true;
      runningController?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", loadBestPlayers);
      supabase.removeChannel(channel);
    };
  }, [period]);

  if (!loading && !error && !bestPlayers.some(item=>item.bestPlayer)) return null;

  return (
    <section className={styles.showcase} aria-labelledby="hall-of-champions-title">
      <div className={styles.heading}>
        <p className={styles.headingEyebrow}>
          <span className={styles.crown} aria-hidden="true">♛</span>
          OVER POWER ESPORTS
        </p>
        <h2 id="hall-of-champions-title" className={styles.title}>
          HALL OF CHAMPIONS
        </h2>
        <p className={styles.description}>
          Auto-ranked from completed matches · Kills 50% · Assists 30% · Damage 20%
        </p>
        <div className={styles.periodTabs} role="group" aria-label="Champion ranking time period">
          {["weekly","monthly","yearly"].map(option=><button key={option} type="button" aria-pressed={period===option} className={period===option?styles.periodActive:styles.periodButton} onClick={()=>{if(period!==option){setLoading(true);setBestPlayers([]);setPeriod(option)}}}>{option.toUpperCase()}</button>)}
        </div>
        <div className={styles.divider} aria-hidden="true" />
      </div>

      {error && <p className={styles.notice} role="status">{error}</p>}

      {loading && (
        <div className={styles.pendingLoad} role="status" aria-live="polite">
          Calculating champions from recorded match results…
        </div>
      )}

      {bestPlayers.length > 0 && (
        <div className={styles.grid}>
          {bestPlayers.filter(item=>item.bestPlayer).map((item,index)=>(
            <BestPlayerCard key={item.team.id} data={item} index={index}/>
          ))}
        </div>
      )}
      {updatedAt && bestPlayers.some(item=>item.bestPlayer) && (
        <p className={styles.liveNote} role="status">
          <span aria-hidden="true" className={styles.liveDot} />
          {period.charAt(0).toUpperCase()+period.slice(1)} rankings · Completed matches only · Refreshes automatically
        </p>
      )}
    </section>
  );
}
