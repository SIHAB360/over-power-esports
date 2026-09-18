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
    if (teamId) loadData();
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

    const { data: teamPlayers } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    setPlayers(teamPlayers || []);

    const { data: freePlayers } = await supabase
      .from("players")
      .select("*")
      .is("team_id", null)
      .order("created_at", { ascending: false });

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
      <main className="loading-page">
        <div className="loader"></div>
        <p>Loading Team...</p>
        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: #050505;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
            color: #fff;
          }
          .loader {
            width: 52px;
            height: 52px;
            border: 3px solid #222;
            border-top-color: #ff1744;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          p {
            font-size: 13px;
            letter-spacing: 2px;
            color: #ff4d6d;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      {/* Background Lights */}
      <div className="light light-1"></div>
      <div className="light light-2"></div>
      <div className="light light-3"></div>

      <div className="container">
        {/* Top Bar */}
        <div className="topbar">
          <button className="back-btn" onClick={() => router.push("/admin/teams")}>
            ← BACK TO TEAMS
          </button>
          <span className="brand">OVER POWER ESPORTS</span>
        </div>

        {/* Hero */}
        <section className="hero">
          <div className="hero-left">
            <div className="team-logo">
              {team?.logo ? (
                <img src={team.logo} alt={team.team_name} />
              ) : (
                <span>{team?.team_name?.slice(0, 2)?.toUpperCase() || "OP"}</span>
              )}
            </div>
            <div className="hero-info">
              <p className="eyebrow">TEAM PLAYER MANAGEMENT</p>
              <h1>{team?.team_name}</h1>
              <div className="pills">
                <span className="pill">Coach: {team?.coach_name || "N/A"}</span>
                <span className="pill">Manager: {team?.manager_name || "N/A"}</span>
                <span className="pill status">{team?.status || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <small>Current Roster</small>
              <strong>{players.length}</strong>
            </div>
            <div className="stat">
              <small>Available</small>
              <strong>{availablePlayers.length}</strong>
            </div>
            <div className="stat">
              <small>Country</small>
              <strong>{team?.country || "N/A"}</strong>
            </div>
          </div>
        </section>

        {/* Team Information */}
        <section className="card">
          <div className="card-head">
            <span className="num">01</span>
            <div>
              <p>TEAM OVERVIEW</p>
              <h2>TEAM INFORMATION</h2>
            </div>
          </div>
          <div className="info-grid">
            <div className="info-box">
              <span>Coach</span>
              <b>{team?.coach_name || "N/A"}</b>
            </div>
            <div className="info-box">
              <span>Manager</span>
              <b>{team?.manager_name || "N/A"}</b>
            </div>
            <div className="info-box">
              <span>Country</span>
              <b>{team?.country || "N/A"}</b>
            </div>
            <div className="info-box">
              <span>Founded Year</span>
              <b>{team?.founded_year || "N/A"}</b>
            </div>
            <div className="info-box">
              <span>Status</span>
              <b className="green">{team?.status || "N/A"}</b>
            </div>
            <div className="info-box">
              <span>Total Winnings</span>
              <b>৳{team?.total_winnings || 0}</b>
            </div>
          </div>
        </section>

        {/* Current Roster */}
        <section className="card">
          <div className="card-head">
            <span className="num">02</span>
            <div>
              <p>ACTIVE TEAM</p>
              <h2>CURRENT ROSTER ({players.length})</h2>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="empty">
              <h3>No player added yet</h3>
              <p>Add registered players to build your active team roster.</p>
            </div>
          ) : (
            <div className="player-grid">
              {players.map((player) => (
                <div className="player-card" key={player.id}>
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
                    <div className="player-info">
                      <h3>{player.full_name || "Unnamed"}</h3>
                      <p>IGN: {player.ign || player.freefire_uid || "N/A"}</p>
                    </div>
                  </div>
                  <div className="tags">
                    <span>Role: {player.primary_role || "N/A"}</span>
                    <span>Phone: {player.phone || "N/A"}</span>
                    <span>Status: {player.status || "N/A"}</span>
                  </div>
                  <button
                    className="btn remove"
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

        {/* Available Players */}
        <section className="card">
          <div className="card-head">
            <span className="num">03</span>
            <div>
              <p>FREE AGENTS</p>
              <h2>AVAILABLE PLAYERS ({availablePlayers.length})</h2>
            </div>
          </div>

          {availablePlayers.length === 0 ? (
            <div className="empty">
              <h3>No available players</h3>
              <p>All players are already assigned to teams.</p>
            </div>
          ) : (
            <div className="player-grid">
              {availablePlayers.map((player) => (
                <div className="player-card available" key={player.id}>
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
                    <div className="player-info">
                      <h3>{player.full_name || "Unnamed"}</h3>
                      <p>IGN: {player.ign || player.freefire_uid || "N/A"}</p>
                    </div>
                  </div>
                  <div className="tags">
                    <span>Role: {player.primary_role || "N/A"}</span>
                    <span>Phone: {player.phone || "N/A"}</span>
                    <span>Country: {player.country || "N/A"}</span>
                  </div>
                  <button
                    className="btn add"
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
          background: #050505;
          color: #fff;
          position: relative;
          overflow-x: hidden;
          font-family: "Inter", system-ui, sans-serif;
          padding: 24px 16px 50px;
        }

        .light {
          position: fixed;
          border-radius: 50%;
          filter: blur(150px);
          pointer-events: none;
          z-index: 0;
          animation: pulse 7s ease-in-out infinite;
        }
        .light-1 {
          width: 500px;
          height: 500px;
          background: #ff1744;
          top: -200px;
          left: -150px;
          opacity: 0.16;
        }
        .light-2 {
          width: 400px;
          height: 400px;
          background: #7c3aed;
          top: 30%;
          right: -120px;
          opacity: 0.12;
          animation-delay: 2.5s;
        }
        .light-3 {
          width: 350px;
          height: 350px;
          background: #00ff9d;
          bottom: -100px;
          left: 30%;
          opacity: 0.07;
          animation-delay: 5s;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.08;
            transform: scale(1);
          }
          50% {
            opacity: 0.18;
            transform: scale(1.06);
          }
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        /* Topbar */
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .back-btn {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          padding: 11px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: 0.25s;
        }
        .back-btn:hover {
          border-color: rgba(255, 23, 68, 0.5);
          box-shadow: 0 0 20px rgba(255, 23, 68, 0.2);
        }
        .brand {
          font-size: 12px;
          letter-spacing: 3px;
          color: #ff4d6d;
          font-weight: 800;
        }

        /* Hero */
        .hero {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 28px;
          border-radius: 24px;
          background: rgba(18, 6, 12, 0.9);
          border: 1px solid rgba(255, 23, 68, 0.35);
          box-shadow: 0 0 40px rgba(255, 23, 68, 0.12);
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .hero-left {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          min-width: 0;
        }
        .team-logo {
          width: 100px;
          height: 100px;
          min-width: 100px;
          border-radius: 22px;
          background: linear-gradient(135deg, #ff1744, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.4);
        }
        .team-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .team-logo span {
          font-size: 32px;
          font-weight: 900;
        }
        .eyebrow {
          margin: 0 0 6px;
          font-size: 11px;
          letter-spacing: 2px;
          color: #ff4d6d;
          font-weight: 700;
        }
        .hero-info h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 900;
          line-height: 1.15;
          word-break: break-word;
        }
        .pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }
        .pill {
          padding: 7px 14px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .pill.status {
          color: #00ff9d;
          border-color: rgba(0, 255, 157, 0.3);
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          min-width: 280px;
        }
        .stat {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px;
          text-align: center;
        }
        .stat small {
          display: block;
          font-size: 11px;
          color: #888;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat strong {
          font-size: 22px;
          font-weight: 800;
        }

        /* Card */
        .card {
          background: rgba(18, 6, 12, 0.9);
          border: 1px solid rgba(255, 23, 68, 0.25);
          border-radius: 22px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.08);
        }
        .card-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .num {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255, 23, 68, 0.12);
          border: 1px solid rgba(255, 23, 68, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #ff4d6d;
        }
        .card-head p {
          margin: 0 0 3px;
          font-size: 11px;
          letter-spacing: 2px;
          color: #888;
          font-weight: 700;
        }
        .card-head h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .info-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 16px;
        }
        .info-box span {
          display: block;
          font-size: 11px;
          color: #888;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-box b {
          font-size: 16px;
          font-weight: 700;
        }
        .info-box b.green {
          color: #00ff9d;
        }

        /* Player Grid */
        .player-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .player-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          padding: 18px;
          transition: 0.25s;
        }
        .player-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 23, 68, 0.35);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .player-card.available {
          border-color: rgba(124, 58, 237, 0.2);
        }
        .player-top {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }
        .avatar {
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ff1744, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 0 18px rgba(255, 23, 68, 0.3);
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar span {
          font-size: 20px;
          font-weight: 900;
        }
        .player-info h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          word-break: break-word;
        }
        .player-info p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #aaa;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
        }
        .tags span {
          padding: 5px 10px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          color: #ccc;
        }
        .btn {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 12px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          color: #fff;
          transition: 0.25s;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn.remove {
          background: linear-gradient(135deg, #ff1744, #c4002b);
          box-shadow: 0 0 18px rgba(255, 23, 68, 0.3);
        }
        .btn.add {
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          box-shadow: 0 0 18px rgba(124, 58, 237, 0.3);
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .empty {
          text-align: center;
          padding: 36px 20px;
          border: 1px dashed rgba(255, 255, 255, 0.12);
          border-radius: 16px;
        }
        .empty h3 {
          margin: 0 0 8px;
          font-size: 18px;
        }
        .empty p {
          margin: 0;
          color: #888;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .hero {
            flex-direction: column;
          }
          .hero-stats {
            width: 100%;
            grid-template-columns: repeat(3, 1fr);
          }
          .info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .player-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 560px) {
          .hero-left {
            flex-direction: column;
            align-items: flex-start;
          }
          .hero-info h1 {
            font-size: 24px;
          }
          .hero-stats {
            grid-template-columns: 1fr;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
          .card {
            padding: 18px 16px;
          }
          .card-head h2 {
            font-size: 17px;
          }
        }
      `}</style>
    </main>
  );
}
