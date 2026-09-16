"use client";

import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PlayerProfilePage() {
  const params = useParams();
  const id = params?.id;

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPlayer();
    }
  }, [id]);

  const fetchPlayer = async () => {
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
      <main className="loading-page">
        <div className="loader-ring"></div>
        <span>LOADING PLAYER</span>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: #030303;
            color: #ff1744;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            font-weight: 700;
            letter-spacing: 3px;
          }

          .loader-ring {
            width: 55px;
            height: 55px;
            border-radius: 50%;
            border: 3px solid rgba(255, 23, 68, 0.2);
            border-top-color: #ff1744;
            border-right-color: #ff1744;
            animation: spin 0.8s linear infinite;
            box-shadow: 0 0 25px rgba(255, 23, 68, 0.6);
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

  if (!player) {
    return (
      <main className="loading-page">
        PLAYER NOT FOUND

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: #030303;
            color: #ff1744;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
            font-weight: 800;
            letter-spacing: 4px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">

      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <div className="profile">

        <section className="hero">

          <div className="hero-image-wrap">
            <img
              src={
                player.profile_image ||
                player.avatar_url ||
                "/default.png"
              }
              alt={player.ign || player.full_name || "Player"}
              className="hero-image"
            />

            <div className="image-glow"></div>
          </div>

          <div className="hero-content">

            <div className="eyebrow">
              OVER POWER ESPORTS
            </div>

            <h1>
              {player.ign || player.full_name || "PLAYER"}
            </h1>

            <div className="role">
              {player.primary_role || player.position || "PLAYER"}
            </div>

            <div className="team">
              TEAM : <span>{player.team_name || "NO TEAM"}</span>
            </div>

            <div className="status-badge">
              <i></i>
              {player.status || "pending"}
            </div>

          </div>

        </section>


        <section className="stats">

          <Stat
            title="MATCHES"
            value={player.matches_played ?? 0}
          />

          <Stat
            title="WINS"
            value={player.wins ?? 0}
          />

          <Stat
            title="TOTAL KILLS"
            value={player.total_kills ?? 0}
          />

        </section>


        <InfoSection title="PLAYER INFORMATION">

          <Row
            label="FULL NAME"
            value={player.full_name}
          />

          <Row
            label="IN-GAME NAME"
            value={player.ign}
          />

          <Row
            label="FREE FIRE UID"
            value={player.freefire_uid}
          />

          <Row
            label="EMAIL"
            value={player.email}
          />

          <Row
            label="PHONE"
            value={player.phone}
          />

          <Row
            label="COUNTRY"
            value={player.country}
          />

          <Row
            label="AGE"
            value={player.age}
          />

          <Row
            label="BIRTH DATE"
            value={player.birth_date}
          />

          <Row
            label="FULL ADDRESS"
            value={player.full_address}
          />

          <Row
            label="EXPERIENCE"
            value={player.experience}
          />

        </InfoSection>


        <InfoSection title="GAME DETAILS">

          <Row
            label="PRIMARY ROLE"
            value={player.primary_role}
          />

          <Row
            label="SECONDARY ROLE"
            value={player.secondary_role}
          />

          <Row
            label="DEVICE"
            value={player.device}
          />

          <Row
            label="INTERNET CONNECTION"
            value={player.internet_connection}
          />

          <Row
            label="PRACTICE TIME"
            value={player.practice_time}
          />

          <Row
            label="GAME EXPERIENCE"
            value={player.game_experience}
          />

          <Row
            label="TOURNAMENT EXPERIENCE"
            value={player.tournament_experience}
          />

          <Row
            label="AVERAGE BR K/D"
            value={player.average_br_kd_rate}
          />

          <Row
            label="EXPERT WEAPON"
            value={player.expert_weapon}
          />

        </InfoSection>


        <InfoSection title="TEAM INFORMATION">

          <Row
            label="TEAM"
            value={player.team_name}
          />

          <Row
            label="PREVIOUS TEAM"
            value={player.previous_team}
          />

          <Row
            label="JOINING DATE"
            value={player.joining_date}
          />

        </InfoSection>


        <InfoSection title="SOCIAL MEDIA">

          <div className="social-grid">

            {player.facebook_link && (
              <SocialLink
                name="FACEBOOK"
                url={player.facebook_link}
              />
            )}

            {player.instagram_link && (
              <SocialLink
                name="INSTAGRAM"
                url={player.instagram_link}
              />
            )}

            {player.tiktok_link && (
              <SocialLink
                name="TIKTOK"
                url={player.tiktok_link}
              />
            )}

            {player.youtube_link && (
              <SocialLink
                name="YOUTUBE"
                url={player.youtube_link}
              />
            )}

            {player.social_media_link && (
              <SocialLink
                name="SOCIAL MEDIA"
                url={player.social_media_link}
              />
            )}

          </div>

        </InfoSection>


        <section className="footer-line">
          OVER POWER ESPORTS • PLAYER PROFILE
        </section>

      </div>


      <style jsx>{`

        .page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 55px 20px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255, 0, 55, 0.16),
              transparent 35%
            ),
            radial-gradient(
              circle at 0% 100%,
              rgba(255, 0, 55, 0.08),
              transparent 30%
            ),
            #030303;
          color: white;
        }


        .ambient {
          position: fixed;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          filter: blur(130px);
          pointer-events: none;
          opacity: 0.18;
        }


        .ambient-one {
          background: #ff003c;
          top: -180px;
          left: -150px;
        }


        .ambient-two {
          background: #7a0020;
          bottom: -180px;
          right: -150px;
        }


        .profile {
          position: relative;
          z-index: 2;
          width: min(100%, 980px);
          margin: auto;
        }


        .hero {
          position: relative;
          display: flex;
          align-items: center;
          gap: 42px;
          padding: 34px;
          min-height: 245px;
          overflow: hidden;
          border: 1px solid rgba(255, 23, 68, 0.85);
          border-radius: 28px;
          background:
            linear-gradient(
              135deg,
              rgba(255, 0, 55, 0.14),
              rgba(12, 0, 4, 0.96)
            );
          box-shadow:
            0 0 30px rgba(255, 0, 55, 0.22),
            inset 0 0 40px rgba(255, 0, 55, 0.05);
        }


        .hero::after {
          content: "";
          position: absolute;
          width: 260px;
          height: 2px;
          right: -70px;
          top: 25px;
          transform: rotate(-35deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 23, 68, 0.8),
            transparent
          );
          box-shadow: 0 0 15px #ff1744;
        }


        .hero-image-wrap {
          position: relative;
          flex-shrink: 0;
        }


        .hero-image {
          position: relative;
          z-index: 2;
          width: 175px;
          height: 175px;
          object-fit: cover;
          display: block;
          border-radius: 22px;
          border: 2px solid #ff1744;
          box-shadow:
            0 0 18px rgba(255, 23, 68, 0.9),
            0 0 45px rgba(255, 23, 68, 0.35);
        }


        .image-glow {
          position: absolute;
          inset: 15px;
          border-radius: 20px;
          background: #ff1744;
          filter: blur(35px);
          opacity: 0.22;
        }


        .hero-content {
          position: relative;
          z-index: 2;
          flex: 1;
        }


        .eyebrow {
          margin-bottom: 8px;
          color: #888;
          font-size: 11px;
          letter-spacing: 4px;
        }


        .hero h1 {
          margin: 0;
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1;
          font-weight: 900;
          letter-spacing: 2px;
          color: #ff3158;
          text-shadow:
            0 0 10px rgba(255, 23, 68, 0.8),
            0 0 30px rgba(255, 23, 68, 0.35);
        }


        .role {
          margin-top: 15px;
          color: white;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 2px;
        }


        .team {
          margin-top: 10px;
          color: #00ff88;
          font-size: 18px;
          letter-spacing: 1px;
        }


        .team span {
          font-weight: 700;
        }


        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          padding: 8px 15px;
          border: 1px solid rgba(0, 255, 136, 0.35);
          border-radius: 30px;
          background: rgba(0, 255, 136, 0.06);
          color: #00ff88;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
        }


        .status-badge i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 12px #00ff88;
          animation: blink 1.5s infinite;
        }


        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin: 24px 0;
        }


        .stat {
          position: relative;
          overflow: hidden;
          padding: 24px;
          text-align: center;
          border: 1px solid rgba(255, 23, 68, 0.45);
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 0, 55, 0.12),
              rgba(8, 8, 8, 0.95)
            );
          box-shadow:
            0 0 20px rgba(255, 0, 55, 0.12),
            inset 0 0 20px rgba(255, 0, 55, 0.03);
        }


        .stat::before {
          content: "";
          position: absolute;
          width: 80%;
          height: 1px;
          top: 0;
          left: 10%;
          background: #ff1744;
          box-shadow: 0 0 15px #ff1744;
        }


        .stat-label {
          display: block;
          margin-bottom: 10px;
          color: #777;
          font-size: 11px;
          letter-spacing: 3px;
        }


        .stat-value {
          color: #00ff88;
          font-size: 29px;
          font-weight: 900;
          text-shadow: 0 0 12px rgba(0, 255, 136, 0.45);
        }


        .section {
          position: relative;
          margin-top: 22px;
          padding: 27px;
          border: 1px solid rgba(255, 23, 68, 0.45);
          border-radius: 22px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 0, 55, 0.08),
              rgba(5, 5, 5, 0.96)
            );
          box-shadow:
            0 0 25px rgba(255, 0, 55, 0.08),
            inset 0 0 25px rgba(255, 0, 55, 0.025);
        }


        .section::before {
          content: "";
          position: absolute;
          left: 0;
          top: 24px;
          width: 3px;
          height: 30px;
          border-radius: 0 5px 5px 0;
          background: #ff1744;
          box-shadow: 0 0 15px #ff1744;
        }


        .section-title {
          margin: 0 0 20px;
          color: #ff1744;
          font-size: 21px;
          letter-spacing: 2px;
          text-shadow: 0 0 12px rgba(255, 23, 68, 0.35);
        }


        .rows {
          display: grid;
          grid-template-columns: 1fr;
        }


        .row {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 25px;
          align-items: center;
          min-height: 50px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }


        .row:last-child {
          border-bottom: 0;
        }


        .row-label {
          color: #777;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }


        .row-value {
          color: #00ff88;
          font-size: 14px;
          font-weight: 600;
          text-align: right;
          overflow-wrap: anywhere;
          text-shadow: 0 0 8px rgba(0, 255, 136, 0.15);
        }


        .social-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }


        .social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 125px;
          padding: 12px 18px;
          border: 1px solid rgba(255, 23, 68, 0.7);
          border-radius: 12px;
          color: #ff3158;
          background: rgba(255, 23, 68, 0.04);
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          transition: 0.25s ease;
        }


        .social-link:hover {
          color: white;
          background: #ff1744;
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.55);
          transform: translateY(-3px);
        }


        .no-social {
          color: #666;
          font-size: 13px;
        }


        .footer-line {
          padding: 25px 0 5px;
          text-align: center;
          color: #555;
          font-size: 9px;
          letter-spacing: 4px;
        }


        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.25;
          }
        }


        @media (max-width: 700px) {

          .page {
            padding: 25px 12px;
          }


          .hero {
            flex-direction: column;
            text-align: center;
            padding: 25px 18px;
          }


          .hero-image {
            width: 145px;
            height: 145px;
          }


          .hero h1 {
            font-size: 38px;
          }


          .team {
            font-size: 15px;
          }


          .stats {
            grid-template-columns: 1fr;
          }


          .section {
            padding: 22px 18px;
          }


          .row {
            grid-template-columns: 1fr;
            gap: 5px;
          }


          .row-value {
            text-align: left;
          }


          .social-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }


          .social-link {
            min-width: 0;
          }

        }

      `}</style>

    </main>
  );
}


function InfoSection({ title, children }) {
  return (
    <section className="section">

      <h2 className="section-title">
        {title}
      </h2>

      <div className="rows">
        {children}
      </div>

    </section>
  );
}


function Row({ label, value }) {
  return (
    <div className="row">

      <span className="row-label">
        {label}
      </span>

      <strong className="row-value">
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? String(value)
          : "N/A"}
      </strong>

    </div>
  );
}


function Stat({ title, value }) {
  return (
    <div className="stat">

      <span className="stat-label">
        {title}
      </span>

      <strong className="stat-value">
        {value}
      </strong>

    </div>
  );
}


function SocialLink({ name, url }) {
  return (
    <a
      className="social-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {name}
    </a>
  );
}
