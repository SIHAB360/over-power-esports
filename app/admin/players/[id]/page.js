"use client";
import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PlayerProfilePage() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) getPlayer();
  }, [id]);

  const getPlayer = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setPlayer(data);
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
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>

      <div className="container">
        {/* ===== HERO ===== */}
        <section className="hero">
          <div className="avatar-box">
            <img
              src={player.profile_image || player.avatar_url || "/default.png"}
              alt={player.ign || "Player"}
            />
          </div>

          <div className="hero-content">
            <p className="brand">OVER POWER ESPORTS</p>
            <h1 className="ign">{player.ign || player.full_name}</h1>

            <div className="meta-row">
              <span className="role">{player.primary_role || "Player"}</span>
              <span className="team">{player.team_name || "No Team"}</span>
            </div>

            <span
              className={`status-badge ${
                player.status === "approved" ? "approved" : "pending"
              }`}
            >
              {player.status || "pending"}
            </span>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="stats">
          <div className="stat">
            <span className="label">MATCHES</span>
            <strong>{player.matches_played || 0}</strong>
          </div>
          <div className="stat">
            <span className="label">WINS</span>
            <strong>{player.wins || 0}</strong>
          </div>
          <div className="stat">
            <span className="label">KILLS</span>
            <strong>{player.total_kills || 0}</strong>
          </div>
        </section>

        {/* ===== PLAYER INFORMATION ===== */}
        <section className="card card-info">
          <div className="card-header">
            <span className="card-icon">👤</span>
            <h2>PLAYER INFORMATION</h2>
          </div>
          <div className="rows">
            <div className="row">
              <span className="row-label">Full Name</span>
              <span className="row-value">{player.full_name || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">IGN</span>
              <span className="row-value">{player.ign || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Free Fire UID</span>
              <span className="row-value">{player.freefire_uid || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Email</span>
              <span className="row-value">{player.email || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Phone</span>
              <span className="row-value">{player.phone || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Country</span>
              <span className="row-value">{player.country || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Age</span>
              <span className="row-value">{player.age || "N/A"}</span>
            </div>
          </div>
        </section>

        {/* ===== GAME DETAILS ===== */}
        <section className="card card-game">
          <div className="card-header">
            <span className="card-icon">🎮</span>
            <h2>GAME DETAILS</h2>
          </div>
          <div className="rows">
            <div className="row">
              <span className="row-label">Primary Role</span>
              <span className="row-value">{player.primary_role || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Secondary Role</span>
              <span className="row-value">{player.secondary_role || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Device</span>
              <span className="row-value">{player.device || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Internet</span>
              <span className="row-value">{player.internet_connection || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Practice Time</span>
              <span className="row-value">{player.practice_time || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Game Experience</span>
              <span className="row-value">{player.game_experience || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Tournament Experience</span>
              <span className="row-value">{player.tournament_experience || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">BR K/D Rate</span>
              <span className="row-value">{player.average_br_kd_rate || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Expert Weapon</span>
              <span className="row-value">{player.expert_weapon || "N/A"}</span>
            </div>
          </div>
        </section>

        {/* ===== TEAM HISTORY ===== */}
        <section className="card card-team">
          <div className="card-header">
            <span className="card-icon">🏆</span>
            <h2>TEAM HISTORY</h2>
          </div>
          <div className="rows">
            <div className="row">
              <span className="row-label">Previous Team</span>
              <span className="row-value">{player.previous_team || "N/A"}</span>
            </div>
            <div className="row">
              <span className="row-label">Joining Date</span>
              <span className="row-value">{player.joining_date || "N/A"}</span>
            </div>
          </div>
        </section>

        {/* ===== SOCIAL LINKS ===== */}
        <section className="card card-social">
          <div className="card-header">
            <span className="card-icon">🔗</span>
            <h2>SOCIAL LINKS</h2>
          </div>
          <div className="socials">
            {player.facebook_link && (
              <a
                href={player.facebook_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
              >
                Facebook
              </a>
            )}
            {player.instagram_link && (
              <a
                href={player.instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
              >
                Instagram
              </a>
            )}
            {player.youtube_link && (
              <a
                href={player.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
              >
                YouTube
              </a>
            )}
            {player.tiktok_link && (
              <a
                href={player.tiktok_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
              >
                TikTok
              </a>
            )}
            {!player.facebook_link &&
              !player.instagram_link &&
              !player.youtube_link &&
              !player.tiktok_link && (
                <p className="no-social">No social links available</p>
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
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        .bg-glow {
          position: fixed;
          width: 650px;
          height: 650px;
          background: #ff1744;
          filter: blur(180px);
          opacity: 0.14;
          top: -280px;
          left: -180px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-glow-2 {
          position: fixed;
          width: 450px;
          height: 450px;
          background: #ff0040;
          filter: blur(160px);
          opacity: 0.09;
          bottom: -120px;
          right: -80px;
          pointer-events: none;
          z-index: 0;
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 860px;
          margin: 0 auto;
          padding: 40px 20px 70px;
        }

        /* ===== HERO ===== */
        .hero {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 32px;
          border-radius: 24px;
          background: rgba(14, 4, 8, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.45);
          box-shadow: 0 0 40px rgba(255, 23, 68, 0.18);
          margin-bottom: 24px;
        }

        .avatar-box img {
          width: 140px;
          height: 140px;
          object-fit: cover;
          border-radius: 20px;
          border: 2px solid #ff1744;
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.5);
          display: block;
        }

        .hero-content {
          flex: 1;
        }

        .brand {
          font-size: 11px;
          letter-spacing: 3.5px;
          color: #888;
          margin: 0 0 6px;
          font-weight: 500;
        }

        .ign {
          font-size: 36px;
          font-weight: 900;
          margin: 0 0 10px;
          line-height: 1.15;
          background: linear-gradient(180deg, #fff 25%, #ff8a9b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .role {
          font-size: 14px;
          color: #ff4d6d;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .team {
          font-size: 14px;
          color: #00ff9d;
          font-weight: 600;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .status-badge.pending {
          background: rgba(255, 193, 7, 0.12);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.45);
        }

        .status-badge.approved {
          background: rgba(0, 255, 157, 0.12);
          color: #00ff9d;
          border: 1px solid rgba(0, 255, 157, 0.45);
        }

        /* ===== STATS ===== */
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat {
          background: rgba(14, 4, 8, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.3);
          border-radius: 18px;
          padding: 20px 16px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat:hover {
          border-color: rgba(255, 23, 68, 0.55);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 23, 68, 0.15);
        }

        .stat .label {
          display: block;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: #888;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .stat strong {
          font-size: 28px;
          font-weight: 800;
          color: #00ff9d;
        }

        /* ===== CARDS ===== */
        .card {
          border-radius: 20px;
          padding: 0;
          margin-bottom: 22px;
          overflow: hidden;
          background: rgba(12, 3, 6, 0.9);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .card-header h2 {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 2px;
          margin: 0;
        }

        .card-icon {
          font-size: 18px;
        }

        /* Player Information - Red */
        .card-info {
          border: 1px solid rgba(255, 23, 68, 0.4);
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.12);
        }
        .card-info .card-header {
          background: linear-gradient(90deg, rgba(255, 23, 68, 0.15), transparent);
        }
        .card-info .card-header h2 {
          color: #ff1744;
        }

        /* Game Details - Purple */
        .card-game {
          border: 1px solid rgba(168, 85, 247, 0.4);
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.12);
        }
        .card-game .card-header {
          background: linear-gradient(90deg, rgba(168, 85, 247, 0.15), transparent);
        }
        .card-game .card-header h2 {
          color: #c084fc;
        }

        /* Team History - Green */
        .card-team {
          border: 1px solid rgba(0, 255, 157, 0.35);
          box-shadow: 0 0 25px rgba(0, 255, 157, 0.1);
        }
        .card-team .card-header {
          background: linear-gradient(90deg, rgba(0, 255, 157, 0.12), transparent);
        }
        .card-team .card-header h2 {
          color: #00ff9d;
        }

        /* Social - Orange */
        .card-social {
          border: 1px solid rgba(255, 140, 0, 0.35);
          box-shadow: 0 0 25px rgba(255, 140, 0, 0.1);
        }
        .card-social .card-header {
          background: linear-gradient(90deg, rgba(255, 140, 0, 0.12), transparent);
        }
        .card-social .card-header h2 {
          color: #ff9f1c;
        }

        /* ===== ROWS (Fixed) ===== */
        .rows {
          padding: 8px 24px 16px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .row:last-child {
          border-bottom: none;
        }

        .row-label {
          font-size: 13px;
          color: #999;
          font-weight: 500;
          min-width: 180px;
          flex-shrink: 0;
        }

        .row-value {
          font-size: 14px;
          font-weight: 600;
          color: #e8e8e8;
          text-align: right;
          flex: 1;
          word-break: break-word;
        }

        /* ===== SOCIAL ===== */
        .socials {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 16px 24px 20px;
        }

        .social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          border-radius: 30px;
          border: 1px solid rgba(255, 140, 0, 0.45);
          background: rgba(255, 140, 0, 0.08);
          color: #ff9f1c;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .social-btn:hover {
          background: linear-gradient(135deg, #ff9f1c, #e67e00);
          border-color: #ff9f1c;
          color: #fff;
          box-shadow: 0 0 20px rgba(255, 140, 0, 0.4);
          transform: translateY(-2px);
        }

        .no-social {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        /* ===== LOADING ===== */
        .loading-screen {
          min-height: 100vh;
          background: #050505;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .loader {
          width: 46px;
          height: 46px;
          border: 3px solid rgba(255, 23, 68, 0.15);
          border-top-color: #ff1744;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-screen p {
          font-size: 13px;
          letter-spacing: 2.5px;
          color: #ff4d6d;
          font-weight: 600;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 640px) {
          .hero {
            flex-direction: column;
            text-align: center;
            gap: 20px;
            padding: 24px 18px;
          }

          .ign {
            font-size: 28px;
          }

          .meta-row {
            justify-content: center;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .row-label {
            min-width: auto;
          }

          .row-value {
            text-align: left;
          }

          .card-header {
            padding: 16px 18px;
          }

          .rows {
            padding: 6px 18px 14px;
          }

          .socials {
            padding: 14px 18px 18px;
          }
        }
      `}</style>
    </main>
  );
}
