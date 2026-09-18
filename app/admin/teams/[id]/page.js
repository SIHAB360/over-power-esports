"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function TeamPlayersPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id;

  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    if (teamId) {
      loadData();
    }
  }, [teamId]);

  async function loadData() {
    setLoading(true);

    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    if (teamError) {
      console.log(teamError);
      setLoading(false);
      return;
    }

    setTeam(teamData);

    const { data: teamPlayers, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (playersError) {
      console.log(playersError);
    }

    setPlayers(teamPlayers || []);

    const { data: freePlayers, error: freePlayersError } = await supabase
      .from("players")
      .select("*")
      .is("team_id", null)
      .order("created_at", { ascending: false });

    if (freePlayersError) {
      console.log(freePlayersError);
    }

    setAvailablePlayers(freePlayers || []);
    setLoading(false);
  }

  async function addPlayer(playerId) {
    setActionLoading(playerId);

    const { error } = await supabase
      .from("players")
      .update({ team_id: teamId })
      .eq("id", playerId);

    if (error) {
      alert(error.message);
      setActionLoading("");
      return;
    }

    await loadData();
    setActionLoading("");
  }

  async function removePlayer(playerId) {
    setActionLoading(playerId);

    const { error } = await supabase
      .from("players")
      .update({ team_id: null })
      .eq("id", playerId);

    if (error) {
      alert(error.message);
      setActionLoading("");
      return;
    }

    await loadData();
    setActionLoading("");
  }

  if (loading) {
    return (
      <main className="page loading-page">
        <div className="bg-orb orb-one"></div>
        <div className="bg-orb orb-two"></div>
        <div className="bg-orb orb-three"></div>

        <div className="loading-box">
          <div className="loader"></div>
          <h2>Loading Team...</h2>
          <p>Please wait while team data is being prepared.</p>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #040404;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            color: white;
          }

          .bg-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(130px);
            opacity: 0.45;
            animation: floatGlow 10s ease-in-out infinite;
          }

          .orb-one {
            width: 280px;
            height: 280px;
            background: #ff174d;
            top: -60px;
            left: -40px;
          }

          .orb-two {
            width: 320px;
            height: 320px;
            background: #6f00ff;
            right: -100px;
            top: 120px;
            animation-delay: 1.5s;
          }

          .orb-three {
            width: 280px;
            height: 280px;
            background: #008cff;
            left: 35%;
            bottom: -120px;
            animation-delay: 3s;
          }

          .loading-box {
            position: relative;
            z-index: 2;
            width: min(92%, 450px);
            border-radius: 28px;
            padding: 40px 28px;
            text-align: center;
            background: rgba(10, 10, 18, 0.78);
            border: 1px solid rgba(255, 23, 77, 0.28);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(18px);
          }

          .loader {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            margin: 0 auto 20px;
            border: 4px solid rgba(255, 255, 255, 0.15);
            border-top: 4px solid #ff174d;
            border-right: 4px solid #8b2cff;
            animation: spin 1s linear infinite;
          }

          h2 {
            margin: 0 0 10px;
            font-size: 28px;
          }

          p {
            margin: 0;
            color: #b6b6c7;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes floatGlow {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(30px, -25px) scale(1.08);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="bg-orb orb-one"></div>
      <div className="bg-orb orb-two"></div>
      <div className="bg-orb orb-three"></div>
      <div className="grid-overlay"></div>

      <div className="container">
        <div className="topbar">
          <button className="back-btn" onClick={() => router.push("/admin/teams")}>
            ← BACK TO TEAMS
          </button>

          <div className="small-brand">OVER POWER ESPORTS</div>
        </div>

        <section className="hero">
          <div className="hero-left">
            <div className="logo-wrap">
              {team?.logo ? (
                <img src={team.logo} alt={team.team_name} />
              ) : (
                <span>{team?.team_name?.slice(0, 2)?.toUpperCase() || "OP"}</span>
              )}
            </div>

            <div className="hero-text">
              <p className="eyebrow">TEAM PLAYER MANAGEMENT</p>
              <h1>{team?.team_name}</h1>
              <div className="hero-meta">
                <span className="pill coach">Coach: {team?.coach_name || "N/A"}</span>
                <span className="pill manager">Manager: {team?.manager_name || "N/A"}</span>
                <span className="pill status">{team?.status || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <small>Current Roster</small>
              <strong>{players.length}</strong>
            </div>
            <div className="stat-card">
              <small>Available Players</small>
              <strong>{availablePlayers.length}</strong>
            </div>
            <div className="stat-card">
              <small>Country</small>
              <strong>{team?.country || "N/A"}</strong>
            </div>
          </div>
        </section>

        <section className="glass-card info-card">
          <div className="section-head">
            <span className="section-number">01</span>
            <div>
              <p className="section-label">TEAM OVERVIEW</p>
              <h2>TEAM INFORMATION</h2>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-box red">
              <span>Coach</span>
              <b>{team?.coach_name || "N/A"}</b>
            </div>

            <div className="info-box purple">
              <span>Manager</span>
              <b>{team?.manager_name || "N/A"}</b>
            </div>

            <div className="info-box blue">
              <span>Country</span>
              <b>{team?.country || "N/A"}</b>
            </div>

            <div className="info-box gold">
              <span>Founded Year</span>
              <b>{team?.founded_year || "N/A"}</b>
            </div>

            <div className="info-box green">
              <span>Status</span>
              <b>{team?.status || "N/A"}</b>
            </div>

            <div className="info-box pink">
              <span>Total Winnings</span>
              <b>৳{team?.total_winnings || 0}</b>
            </div>
          </div>
        </section>

        <section className="glass-card">
          <div className="section-head">
            <span className="section-number">02</span>
            <div>
              <p className="section-label">ACTIVE TEAM</p>
              <h2>CURRENT ROSTER ({players.length})</h2>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="empty-box">
              <h3>No player added yet</h3>
              <p>Add registered players to build your active team roster.</p>
            </div>
          ) : (
            <div className="player-grid">
              {players.map((player) => (
                <div className="player-card roster-card" key={player.id}>
                  <div className="player-top">
                    <div className="avatar">
                      {player?.profile_image || player?.avatar_url ? (
                        <img
                          src={player.profile_image || player.avatar_url}
                          alt={player.full_name}
                        />
                      ) : (
                        <span>
                          {player?.full_name?.slice(0, 1)?.toUpperCase() || "P"}
                        </span>
                      )}
                    </div>

                    <div className="player-main">
                      <h3>{player.full_name || "Unnamed Player"}</h3>
                      <p className="ign">
                        IGN: {player.ign || player.freefire_uid || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="player-details">
                    <span>Role: {player.primary_role || "N/A"}</span>
                    <span>Phone: {player.phone || "N/A"}</span>
                    <span>Status: {player.status || "N/A"}</span>
                  </div>

                  <button
                    className="action-btn remove-btn"
                    onClick={() => removePlayer(player.id)}
                    disabled={actionLoading === player.id}
                  >
                    {actionLoading === player.id ? "REMOVING..." : "REMOVE"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-card">
          <div className="section-head">
            <span className="section-number">03</span>
            <div>
              <p className="section-label">FREE AGENTS</p>
              <h2>AVAILABLE PLAYERS ({availablePlayers.length})</h2>
            </div>
          </div>

          {availablePlayers.length === 0 ? (
            <div className="empty-box">
              <h3>No available players</h3>
              <p>All players are already assigned to teams right now.</p>
            </div>
          ) : (
            <div className="player-grid">
              {availablePlayers.map((player) => (
                <div className="player-card available-card" key={player.id}>
                  <div className="player-top">
                    <div className="avatar">
                      {player?.profile_image || player?.avatar_url ? (
                        <img
                          src={player.profile_image || player.avatar_url}
                          alt={player.full_name}
                        />
                      ) : (
                        <span>
                          {player?.full_name?.slice(0, 1)?.toUpperCase() || "P"}
                        </span>
                      )}
                    </div>

                    <div className="player-main">
                      <h3>{player.full_name || "Unnamed Player"}</h3>
                      <p className="ign">
                        IGN: {player.ign || player.freefire_uid || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="player-details">
                    <span>Role: {player.primary_role || "N/A"}</span>
                    <span>Phone: {player.phone || "N/A"}</span>
                    <span>Country: {player.country || "N/A"}</span>
                  </div>

                  <button
                    className="action-btn add-btn"
                    onClick={() => addPlayer(player.id)}
                    disabled={actionLoading === player.id}
                  >
                    {actionLoading === player.id ? "ADDING..." : "ADD PLAYER"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 20, 90, 0.12), transparent 30%),
            radial-gradient(circle at top right, rgba(90, 0, 255, 0.12), transparent 32%),
            linear-gradient(135deg, #030303 0%, #070711 50%, #020205 100%);
          color: white;
          padding: 28px 18px 50px;
          position: relative;
          overflow: hidden;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent);
          pointer-events: none;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.45;
          animation: floatGlow 11s ease-in-out infinite;
        }

        .orb-one {
          width: 320px;
          height: 320px;
          background: #ff174d;
          top: -60px;
          left: -40px;
        }

        .orb-two {
          width: 360px;
          height: 360px;
          background: #6f00ff;
          right: -100px;
          top: 120px;
          animation-delay: 2s;
        }

        .orb-three {
          width: 320px;
          height: 320px;
          background: #009dff;
          left: 35%;
          bottom: -120px;
          animation-delay: 4s;
        }

        .container {
          max-width: 1240px;
          margin: auto;
          position: relative;
          z-index: 2;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .back-btn {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 12px 18px;
          border-radius: 18px;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: 0.3s;
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(255, 23, 77, 0.25);
          border-color: rgba(255, 23, 77, 0.4);
        }

        .small-brand {
          font-size: 12px;
          letter-spacing: 4px;
          color: #ff4d74;
          font-weight: 900;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 30px;
          border-radius: 30px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.02)
          );
          border: 1px solid rgba(255, 23, 77, 0.22);
          backdrop-filter: blur(18px);
          box-shadow:
            0 35px 80px rgba(0, 0, 0, 0.45),
            inset 0 0 35px rgba(255, 23, 77, 0.05);
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .hero:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            rgba(255, 23, 77, 0.08),
            transparent 35%,
            rgba(111, 0, 255, 0.08)
          );
          pointer-events: none;
        }

        .hero-left {
          display: flex;
          align-items: center;
          gap: 22px;
          flex: 1;
          min-width: 0;
        }

        .logo-wrap {
          width: 120px;
          height: 120px;
          min-width: 120px;
          border-radius: 30px;
          background: linear-gradient(135deg, #ff174d, #7a00ff);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 35px rgba(255, 23, 77, 0.35),
            0 0 55px rgba(122, 0, 255, 0.2);
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.12);
        }

        .logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .logo-wrap span {
          font-size: 42px;
          font-weight: 900;
          color: white;
        }

        .hero-text {
          min-width: 0;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #ff4d74;
          letter-spacing: 4px;
          font-size: 11px;
          font-weight: 800;
        }

        .hero-text h1 {
          margin: 0;
          font-size: 46px;
          line-height: 1.05;
          word-break: break-word;
        }

        .hero-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .pill.coach {
          color: #ff96aa;
        }

        .pill.manager {
          color: #b897ff;
        }

        .pill.status {
          color: #53ffb4;
          text-transform: uppercase;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(120px, 1fr));
          gap: 14px;
          width: 420px;
          max-width: 100%;
        }

        .stat-card {
          border-radius: 22px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
          backdrop-filter: blur(14px);
          box-shadow: inset 0 0 24px rgba(255, 255, 255, 0.02);
        }

        .stat-card small {
          display: block;
          color: #9f9fb2;
          font-size: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-card strong {
          font-size: 24px;
          color: white;
        }

        .glass-card {
          border-radius: 30px;
          padding: 28px;
          margin-bottom: 24px;
          background: rgba(12, 12, 18, 0.78);
          border: 1px solid rgba(255, 23, 77, 0.22);
          backdrop-filter: blur(18px);
          box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.38),
            inset 0 0 25px rgba(122, 0, 255, 0.05);
        }

        .section-head {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .section-number {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 900;
          background: linear-gradient(135deg, rgba(255, 23, 77, 0.16), rgba(122, 0, 255, 0.16));
          border: 1px solid rgba(255, 23, 77, 0.22);
          color: #ff88a0;
          box-shadow: 0 0 18px rgba(255, 23, 77, 0.15);
        }

        .section-label {
          margin: 0 0 5px;
          font-size: 11px;
          letter-spacing: 3px;
          color: #8f8fa3;
          font-weight: 800;
        }

        .section-head h2 {
          margin: 0;
          font-size: 28px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .info-box {
          padding: 18px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: inset 0 0 25px rgba(255, 255, 255, 0.015);
        }

        .info-box span {
          display: block;
          font-size: 12px;
          color: #aaaaaf;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .info-box b {
          display: block;
          font-size: 20px;
          color: white;
        }

        .info-box.red {
          box-shadow: inset 0 0 30px rgba(255, 23, 77, 0.06);
        }

        .info-box.purple {
          box-shadow: inset 0 0 30px rgba(111, 0, 255, 0.06);
        }

        .info-box.blue {
          box-shadow: inset 0 0 30px rgba(0, 157, 255, 0.06);
        }

        .info-box.gold {
          box-shadow: inset 0 0 30px rgba(255, 174, 0, 0.06);
        }

        .info-box.green {
          box-shadow: inset 0 0 30px rgba(0, 255, 166, 0.06);
        }

        .info-box.pink {
          box-shadow: inset 0 0 30px rgba(255, 0, 153, 0.06);
        }

        .player-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .player-card {
          border-radius: 24px;
          padding: 20px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: 0.3s;
          position: relative;
          overflow: hidden;
        }

        .player-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.35);
        }

        .roster-card {
          box-shadow: inset 0 0 22px rgba(255, 23, 77, 0.04);
        }

        .available-card {
          box-shadow: inset 0 0 22px rgba(111, 0, 255, 0.04);
        }

        .player-top {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 16px;
        }

        .avatar {
          width: 64px;
          height: 64px;
          min-width: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, #ff174d, #7a00ff);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 0 22px rgba(255, 23, 77, 0.25);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar span {
          font-size: 24px;
          font-weight: 900;
          color: white;
        }

        .player-main {
          min-width: 0;
        }

        .player-main h3 {
          margin: 0;
          font-size: 24px;
          line-height: 1.1;
          word-break: break-word;
        }

        .ign {
          margin: 7px 0 0;
          color: #b2b2c0;
          font-size: 14px;
        }

        .player-details {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 18px;
        }

        .player-details span {
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #d4d4de;
          font-size: 12px;
          font-weight: 700;
        }

        .action-btn {
          width: 100%;
          border: none;
          border-radius: 18px;
          padding: 14px 18px;
          font-weight: 900;
          font-size: 14px;
          cursor: pointer;
          color: white;
          transition: 0.3s;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .action-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .add-btn {
          background: linear-gradient(135deg, #ff174d, #7a00ff);
          box-shadow: 0 0 25px rgba(122, 0, 255, 0.22);
        }

        .remove-btn {
          background: linear-gradient(135deg, #ff174d, #ff005d);
          box-shadow: 0 0 25px rgba(255, 23, 77, 0.22);
        }

        .empty-box {
          padding: 36px 24px;
          border-radius: 22px;
          text-align: center;
          border: 1px dashed rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
        }

        .empty-box h3 {
          margin: 0 0 10px;
          font-size: 24px;
        }

        .empty-box p {
          margin: 0;
          color: #a9a9b7;
        }

        @keyframes floatGlow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(35px, -30px) scale(1.1);
          }
        }

        @media (max-width: 1100px) {
          .hero {
            flex-direction: column;
          }

          .hero-stats {
            width: 100%;
          }

          .info-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .player-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .page {
            padding: 18px 12px 40px;
          }

          .hero {
            padding: 22px 18px;
          }

          .hero-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .logo-wrap {
            width: 96px;
            height: 96px;
            min-width: 96px;
          }

          .hero-text h1 {
            font-size: 34px;
          }

          .hero-stats {
            grid-template-columns: 1fr;
          }

          .glass-card {
            padding: 20px 16px;
          }

          .section-head {
            align-items: flex-start;
          }

          .section-head h2 {
            font-size: 22px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .player-main h3 {
            font-size: 21px;
          }

          .player-details {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
