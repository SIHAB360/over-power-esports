"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function PlayerDashboard() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role?.toLowerCase() !== "player") {
        router.push("/");
        return;
      }

      await loadPlayer(user.id);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load player dashboard.");
      setLoading(false);
    }
  };

  const loadPlayer = async (userId) => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("PLAYER LOAD ERROR:", error);
      setErrorMessage("Player profile could not be found.");
      setLoading(false);
      return;
    }

    setPlayer(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") return "N/A";
    return value;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const listFromValue = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loader"></div>
        <p>LOADING PLAYER PROFILE</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            background: #050505;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            color: #fff;
          }
          .loader {
            width: 52px;
            height: 52px;
            border: 3px solid rgba(255, 23, 68, 0.15);
            border-top-color: #ff1744;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          p {
            font-size: 12px;
            letter-spacing: 3px;
            color: #ff4d6d;
            font-weight: 600;
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

  if (errorMessage) {
    return (
      <main className="error-screen">
        <h1>PLAYER DASHBOARD</h1>
        <p>{errorMessage}</p>
        <button onClick={() => router.push("/login")}>RETURN TO LOGIN</button>
        <style jsx>{`
          .error-screen {
            min-height: 100vh;
            background: #050505;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            text-align: center;
            padding: 30px;
          }
          h1 {
            font-size: 28px;
            margin: 0;
          }
          p {
            color: #aaa;
            margin: 0;
          }
          button {
            margin-top: 12px;
            border: 1px solid #ff1744;
            background: rgba(255, 23, 68, 0.1);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
          }
        `}</style>
      </main>
    );
  }

  const expertWeapons = listFromValue(player?.expert_weapon);
  const internetConnections = listFromValue(player?.internet_connection);

  return (
    <main className="dashboard">
      {/* Background Glows */}
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      <div className="container">
        {/* Top Bar */}
        <header className="topbar">
          <div className="brand">
            <div className="brand-logo">OP</div>
            <div>
              <strong>OVER POWER</strong>
              <span>PLAYER DASHBOARD</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            LOGOUT
          </button>
        </header>

        {/* Hero Card */}
        <section className="hero-card">
          <div className="avatar-wrap">
            {player?.profile_image ? (
              <img src={player.profile_image} alt="Player" />
            ) : (
              <div className="avatar-fallback">
                {player?.full_name?.charAt(0) || "P"}
              </div>
            )}
          </div>

          <h1 className="player-name">{displayValue(player?.full_name)}</h1>
          <p className="player-ign">{displayValue(player?.ign)}</p>

          <div className="badges">
            {player?.primary_role && (
              <span className="badge badge-primary">{player.primary_role}</span>
            )}
            {player?.team_name && (
              <span className="badge badge-team">{player.team_name}</span>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="stats-row">
          <div className="stat-box">
            <span className="stat-icon">⚔</span>
            <div>
              <span className="stat-label">MATCHES</span>
              <strong>{player?.matches_played || 0}</strong>
            </div>
          </div>
          <div className="stat-box">
            <span className="stat-icon">🏆</span>
            <div>
              <span className="stat-label">WINS</span>
              <strong>{player?.wins || 0}</strong>
            </div>
          </div>
          <div className="stat-box">
            <span className="stat-icon">💀</span>
            <div>
              <span className="stat-label">KILLS</span>
              <strong>{player?.total_kills || 0}</strong>
            </div>
          </div>
        </section>

        {/* Player Information */}
        <section className="section-card">
          <h2 className="section-title">PLAYER INFORMATION</h2>
          <div className="info-grid">
            <div className="info-item">
              <span>FREE FIRE UID</span>
              <strong>{displayValue(player?.freefire_uid)}</strong>
            </div>
            <div className="info-item">
              <span>COUNTRY</span>
              <strong>{displayValue(player?.country)}</strong>
            </div>
            <div className="info-item">
              <span>AGE</span>
              <strong>{displayValue(player?.age)}</strong>
            </div>
            <div className="info-item">
              <span>PHONE</span>
              <strong>{displayValue(player?.phone)}</strong>
            </div>
            <div className="info-item">
              <span>JOINING DATE</span>
              <strong>{formatDate(player?.joining_date)}</strong>
            </div>
            <div className="info-item">
              <span>PREVIOUS TEAM</span>
              <strong>{displayValue(player?.previous_team)}</strong>
            </div>
          </div>
        </section>

        {/* Gaming Profile */}
        <section className="section-card">
          <h2 className="section-title">GAMING PROFILE</h2>
          <div className="info-grid">
            <div className="info-item">
              <span>PRIMARY ROLE</span>
              <strong>{displayValue(player?.primary_role)}</strong>
            </div>
            <div className="info-item">
              <span>SECONDARY ROLE</span>
              <strong>{displayValue(player?.secondary_role)}</strong>
            </div>
            <div className="info-item">
              <span>DEVICE</span>
              <strong>{displayValue(player?.device)}</strong>
            </div>
            <div className="info-item">
              <span>INTERNET</span>
              <strong>
                {internetConnections.length > 0
                  ? internetConnections.join(", ")
                  : "N/A"}
              </strong>
            </div>
            <div className="info-item">
              <span>PRACTICE TIME</span>
              <strong>{displayValue(player?.practice_time)}</strong>
            </div>
            <div className="info-item">
              <span>BR K/D RATE</span>
              <strong>{displayValue(player?.average_br_kd_rate)}</strong>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="section-card">
          <h2 className="section-title">EXPERIENCE</h2>
          <div className="experience-row">
            <div className="exp-item">
              <span>Game Experience</span>
              <strong>{displayValue(player?.game_experience)}</strong>
            </div>
            <div className="exp-item">
              <span>Tournament Experience</span>
              <strong>{displayValue(player?.tournament_experience)}</strong>
            </div>
          </div>
        </section>

        {/* Expert Weapons */}
        <section className="section-card">
          <h2 className="section-title">EXPERT WEAPONS</h2>
          <div className="weapons-list">
            {expertWeapons.length > 0 ? (
              expertWeapons.map((weapon, i) => (
                <span key={i} className="weapon-badge">
                  {weapon}
                </span>
              ))
            ) : (
              <span className="empty-text">No weapons added</span>
            )}
          </div>
        </section>

        {/* Social Links */}
        <section className="section-card">
          <h2 className="section-title">SOCIAL LINKS</h2>
          <div className="social-links">
            {player?.facebook_link && (
              <a
                href={player.facebook_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
              >
                Facebook
              </a>
            )}
            {player?.instagram_link && (
              <a
                href={player.instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
              >
                Instagram
              </a>
            )}
            {player?.tiktok_link && (
              <a
                href={player.tiktok_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
              >
                TikTok
              </a>
            )}
            {player?.youtube_link && (
              <a
                href={player.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
              >
                YouTube
              </a>
            )}
            {!player?.facebook_link &&
              !player?.instagram_link &&
              !player?.tiktok_link &&
              !player?.youtube_link && (
                <span className="empty-text">No social links</span>
              )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #050505;
          color: #fff;
          position: relative;
          overflow-x: hidden;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          padding: 24px 16px 60px;
        }

        .bg-glow {
          position: fixed;
          border-radius: 50%;
          filter: blur(160px);
          pointer-events: none;
          z-index: 0;
        }
        .glow-1 {
          width: 500px;
          height: 500px;
          background: #ff1744;
          top: -200px;
          left: -150px;
          opacity: 0.18;
        }
        .glow-2 {
          width: 400px;
          height: 400px;
          background: #7c3aed;
          bottom: -100px;
          right: -100px;
          opacity: 0.12;
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 720px;
          margin: 0 auto;
        }

        /* Topbar */
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding: 12px 16px;
          background: rgba(15, 5, 10, 0.7);
          border: 1px solid rgba(255, 23, 68, 0.25);
          border-radius: 16px;
          backdrop-filter: blur(12px);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff1744, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
        }
        .brand strong {
          display: block;
          font-size: 14px;
          letter-spacing: 1px;
        }
        .brand span {
          display: block;
          font-size: 10px;
          color: #888;
          letter-spacing: 1px;
        }
        .logout-btn {
          height: 38px;
          padding: 0 18px;
          border-radius: 10px;
          border: 1px solid rgba(255, 23, 68, 0.4);
          background: rgba(255, 23, 68, 0.1);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          transition: 0.25s;
        }
        .logout-btn:hover {
          background: #ff1744;
          box-shadow: 0 0 20px rgba(255, 23, 68, 0.4);
        }

        /* Hero Card */
        .hero-card {
          background: rgba(14, 4, 8, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.4);
          border-radius: 24px;
          padding: 40px 24px 32px;
          text-align: center;
          margin-bottom: 20px;
          box-shadow: 0 0 40px rgba(255, 23, 68, 0.15);
          position: relative;
          overflow: hidden;
        }
        .hero-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ff1744, transparent);
        }
        .avatar-wrap {
          width: 110px;
          height: 110px;
          margin: 0 auto 20px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #ff1744, #7c3aed);
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.5);
        }
        .avatar-wrap img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #0a0a0a;
          display: block;
        }
        .avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #111;
          border: 3px solid #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 900;
        }
        .player-name {
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 6px;
          letter-spacing: 1px;
        }
        .player-ign {
          font-size: 16px;
          color: #00ff9d;
          font-weight: 700;
          margin: 0 0 18px;
          letter-spacing: 2px;
        }
        .badges {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .badge {
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
        }
        .badge-primary {
          background: linear-gradient(135deg, #ff1744, #c4002b);
          color: #fff;
        }
        .badge-team {
          background: rgba(124, 58, 237, 0.2);
          border: 1px solid rgba(124, 58, 237, 0.5);
          color: #c4b5fd;
        }

        /* Stats */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .stat-box {
          background: rgba(14, 4, 8, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.25);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stat-icon {
          font-size: 22px;
        }
        .stat-label {
          display: block;
          font-size: 10px;
          color: #888;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }
        .stat-box strong {
          font-size: 22px;
          color: #00ff9d;
        }

        /* Section Cards */
        .section-card {
          background: rgba(14, 4, 8, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.25);
          border-radius: 18px;
          padding: 22px 20px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #ff1744;
          margin: 0 0 18px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .info-item span {
          display: block;
          font-size: 10px;
          color: #777;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .info-item strong {
          font-size: 13px;
          font-weight: 600;
          color: #e5e5e5;
          word-break: break-word;
        }

        /* Experience */
        .experience-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .exp-item span {
          display: block;
          font-size: 11px;
          color: #00ff9d;
          margin-bottom: 4px;
        }
        .exp-item strong {
          font-size: 14px;
          color: #fff;
        }

        /* Weapons */
        .weapons-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .weapon-badge {
          padding: 8px 16px;
          border-radius: 30px;
          background: linear-gradient(135deg, #ff1744, #c4002b);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }

        /* Social */
        .social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .social-btn {
          padding: 10px 18px;
          border-radius: 30px;
          border: 1px solid rgba(255, 23, 68, 0.4);
          background: rgba(255, 23, 68, 0.08);
          color: #ff4d6d;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: 0.25s;
        }
        .social-btn:hover {
          background: #ff1744;
          color: #fff;
          box-shadow: 0 0 18px rgba(255, 23, 68, 0.4);
        }
        .empty-text {
          font-size: 13px;
          color: #666;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .stats-row {
            grid-template-columns: 1fr;
          }
          .info-grid {
            grid-template-columns: 1fr 1fr;
          }
          .experience-row {
            grid-template-columns: 1fr;
          }
          .player-name {
            font-size: 26px;
          }
        }
      `}</style>
    </main>
  );
}
