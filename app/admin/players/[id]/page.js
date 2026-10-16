"use client";

import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const emptyMetrics = {
  matches: 0,
  wins: 0,
  kills: 0,
  assists: 0,
  damage: 0,
  mvp: 0,
  earnings: 0,
};

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [player, setPlayer] = useState(null);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!id) return;

      setLoading(true);
      setLoadError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: adminProfile, error: roleError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (roleError || adminProfile?.role?.toLowerCase() !== "admin") {
          router.replace("/login");
          return;
        }

        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("*")
          .eq("id", id)
          .single();

        if (playerError || !playerData) {
          if (!cancelled) {
            setLoadError("This player profile could not be found.");
            setPlayer(null);
          }
          return;
        }

        const [
          { data: statsData },
          { data: earningsData },
        ] = await Promise.all([
          supabase
            .from("match_player_stats")
            .select("kills, assists, damage, mvp, placement")
            .eq("player_id", playerData.id),
          supabase
            .from("player_earnings")
            .select("amount")
            .eq("player_id", playerData.id),
        ]);

        const stats = statsData || [];
        const earnings = earningsData || [];

        if (!cancelled) {
          setPlayer(playerData);
          setMetrics({
            matches: stats.length,
            wins: stats.filter((item) => Number(item.placement) === 1).length,
            kills: stats.reduce((sum, item) => sum + Number(item.kills || 0), 0),
            assists: stats.reduce((sum, item) => sum + Number(item.assists || 0), 0),
            damage: stats.reduce((sum, item) => sum + Number(item.damage || 0), 0),
            mvp: stats.filter((item) => item.mvp === true).length,
            earnings: earnings.reduce((sum, item) => sum + Number(item.amount || 0), 0),
          });
        }
      } catch (error) {
        console.error("ADMIN PLAYER PROFILE LOAD ERROR:", error);
        if (!cancelled) {
          setLoadError("Something went wrong while loading this player.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const value = (item) => {
    if (item === null || item === undefined || String(item).trim() === "") return "Not provided";
    return String(item);
  };

  const formatNumber = (number) =>
    Number(number || 0).toLocaleString("en-BD", {
      maximumFractionDigits: 2,
    });

  const formatDate = (date) => {
    if (!date) return "Not provided";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const socialLinks = [
    { label: "Facebook", href: player?.facebook_link, icon: "f" },
    { label: "Instagram", href: player?.instagram_link, icon: "◎" },
    { label: "YouTube", href: player?.youtube_link, icon: "▶" },
    { label: "TikTok", href: player?.tiktok_link, icon: "♪" },
  ].filter((item) => item.href);

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loader" />
        <p>LOADING PLAYER PROFILE</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            background: #080b14;
            color: #dce5ff;
            font: 800 11px/1.5 Inter, system-ui, sans-serif;
            letter-spacing: .2em;
          }
          .loader {
            width: 42px;
            height: 42px;
            border: 3px solid rgba(106, 145, 255, .18);
            border-top-color: #6a91ff;
            border-radius: 50%;
            animation: spin .8s linear infinite;
          }
          p { margin: 0; color: #aab9e2; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) { .loader { animation: none; } }
        `}</style>
      </main>
    );
  }

  if (loadError || !player) {
    return (
      <main className="error-screen">
        <div className="error-icon">!</div>
        <h1>PLAYER PROFILE UNAVAILABLE</h1>
        <p>{loadError || "The requested player profile was not found."}</p>
        <button type="button" onClick={() => router.push("/admin/players")}>
          ← BACK TO PLAYERS
        </button>
        <style jsx>{`
          .error-screen {
            min-height: 100vh;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: #080b14;
            color: #f4f6ff;
            font-family: Inter, system-ui, sans-serif;
          }
          .error-icon {
            display: grid;
            place-items: center;
            width: 54px;
            height: 54px;
            border-radius: 18px;
            background: rgba(255, 84, 119, .12);
            border: 1px solid rgba(255, 84, 119, .35);
            color: #ff7894;
            font-size: 25px;
            font-weight: 900;
          }
          h1 { margin: 20px 0 8px; font-size: clamp(19px, 4vw, 26px); }
          p { max-width: 430px; color: #9ba8c7; line-height: 1.6; }
          button {
            margin-top: 15px;
            min-height: 44px;
            padding: 0 17px;
            border: 1px solid rgba(106, 145, 255, .4);
            border-radius: 12px;
            background: rgba(106, 145, 255, .12);
            color: #dce5ff;
            font-weight: 850;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  const avatar = player.profile_image || player.avatar_url;
  const status = String(player.status || "pending").toLowerCase();
  const displayName = player.ign || player.full_name || "Player";
  const initial = String(displayName).trim().charAt(0).toUpperCase() || "P";

  return (
    <main className="admin-player-record-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="container">
        <header className="topbar">
          <button
            type="button"
            className="back-button"
            onClick={() => router.push("/admin/players")}
          >
            <span aria-hidden="true">←</span> ALL PLAYERS
          </button>
          <div className="admin-label"><span className="live-dot" /> ADMIN VIEW · PLAYER RECORD</div>
        </header>

        <section className="admin-record-hero">
          <div className="avatar-shell">
            {avatar ? (
              <img src={avatar} alt={displayName} />
            ) : (
              <div className="avatar-fallback">{initial}</div>
            )}
            <span className="avatar-status" />
          </div>

          <div className="hero-content">
            <p className="brand-label">OVER POWER ESPORTS</p>
            <h1>{displayName}</h1>
            <p className="full-name">{player.full_name || "Player name not provided"}</p>
            <div className="meta-row">
              <span className="meta-chip role-chip">◈ {player.primary_role || "Role not assigned"}</span>
              <span className="meta-chip team-chip">♜ {player.team_name || "No team assigned"}</span>
            </div>
          </div>

          <div className="hero-status">
            <span className="status-caption">REGISTRATION STATUS</span>
            <span className={`status-badge ${status === "approved" ? "approved" : "pending"}`}>
              <span className="status-dot" /> {status}
            </span>
            <span className="record-caption">ID · {String(player.id).slice(0, 8).toUpperCase()}</span>
          </div>
        </section>

        <section className="stats-grid" aria-label="Player career summary">
          <article className="stat-card stat-blue">
            <span className="stat-icon">⚔</span>
            <div><span className="stat-label">MATCHES</span><strong>{formatNumber(metrics.matches)}</strong></div>
          </article>
          <article className="stat-card stat-green">
            <span className="stat-icon">🏆</span>
            <div><span className="stat-label">WINS</span><strong>{formatNumber(metrics.wins)}</strong></div>
          </article>
          <article className="stat-card stat-pink">
            <span className="stat-icon">✦</span>
            <div><span className="stat-label">TOTAL KILLS</span><strong>{formatNumber(metrics.kills)}</strong></div>
          </article>
          <article className="stat-card stat-gold">
            <span className="stat-icon">★</span>
            <div><span className="stat-label">MVP AWARDS</span><strong>{formatNumber(metrics.mvp)}</strong></div>
          </article>
        </section>

        <div className="section-heading">
          <div>
            <span className="section-kicker">PLAYER DATABASE</span>
            <h2>Registration details</h2>
          </div>
          <span className="read-only"><span /> READ ONLY</span>
        </div>

        <div className="details-grid">
          <section className="detail-card personal-card">
            <div className="card-heading">
              <span className="card-icon">♙</span>
              <div><h3>PERSONAL INFORMATION</h3><p>Identity and contact details</p></div>
            </div>
            <div className="field-grid">
              <Field label="Full name" value={value(player.full_name)} />
              <Field label="In-game name (IGN)" value={value(player.ign)} />
              <Field label="Free Fire UID" value={value(player.freefire_uid)} />
              <Field label="Email address" value={value(player.email)} />
              <Field label="Phone number" value={value(player.phone)} />
              <Field label="Country" value={value(player.country)} />
              <Field label="Age" value={value(player.age)} />
            </div>
          </section>

          <section className="detail-card admin-record-game-card">
            <div className="card-heading">
              <span className="card-icon">⌘</span>
              <div><h3>GAME PROFILE</h3><p>Competitive setup and experience</p></div>
            </div>
            <div className="field-grid">
              <Field label="Primary role" value={value(player.primary_role)} />
              <Field label="Secondary role" value={value(player.secondary_role)} />
              <Field label="Device" value={value(player.device)} />
              <Field label="Internet connection" value={value(player.internet_connection)} />
              <Field label="Practice time" value={value(player.practice_time)} />
              <Field label="Game experience" value={value(player.game_experience)} />
              <Field label="Tournament experience" value={value(player.tournament_experience)} />
              <Field label="BR K/D rate" value={value(player.average_br_kd_rate)} />
              <Field label="Expert weapon" value={value(player.expert_weapon)} />
            </div>
          </section>

          <section className="detail-card team-card">
            <div className="card-heading">
              <span className="card-icon">♜</span>
              <div><h3>TEAM HISTORY</h3><p>Team placement and joining details</p></div>
            </div>
            <div className="field-grid">
              <Field label="Current team" value={value(player.team_name)} />
              <Field label="Previous team" value={value(player.previous_team)} />
              <Field label="Joining date" value={formatDate(player.joining_date)} />
            </div>
          </section>

          <section className="detail-card social-card">
            <div className="card-heading">
              <span className="card-icon">↗</span>
              <div><h3>SOCIAL PROFILES</h3><p>Public links shared by the player</p></div>
            </div>
            {socialLinks.length ? (
              <div className="social-list">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    <span className="social-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="social-arrow">↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-social">No social links have been added to this profile.</div>
            )}
          </section>
        </div>

        <footer className="page-footer">
          <span>OVER POWER ESPORTS <span className="footer-divider">/</span> ADMIN PLAYER RECORD</span>
          <span>PLAYER DATA · VIEW ONLY</span>
        </footer>
      </div>

      <style jsx>{`
        .admin-player-record-page {
          --bg: #080b14;
          --panel: rgba(17, 24, 40, .88);
          --line: rgba(147, 166, 210, .16);
          --muted: #8997b6;
          --text: #f5f7ff;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: clamp(18px, 3.4vw, 44px);
          background:
            radial-gradient(circle at 4% 0%, rgba(255, 70, 113, .1), transparent 29rem),
            radial-gradient(circle at 100% 14%, rgba(66, 135, 255, .13), transparent 32rem),
            var(--bg);
          color: var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .ambient {
          position: fixed;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: .13;
          pointer-events: none;
          z-index: 0;
        }
        .ambient-one { top: 15%; left: -240px; background: #ff426e; }
        .ambient-two { right: -230px; bottom: 5%; background: #527bff; }
        .container { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 42px;
          padding: 0 15px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: rgba(17, 24, 40, .72);
          color: #c5d0e9;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .08em;
          cursor: pointer;
          transition: .2s ease;
        }
        .back-button span { font-size: 18px; line-height: 1; }
        .back-button:hover { border-color: rgba(106, 145, 255, .55); color: #fff; transform: translateY(-1px); }
        .admin-label {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #8998b8;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .16em;
          text-align: right;
        }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #63dfb6; box-shadow: 0 0 12px rgba(99, 223, 182, .7); }
        .admin-record-hero {
          display: grid;
          grid-template-columns: 116px minmax(0, 1fr) auto;
          align-items: center;
          gap: 27px;
          padding: clamp(22px, 3vw, 36px);
          margin-bottom: 20px;
          border: 1px solid rgba(147, 166, 210, .19);
          border-radius: 25px;
          background: linear-gradient(120deg, rgba(27, 35, 56, .96), rgba(13, 18, 31, .94) 72%);
          box-shadow: 0 25px 65px rgba(0, 0, 0, .2);
          position: relative;
          overflow: hidden;
        }
        .admin-record-hero::before {
          content: "";
          position: absolute;
          top: 0;
          left: 7%;
          right: 7%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(106, 145, 255, .9), rgba(255, 84, 119, .8), transparent);
        }
        .avatar-shell {
          width: 116px;
          height: 116px;
          display: grid;
          place-items: center;
          position: relative;
          border-radius: 27px;
          border: 1px solid rgba(106, 145, 255, .55);
          background: linear-gradient(145deg, rgba(106, 145, 255, .22), rgba(255, 84, 119, .12));
          box-shadow: 0 12px 34px rgba(0, 0, 0, .25);
        }
        .avatar-shell img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 26px; }
        .avatar-fallback {
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          border-radius: 26px;
          background: linear-gradient(135deg, #ff5477, #6a78ff 65%, #42d8e9);
          color: #fff;
          font-size: 42px;
          font-weight: 950;
        }
        .avatar-status {
          position: absolute;
          right: -5px;
          bottom: -5px;
          width: 19px;
          height: 19px;
          border: 4px solid #151d30;
          border-radius: 50%;
          background: #53dfb0;
        }
        .hero-content { min-width: 0; }
        .brand-label { margin: 0 0 8px; color: #90a1c7; font-size: 10px; font-weight: 900; letter-spacing: .22em; }
        .hero-content h1 {
          margin: 0;
          overflow-wrap: anywhere;
          color: #f8f9ff;
          font-size: clamp(27px, 3.3vw, 42px);
          line-height: 1.12;
          font-weight: 950;
          letter-spacing: -.04em;
        }
        .full-name { margin: 7px 0 15px; color: #9aa8c8; font-size: 13px; }
        .meta-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .meta-chip { display: inline-flex; align-items: center; gap: 7px; min-height: 30px; padding: 0 11px; border-radius: 9px; font-size: 11px; font-weight: 800; }
        .role-chip { color: #ffc0ce; background: rgba(255, 84, 119, .1); border: 1px solid rgba(255, 84, 119, .18); }
        .team-chip { color: #a9c1ff; background: rgba(106, 145, 255, .1); border: 1px solid rgba(106, 145, 255, .2); }
        .hero-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 11px;
          padding-left: 22px;
          border-left: 1px solid var(--line);
        }
        .status-caption, .record-caption { color: #7f8eaf; font-size: 9px; font-weight: 900; letter-spacing: .12em; text-align: right; }
        .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid rgba(250, 191, 36, .24); border-radius: 10px; background: rgba(250, 191, 36, .09); color: #ffd978; font-size: 10px; font-weight: 950; letter-spacing: .09em; text-transform: uppercase; }
        .status-badge.approved { border-color: rgba(47, 211, 160, .26); background: rgba(47, 211, 160, .09); color: #6de9c0; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 35px; }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          padding: 19px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(17, 24, 40, .79);
          box-shadow: 0 14px 32px rgba(0, 0, 0, .12);
          transition: transform .2s ease, border-color .2s ease;
        }
        .stat-card:hover { transform: translateY(-3px); border-color: rgba(147, 166, 210, .34); }
        .stat-icon { display: grid; place-items: center; width: 43px; height: 43px; flex: 0 0 43px; border-radius: 14px; font-size: 20px; }
        .stat-blue .stat-icon { color: #9eb8ff; background: rgba(106, 145, 255, .13); }
        .stat-green .stat-icon { color: #75e9c2; background: rgba(47, 211, 160, .11); }
        .stat-pink .stat-icon { color: #ff9cb1; background: rgba(255, 84, 119, .11); }
        .stat-gold .stat-icon { color: #ffdb86; background: rgba(255, 190, 74, .11); }
        .stat-label { display: block; margin-bottom: 5px; color: #8594b4; font-size: 9px; font-weight: 900; letter-spacing: .12em; }
        .stat-card strong { display: block; color: #f5f7ff; font-size: clamp(21px, 2.3vw, 29px); line-height: 1.1; font-weight: 950; }
        .section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 17px; }
        .section-kicker { color: #6f83af; font-size: 9px; font-weight: 950; letter-spacing: .2em; }
        .section-heading h2 { margin: 6px 0 0; font-size: clamp(21px, 2.6vw, 28px); line-height: 1.2; letter-spacing: -.03em; }
        .read-only { display: inline-flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid rgba(147, 166, 210, .14); border-radius: 8px; color: #8291b0; font-size: 9px; font-weight: 900; letter-spacing: .1em; white-space: nowrap; }
        .read-only span { width: 6px; height: 6px; border-radius: 50%; background: #7e8eae; }
        .details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 17px; }
        .detail-card { min-width: 0; padding: 21px; border: 1px solid var(--line); border-radius: 19px; background: rgba(16, 22, 37, .84); box-shadow: 0 16px 36px rgba(0, 0, 0, .13); }
        .admin-record-game-card {
          border-color: rgba(163, 107, 255, .32);
          background: linear-gradient(145deg, rgba(22, 23, 48, .96), rgba(13, 17, 33, .96));
        }
        .admin-record-game-card .card-heading h3 {
          color: #c9b0ff;
          font-size: 12px;
          line-height: 1.35;
          text-shadow: none;
          filter: none;
          animation: none;
        }
        .admin-record-game-card .card-icon {
          border-color: rgba(163, 107, 255, .32);
          background: rgba(163, 107, 255, .12);
          color: #d0b5ff;
        }
        .card-heading { display: flex; align-items: center; gap: 12px; padding-bottom: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(147, 166, 210, .11); }
        .card-icon { display: grid; place-items: center; width: 41px; height: 41px; flex: 0 0 41px; border: 1px solid rgba(106, 145, 255, .2); border-radius: 13px; background: rgba(106, 145, 255, .1); color: #a7bdff; font-size: 20px; }
        .personal-card .card-icon { border-color: rgba(255, 84, 119, .2); background: rgba(255, 84, 119, .09); color: #ff9bb0; }
        .team-card .card-icon { border-color: rgba(47, 211, 160, .2); background: rgba(47, 211, 160, .08); color: #75e9c2; }
        .social-card .card-icon { border-color: rgba(255, 190, 74, .2); background: rgba(255, 190, 74, .08); color: #ffdb86; }
        .card-heading h3 { margin: 0 0 5px; color: #eaf0ff; font-size: 12px; font-weight: 950; letter-spacing: .08em; }
        .card-heading p { margin: 0; color: #7f8eae; font-size: 11px; line-height: 1.45; }
        .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .field { min-width: 0; min-height: 66px; padding: 12px; border: 1px solid rgba(147, 166, 210, .1); border-radius: 12px; background: rgba(4, 8, 16, .28); }
        .field-label { display: block; margin-bottom: 7px; color: #7585a6; font-size: 9px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
        .field-value { display: block; overflow-wrap: anywhere; color: #e0e7fa; font-size: 12px; font-weight: 700; line-height: 1.45; }
        .social-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .social-link { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 12px; border: 1px solid rgba(255, 190, 74, .16); border-radius: 12px; background: rgba(255, 190, 74, .045); color: #e8d9b7; text-decoration: none; font-size: 12px; font-weight: 850; transition: .18s ease; }
        .social-link:hover { border-color: rgba(255, 190, 74, .4); background: rgba(255, 190, 74, .09); transform: translateY(-2px); }
        .social-icon { display: grid; place-items: center; width: 28px; height: 28px; flex: 0 0 28px; border-radius: 9px; background: rgba(255, 190, 74, .1); color: #ffdb86; font-size: 14px; }
        .social-arrow { margin-left: auto; color: #a98f5e; }
        .empty-social { padding: 18px; border: 1px dashed rgba(147, 166, 210, .16); border-radius: 12px; color: #8594b4; font-size: 12px; line-height: 1.6; }
        .page-footer { display: flex; justify-content: space-between; gap: 14px; margin-top: 27px; padding: 17px 2px 0; border-top: 1px solid rgba(147, 166, 210, .1); color: #657493; font-size: 9px; font-weight: 900; letter-spacing: .11em; }
        .footer-divider { padding: 0 5px; color: #ff6e8c; }
        @media (max-width: 1000px) {
          .admin-record-hero { grid-template-columns: 94px minmax(0, 1fr); gap: 20px; }
          .avatar-shell { width: 94px; height: 94px; border-radius: 22px; }
          .avatar-shell img, .avatar-fallback { border-radius: 21px; }
          .avatar-fallback { font-size: 34px; }
          .hero-status { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: flex-start; flex-wrap: wrap; padding: 15px 0 0; border-left: 0; border-top: 1px solid var(--line); }
          .status-caption, .record-caption { text-align: left; }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 700px) {
          .admin-player-record-page { padding: 17px 13px 27px; }
          .topbar { align-items: flex-start; }
          .admin-label { max-width: 145px; justify-content: flex-end; font-size: 8px; line-height: 1.5; }
          .back-button { min-height: 39px; padding: 0 11px; font-size: 9px; }
          .admin-record-hero { grid-template-columns: 1fr; justify-items: center; gap: 15px; padding: 24px 17px; border-radius: 20px; text-align: center; }
          .avatar-shell { width: 91px; height: 91px; }
          .hero-content { width: 100%; }
          .brand-label { font-size: 9px; letter-spacing: .17em; }
          .hero-content h1 { font-size: clamp(25px, 7vw, 34px); }
          .full-name { margin-bottom: 13px; }
          .meta-row { justify-content: center; }
          .hero-status { width: 100%; justify-content: center; gap: 9px; }
          .status-caption { width: 100%; text-align: center; }
          .record-caption { text-align: center; }
          .stats-grid { gap: 9px; margin-bottom: 28px; }
          .stat-card { gap: 10px; padding: 13px 11px; border-radius: 15px; }
          .stat-icon { width: 35px; height: 35px; flex-basis: 35px; border-radius: 11px; font-size: 16px; }
          .stat-label { font-size: 8px; letter-spacing: .07em; }
          .stat-card strong { font-size: 22px; }
          .section-heading h2 { font-size: 22px; }
          .details-grid { grid-template-columns: minmax(0, 1fr); gap: 13px; }
          .detail-card { padding: 16px; border-radius: 16px; }
          .field-grid { gap: 8px; }
          .field { padding: 10px; min-height: 62px; }
          .field-label { font-size: 8px; letter-spacing: .07em; }
          .field-value { font-size: 11px; }
          .social-list { gap: 8px; }
          .social-link { padding: 10px 8px; gap: 7px; font-size: 11px; }
          .page-footer { flex-direction: column; font-size: 8px; line-height: 1.6; }
        }
        @media (max-width: 380px) {
          .field-grid, .social-list { grid-template-columns: minmax(0, 1fr); }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hero-status { flex-direction: column; }
        }
        @media (prefers-reduced-motion: reduce) {
          .back-button, .stat-card, .social-link { transition: none; }
          .back-button:hover, .stat-card:hover, .social-link:hover { transform: none; }
        }
      `}</style>
      <style jsx global>{`
        .admin-player-record-page .record-field {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 8px;
          min-width: 0;
          min-height: 82px;
          padding: 14px;
          border: 1px solid rgba(132, 154, 215, .18);
          border-radius: 13px;
          background: linear-gradient(145deg, rgba(22, 29, 49, .88), rgba(10, 15, 29, .86));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .025);
        }
        .admin-player-record-page .record-field-label {
          display: block;
          width: 100%;
          margin: 0;
          color: #9fadd0;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.35;
          letter-spacing: .075em;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }
        .admin-player-record-page .record-field-value {
          display: block;
          width: 100%;
          margin: 0;
          color: #f5f7ff;
          font-size: 14px;
          font-weight: 750;
          line-height: 1.55;
          overflow-wrap: anywhere;
          word-break: normal;
        }
        .admin-player-record-page .personal-card .record-field-label { color: #8ddcf3; }
        .admin-player-record-page .admin-record-game-card .record-field-label { color: #c8a9ff; }
        .admin-player-record-page .team-card .record-field-label { color: #7ce8c4; }
        .admin-player-record-page .social-card .record-field-label { color: #ffd58b; }
        @media (max-width: 700px) {
          .admin-player-record-page .record-field {
            min-height: 76px;
            padding: 12px;
            gap: 7px;
          }
          .admin-player-record-page .record-field-label {
            font-size: 9px;
            letter-spacing: .055em;
          }
          .admin-player-record-page .record-field-value {
            font-size: 13px;
          }
        }
        @media (max-width: 380px) {
          .admin-player-record-page .record-field-value { font-size: 13px; }
        }
      `}</style>

    </main>
  );
}

function Field({ label, value, className = "" }) {
  return (
    <div className={`record-field ${className}`}>
      <span className="record-field-label">{label}</span>
      <span className="record-field-value">{value}</span>
    </div>
  );
}
