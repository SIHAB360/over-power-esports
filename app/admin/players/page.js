"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useMemo, useState } from "react";
import styles from "./players.module.css";

export default function PlayersPage({moderatorMode=false}={}) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvingId, setApprovingId] = useState("");
  const [notice, setNotice] = useState("");
  const [moderatorRights,setModeratorRights]=useState([]);
  const canApprove=!moderatorMode||moderatorRights.some(p=>p.section==="players"&&p.action==="approve");

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.assign("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if(moderatorMode){
        const {data:{session}}=await supabase.auth.getSession();
        if(!session?.access_token){window.location.assign('/login');return;}
        const res=await fetch('/api/moderator/me',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store'});
        if(!res.ok){setNotice('Moderator access disabled.');setLoading(false);return;}
        const out=await res.json();
        if(!out.permissions?.some(p=>p.section==='players'&&p.action==='view')){
         setNotice('Players View permission required.');setLoading(false);return;
        }
        setModeratorRights(out.permissions);
      }else if(profileError||profile?.role?.toLowerCase()!=='admin'){
        window.location.assign('/login');return;
      }

      if (active) await fetchPlayers();
    };

    initialize();

    return () => {
      active = false;
    };
  }, [moderatorMode]);

  const fetchPlayers = async () => {
    setNotice("");
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setNotice("Players could not be loaded. Please refresh and try again.");
    } else {
      setPlayers(data || []);
    }
    setLoading(false);
  };

  const approvePlayer = async (id) => {
    setApprovingId(id);
    setNotice("");

    if(!canApprove){setNotice('Players Approve permission required.');setApprovingId('');return;}
    let error;
    if(moderatorMode){
      const {data:{session}}=await supabase.auth.getSession();
      const response=await fetch('/api/moderator/operations',{method:'POST',
        headers:{Authorization:`Bearer ${session?.access_token||''}`,'Content-Type':'application/json'},
        body:JSON.stringify({section:'players',action:'approve',id,data:{}})});
      const result=await response.json().catch(()=>({}));
      error=response.ok?null:new Error(result.message||'Approval denied');
    }else{
      ({error}=await supabase.from('players').update({status:'approved'}).eq('id',id));
    }

    if (error) {
      setNotice("This player could not be approved. Please try again.");
    } else {
      setPlayers((current) =>
        current.map((player) => player.id === id ? { ...player, status: "approved" } : player)
      );
    }

    setApprovingId("");
  };

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return players.filter((player) => {
      const status = String(player.status || "pending").toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const searchable = [
        player.full_name,
        player.ign,
        player.email,
        player.team_name,
        player.freefire_uid,
        player.primary_role,
        player.id
      ].filter(Boolean).join(" ").toLowerCase();

      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [players, search, statusFilter]);

  const approvedCount = players.filter((player) => String(player.status || "pending").toLowerCase() === "approved").length;
  const pendingCount = players.length - approvedCount;

  if (loading) {
    return (
      <main className={styles.loading}>
        <div className={styles.spinner} />
        LOADING PLAYER MANAGEMENT
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <div className={styles.eyebrow}><span className={styles.dot} /> OVER POWER ESPORTS · ADMIN</div>
          <h1 className={styles.title}>PLAYER <span className={styles.titleAccent}>MANAGEMENT</span></h1>
          <p className={styles.subtitle}>Review registrations, player details, teams and approval status from one place.</p>
        </div>

        <div className={styles.headerStat}>
          <div className={styles.statIcon}>♙</div>
          <div>
            <span className={styles.statLabel}>REGISTERED PLAYERS</span>
            <strong className={styles.statValue}>{players.length.toLocaleString()}</strong>
          </div>
        </div>
      </header>

      <section className={styles.toolbar} aria-label="Search and filter players">
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            className={styles.search}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, IGN, email, UID or team…"
            aria-label="Search players"
          />
        </div>

        <div className={styles.filters} aria-label="Filter by player status">
          {[
            { value: "all", label: `All · ${players.length}` },
            { value: "approved", label: `Approved · ${approvedCount}` },
            { value: "pending", label: `Pending · ${pendingCount}` }
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={[styles.filter, statusFilter === item.value ? styles.filterActive : ""].join(" ")}
              onClick={() => setStatusFilter(item.value)}
              aria-pressed={statusFilter === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {notice && <p className={styles.error} role="alert">{notice}</p>}

      <div className={styles.results}>
        <span>Showing <strong>{filteredPlayers.length}</strong> of <strong>{players.length}</strong> players</span>
        <span>Latest registrations first</span>
      </div>

      <section className={styles.grid} aria-label="Registered players">
        {filteredPlayers.map((player) => {
          const status = String(player.status || "pending").toLowerCase();
          const isApproved = status === "approved";

          return (
            <article className={styles.card} key={player.id}>
              <div className={styles.cardTop}>
                <div className={styles.profile}>
                  <div className={styles.avatar}>
                    {(player.profile_image || player.avatar_url) ? (
                      <img src={player.profile_image || player.avatar_url} alt="" />
                    ) : (
                      (player.ign || player.full_name || "P").trim().charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 className={styles.playerName}>{player.ign || player.full_name || "Unnamed Player"}</h2>
                    <p className={styles.ign}>{player.full_name || "Name not provided"}</p>
                    <span className={styles.playerId}>PLAYER ID · {String(player.id).slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                <span className={[styles.status, isApproved ? styles.approved : ""].join(" ")}>
                  <span className={styles.statusDot} />
                  {status}
                </span>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>EMAIL ADDRESS</span>
                  <span className={styles.infoValue}>{player.email || "Not provided"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>FREE FIRE UID</span>
                  <span className={styles.infoValue}>{player.freefire_uid || "Not provided"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>TEAM</span>
                  <span className={[styles.infoValue, styles.teamValue].join(" ")}>{player.team_name || "No team assigned"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>PRIMARY ROLE</span>
                  <span className={[styles.infoValue, styles.roleValue].join(" ")}>{player.primary_role || player.position || "Not assigned"}</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => window.location.assign(moderatorMode?`/moderator/players/${encodeURIComponent(player.id)}`:`/admin/players/${encodeURIComponent(player.id)}`)}
                >
                  VIEW PROFILE <span aria-hidden="true">↗</span>
                </button>

                {!moderatorMode&&<button
                  type="button"
                  className={[styles.button, styles.dashboardButton].join(" ")}
                  onClick={() => window.location.assign(`/player/dashboard?adminPlayerId=${encodeURIComponent(player.id)}`)}
                  aria-label={`Open read-only dashboard for ${player.ign || player.full_name || "player"}`}
                >
                  DASHBOARD <span aria-hidden="true">▦</span>
                </button>}

                {!isApproved && canApprove && (
                  <button
                    type="button"
                    className={[styles.button, styles.approveButton].join(" ")}
                    onClick={() => approvePlayer(player.id)}
                    disabled={approvingId === player.id}
                  >
                    {approvingId === player.id ? "APPROVING…" : "✓ APPROVE"}
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {filteredPlayers.length === 0 && (
          <div className={styles.empty}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⌕</div>
            <strong>No players found</strong>
            <p>Try a different search term or change the status filter.</p>
          </div>
        )}
      </section>
    </main>
  );
}
