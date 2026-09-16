"use client";
import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getPlayer();
    }
  }, [id]);

  const getPlayer = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      setPlayer(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>LOADING PLAYER PROFILE...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="loading-screen">
        <p>PLAYER NOT FOUND</p>
      </div>
    );
  }

  return (
    <main className="page">
      {/* Background Glow */}
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>

      <div className="container">
        {/* Hero Section */}
        <section className="hero-card">
          <div className="image-box">
            <img
              src={
                player.profile_image ||
                player.avatar_url ||
                "/default.png"
              }
              alt={player.ign || "Player"}
            />
          </div>

          <div className="hero-info">
            <p className="brand">OVER POWER ESPORTS</p>
            <h1>{player.ign || player.full_name}</h1>
            <h3>{player.primary_role || player.position || "PLAYER"}</h3>
            <p className="team">{player.team_name || "NO TEAM"}</p>
            <span className={`status ${player.status === "approved" ? "approved" : "pending"}`}>
              {player.status || "pending"}
            </span>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">MATCHES</span>
            <strong className="stat-value">{player.matches_played || 0}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">WINS</span>
            <strong className="stat-value">{player.wins || 0}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">KILLS</span>
            <strong className="stat-value">{player.total_kills || 0}</strong>
          </div>
        </section>

        {/* Player Information */}
        <section className="info-card">
          <h2 className="section-title">PLAYER INFORMATION</h2>
          <div className="info-grid">
            <Row label="FULL NAME" value={player.full_name} />
            <Row label="IGN" value={player.ign} />
            <Row label="FREE FIRE UID" value={player.freefire_uid} />
            <Row label="EMAIL" value={player.email} />
            <Row label="PHONE" value={player.phone} />
            <Row label="COUNTRY" value={player.country} />
            <Row label="AGE" value={player.age} />
          </div>
        </section>

        {/* Game Details */}
        <section className="info-card">
          <h2 className="section-title">GAME DETAILS</h2>
          <div className="info-grid">
            <Row label="PRIMARY ROLE" value={player.primary_role} />
            <Row label="SECONDARY ROLE" value={player.secondary_role} />
            <Row label="DEVICE" value={player.device} />
            <Row label="INTERNET" value={player.internet_connection} />
            <Row label="PRACTICE TIME" value={player.practice_time} />
            <Row label="GAME EXPERIENCE" value={player.game_experience} />
            <Row label="TOURNAMENT EXPERIENCE" value={player.tournament_experience} />
            <Row label="BR K/D RATE" value={player.average_br_kd_rate} />
            <Row label="EXPERT WEAPON" value={player.expert_weapon} />
          </div>
        </section>

        {/* Team History */}
        <section className="info-card">
          <h2 className="section-title">TEAM HISTORY</h2>
          <div className="info-grid">
            <Row label="PREVIOUS TEAM" value={player.previous_team} />
            <Row label="JOINING DATE" value={player.joining_date} />
          </div>
        </section>

        {/* Social Links */}
        <section className="social-card">
          <h2 className="section-title">SOCIAL LINKS</h2>
          <div className="social-links">
            {player.facebook_link && (
              <a href={player.facebook_link} target="_blank" rel="noopener noreferrer" className="social-btn">
                FACEBOOK
              </a>
            )}
            {player.instagram_link && (
              <a href={player.instagram_link} target="_blank" rel="noopener noreferrer" className="social-btn">
                INSTAGRAM
              </a>
            )}
            {player.youtube_link && (
              <a href={player.youtube_link} target="_blank" rel="noopener noreferrer" className="social-btn">
                YOUTUBE
              </a>
            )}
            {player.tiktok_link && (
              <a href={player.tiktok_link} target="_blank" rel="noopener noreferrer" className="social-btn">
                TIKTOK
              </a>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #050505;
          color: #fff;
          position: relative;
          overflow-x: hidden;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        .bg-glow {
          position: fixed;
          width: 700px;
          height: 700px;
          background: #ff1744;
          filter: blur(180px);
          opacity: 0.15;
          top: -300px;
          left: -200px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-glow-2 {
          position: fixed;
          width: 500px;
          height: 500px;
          background: #ff0040;
          filter: blur(160px);
          opacity: 0.1;
          bottom: -150px;
          right: -100px;
          pointer-events: none;
          z-index: 0;
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 980px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }

        /* Hero Card */
        .hero-card {
          display: flex;
          align-items: center;
          gap: 40px;
          padding: 36px;
          border-radius: 28px;
          background: rgba(15, 4, 8, 0.8);
          border: 1px solid rgba(255, 23, 68, 0.5);
          box-shadow: 0 0 50px rgba(255, 23, 68, 0.25),
            inset 0 0 30px rgba(255, 23, 68, 0.05);
          backdrop-filter: blur(12px);
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }

        .hero-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(255, 23, 68, 0.7),
            rgba(255, 23, 68, 0.1),
            rgba(255, 23, 68, 0.5)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .image-box img {
          width: 160px;
          height: 160px;
          object-fit: cover;
          border-radius: 22px;
          border: 2px solid #ff1744;
          box-shadow: 0 0 35px rgba(255, 23, 68, 0.6);
          display: block;
        }

        .hero-info {
          flex: 1;
        }

        .brand {
          font-size: 12px;
          letter-spacing: 4px;
          color: #888;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .hero-info h1 {
          font-size: 42px;
          font-weight: 900;
          margin: 0 0 6px;
          background: linear-gradient(180deg, #ffffff 20%, #ff8a9b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }

        .hero-info h3 {
          font-size: 18px;
          letter-spacing: 3px;
          color: #ff4d6d;
          margin: 0 0 10px;
          font-weight: 600;
        }

        .team {
          font-size: 17px;
          color: #00ff9d;
          font-weight: 600;
          margin: 0 0 16px;
          text-shadow: 0 0 15px rgba(0, 255, 157, 0.4);
        }

        .status {
          display: inline-block;
          padding: 7px 18px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .status.pending {
          background: rgba(255, 193, 7, 0.12);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.5);
        }

        .status.approved {
          background: rgba(0, 255, 157, 0.12);
          color: #00ff9d;
          border: 1px solid rgba(0, 255, 157, 0.5);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(12, 3, 6, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.35);
          border-radius: 20px;
          padding: 24px 20px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 23, 68, 0.6);
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.2);
        }

        .stat-label {
          display: block;
          font-size: 12px;
          letter-spacing: 2px;
          color: #888;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #00ff9d;
          text-shadow: 0 0 20px rgba(0, 255, 157, 0.4);
        }

        /* Info Cards */
        .info-card,
        .social-card {
          background: rgba(12, 3, 6, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.35);
          border-radius: 22px;
          padding: 28px 26px;
          margin-bottom: 24px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
        }

        .section-title {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #ff1744;
          margin: 0 0 20px;
          text-shadow: 0 0 15px rgba(255, 23, 68, 0.5);
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .row:last-child {
          border-bottom: none;
        }

        .row-label {
          font-size: 13px;
          color: #888;
          letter-spacing: 0.5px;
        }

        .row-value {
          font-size: 14px;
          font-weight: 600;
          color: #00ff9d;
          text-align: right;
        }

        /* Social */
        .social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 22px;
          border-radius: 30px;
          border: 1px solid rgba(255, 23, 68, 0.5);
          color: #ff4d6d;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          text-decoration: none;
          transition: all 0.3s ease;
          background: rgba(255, 23, 68, 0.08);
        }

        .social-btn:hover {
          background: linear-gradient(135deg, #ff1744, #c4002b);
          border-color: #ff1744;
          color: white;
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.45);
          transform: translateY(-2px);
        }

        /* Loading */
        .loading-screen {
          min-height: 100vh;
          background: #050505;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
        }

        .loader {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 23, 68, 0.15);
          border-top-color: #ff1744;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-screen p {
          font-size: 13px;
          letter-spacing: 3px;
          color: #ff4d6d;
          font-weight: 600;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 700px) {
          .hero-card {
            flex-direction: column;
            text-align: center;
            gap: 24px;
            padding: 28px 20px;
          }

          .hero-info h1 {
            font-size: 32px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .row-value {
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      <strong className="row-value">{value || "N/A"}</strong>
    </div>
  );
}
