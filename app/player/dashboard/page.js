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

      if (
        profileError ||
        profile?.role?.toLowerCase() !== "player"
      ) {
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

      setErrorMessage(
        "Player profile could not be found."
      );

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
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

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

    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }

    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };


  if (loading) {
    return (
      <main className="op-player-loading">
        <div className="op-player-loader"></div>

        <p>LOADING PLAYER PROFILE</p>

        <style jsx>{`
          .op-player-loading {
            min-height: 100vh;
            background: #030305;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 24px;
          }

          .op-player-loader {
            width: 58px;
            height: 58px;
            border-radius: 50%;
            border: 3px solid rgba(255, 255, 255, 0.08);
            border-top-color: #ff174d;
            border-right-color: #8f2cff;
            animation: spin 0.85s linear infinite;
            box-shadow: 0 0 28px rgba(255, 23, 77, 0.35);
          }

          p {
            margin: 0;
            color: #8b8b97;
            font-size: 12px;
            letter-spacing: 3px;
            font-weight: 800;
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
      <main className="op-player-error">
        <div>
          <h1>PLAYER DASHBOARD</h1>
          <p>{errorMessage}</p>

          <button onClick={() => router.push("/login")}>
            RETURN TO LOGIN
          </button>
        </div>

        <style jsx>{`
          .op-player-error {
            min-height: 100vh;
            background: #030305;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 30px;
          }

          h1 {
            font-size: 34px;
          }

          p {
            color: #aaa;
          }

          button {
            margin-top: 20px;
            border: 1px solid #ff174d;
            background: rgba(255, 23, 77, 0.08);
            color: white;
            padding: 14px 25px;
            border-radius: 12px;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }


  const internetConnections = listFromValue(
    player?.internet_connection
  );

  const expertWeapons = listFromValue(
    player?.expert_weapon
  );


  const basicInformation = [
    {
      label: "FREE FIRE UID",
      value: player?.freefire_uid,
    },
    {
      label: "EMAIL ADDRESS",
      value: player?.email,
    },
    {
      label: "PHONE NUMBER",
      value: player?.phone,
    },
    {
      label: "AGE",
      value: player?.age,
    },
    {
      label: "BIRTH DATE",
      value: formatDate(player?.birth_date),
    },
    {
      label: "JOINING DATE",
      value: formatDate(player?.joining_date),
    },
    {
      label: "TEAM",
      value: player?.team_name,
    },
    {
      label: "PREVIOUS TEAM",
      value: player?.previous_team,
    },
  ];


  const gamingInformation = [
    {
      label: "PRIMARY ROLE",
      value: player?.primary_role,
    },
    {
      label: "SECONDARY ROLE",
      value: player?.secondary_role,
    },
    {
      label: "DEVICE",
      value: player?.device,
    },
    {
      label: "PRACTICE TIME",
      value: player?.practice_time,
    },
    {
      label: "AVERAGE BR K/D",
      value: player?.average_br_kd_rate,
    },
    {
      label: "GAME EXPERIENCE",
      value: player?.game_experience,
    },
    {
      label: "TOURNAMENT EXPERIENCE",
      value: player?.tournament_experience,
    },
  ];


  const stats = [
    {
      title: "MATCHES",
      value: player?.matches_played || 0,
      subtitle: "PLAYED",
    },
    {
      title: "WINS",
      value: player?.wins || 0,
      subtitle: "VICTORIES",
    },
    {
      title: "KILLS",
      value: player?.total_kills || 0,
      subtitle: "TOTAL",
    },
    {
      title: "BR K/D",
      value: player?.average_br_kd_rate || "0",
      subtitle: "AVERAGE",
    },
  ];


  const socialLinks = [
    {
      name: "FACEBOOK",
      value: player?.facebook_link,
      short: "FB",
    },
    {
      name: "INSTAGRAM",
      value: player?.instagram_link,
      short: "IG",
    },
    {
      name: "TIKTOK",
      value: player?.tiktok_link,
      short: "TT",
    },
    {
      name: "YOUTUBE",
      value: player?.youtube_link,
      short: "YT",
    },
  ].filter((item) => item.value);


  return (
    <main className="op-player-dashboard">

      {/* BACKGROUND EFFECTS */}

      <div className="op-bg op-bg-one"></div>
      <div className="op-bg op-bg-two"></div>
      <div className="op-bg op-bg-three"></div>


      <div className="op-dashboard-shell">

        {/* TOP NAV */}

        <header className="op-topbar">

          <div className="op-brand">
            <div className="op-brand-mark">
              OP
            </div>

            <div>
              <strong>OVER POWER</strong>
              <span>PLAYER COMMAND CENTER</span>
            </div>
          </div>


          <button
            className="op-logout"
            onClick={handleLogout}
          >
            LOGOUT
          </button>

        </header>



        {/* HERO */}

        <section className="op-hero">

          <div className="op-hero-shine"></div>


          <div className="op-avatar-area">

            <div className="op-avatar-ring">

              {player?.profile_image ? (
                <img
                  src={player.profile_image}
                  alt={player?.full_name || "Player"}
                  className="op-avatar"
                />
              ) : (
                <div className="op-avatar-fallback">
                  {player?.full_name?.charAt(0) || "P"}
                </div>
              )}

            </div>

            <div className="op-online-dot"></div>

          </div>


          <div className="op-hero-content">

            <span className="op-eyebrow">
              OFFICIAL PLAYER PROFILE
            </span>

            <h1>
              {displayValue(player?.full_name)}
            </h1>

            <div className="op-ign">
              {displayValue(player?.ign)}
            </div>


            <div className="op-hero-badges">

              {player?.primary_role && (
                <span className="op-badge op-badge-red">
                  {player.primary_role}
                </span>
              )}

              {player?.secondary_role && (
                <span className="op-badge">
                  {player.secondary_role}
                </span>
              )}

              {player?.team_name && (
                <span className="op-badge op-badge-team">
                  {player.team_name}
                </span>
              )}

            </div>

          </div>


          <div className="op-hero-meta">

            <div>
              <span>PLAYER UID</span>
              <strong>
                {displayValue(player?.freefire_uid)}
              </strong>
            </div>

            <div>
              <span>JOINED</span>
              <strong>
                {formatDate(player?.joining_date)}
              </strong>
            </div>

          </div>

        </section>



        {/* STATS */}

        <section className="op-stat-grid">

          {stats.map((stat) => (
            <article
              className="op-stat-card"
              key={stat.title}
            >

              <span className="op-stat-label">
                {stat.title}
              </span>

              <strong className="op-stat-value">
                {stat.value}
              </strong>

              <span className="op-stat-subtitle">
                {stat.subtitle}
              </span>

            </article>
          ))}

        </section>



        {/* PLAYER INFORMATION */}

        <section className="op-panel">

          <div className="op-section-heading">

            <div>
              <span>01</span>

              <div>
                <small>IDENTITY</small>
                <h2>PLAYER INFORMATION</h2>
              </div>
            </div>

          </div>


          <div className="op-information-grid">

            {basicInformation.map((item) => (
              <div
                className="op-info-box"
                key={item.label}
              >

                <span>
                  {item.label}
                </span>

                <strong>
                  {displayValue(item.value)}
                </strong>

              </div>
            ))}

          </div>


          <div className="op-address-box">

            <span>FULL ADDRESS</span>

            <strong>
              {displayValue(player?.full_address)}
            </strong>

          </div>

        </section>



        {/* GAMING PROFILE */}

        <section className="op-panel">

          <div className="op-section-heading">

            <div>
              <span>02</span>

              <div>
                <small>PERFORMANCE SETUP</small>
                <h2>GAMING PROFILE</h2>
              </div>
            </div>

          </div>


          <div className="op-information-grid">

            {gamingInformation.map((item) => (
              <div
                className="op-info-box"
                key={item.label}
              >

                <span>
                  {item.label}
                </span>

                <strong>
                  {displayValue(item.value)}
                </strong>

              </div>
            ))}

          </div>


          <div className="op-subsection">

            <div className="op-mini-title">
              INTERNET CONNECTION
            </div>

            <div className="op-chip-list">

              {internetConnections.length > 0 ? (
                internetConnections.map((item) => (
                  <span
                    className="op-chip"
                    key={item}
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="op-empty">
                  N/A
                </span>
              )}

            </div>

          </div>

        </section>



        {/* EXPERT WEAPONS */}

        <section className="op-panel">

          <div className="op-section-heading">

            <div>
              <span>03</span>

              <div>
                <small>COMBAT LOADOUT</small>
                <h2>EXPERT WEAPONS</h2>
              </div>
            </div>

          </div>


          <div className="op-weapon-grid">

            {expertWeapons.length > 0 ? (

              expertWeapons.map((weapon, index) => (
                <div
                  className="op-weapon-card"
                  key={`${weapon}-${index}`}
                >

                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <strong>
                    {weapon}
                  </strong>

                </div>
              ))

            ) : (

              <div className="op-empty">
                No expert weapon added
              </div>

            )}

          </div>

        </section>



        {/* CONTACT */}

        <section className="op-panel">

          <div className="op-section-heading">

            <div>
              <span>04</span>

              <div>
                <small>PLAYER NETWORK</small>
                <h2>CONTACT & SOCIAL</h2>
              </div>
            </div>

          </div>


          <div className="op-contact-grid">

            <div className="op-contact-card">

              <span>EMAIL</span>

              <strong>
                {displayValue(player?.email)}
              </strong>

            </div>


            <div className="op-contact-card">

              <span>PHONE</span>

              <strong>
                {displayValue(player?.phone)}
              </strong>

            </div>

          </div>


          <div className="op-social-grid">

            {socialLinks.length > 0 ? (

              socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="op-social-card"
                >

                  <div className="op-social-icon">
                    {social.short}
                  </div>

                  <div>
                    <span>VISIT PROFILE</span>
                    <strong>{social.name}</strong>
                  </div>

                  <div className="op-social-arrow">
                    ↗
                  </div>

                </a>
              ))

            ) : (

              <div className="op-empty">
                No social links added
              </div>

            )}

          </div>

        </section>


        <footer className="op-footer">

          <span>
            OVER POWER ESPORTS
          </span>

          <small>
            PLAYER COMMAND CENTER
          </small>

        </footer>

      </div>



      <style jsx global>{`

        * {
          box-sizing: border-box;
        }


        body {
          margin: 0;
          background: #030305;
        }


        .op-player-dashboard {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 15% 5%,
              rgba(255, 0, 68, 0.15),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 18%,
              rgba(110, 30, 255, 0.15),
              transparent 30%
            ),
            radial-gradient(
              circle at 50% 90%,
              rgba(0, 174, 255, 0.08),
              transparent 35%
            ),
            #030305;
          color: #ffffff;
          padding: 28px 18px 70px;
        }


        .op-bg {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(140px);
          opacity: 0.2;
        }


        .op-bg-one {
          width: 360px;
          height: 360px;
          background: #ff003c;
          top: -150px;
          left: -120px;
        }


        .op-bg-two {
          width: 420px;
          height: 420px;
          background: #6415ff;
          top: 22%;
          right: -190px;
        }


        .op-bg-three {
          width: 300px;
          height: 300px;
          background: #0077ff;
          bottom: -140px;
          left: 35%;
        }


        .op-dashboard-shell {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }


        /* TOP BAR */


        .op-topbar {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
          padding: 13px 17px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 10, 15, 0.72);
          border-radius: 18px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.35);
        }


        .op-brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }


        .op-brand-mark {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 1px;
          background:
            linear-gradient(
              135deg,
              #ff174d,
              #8f2cff
            );
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow:
            0 0 22px rgba(255, 23, 77, 0.35);
        }


        .op-brand strong {
          display: block;
          font-size: 15px;
          letter-spacing: 1.5px;
        }


        .op-brand span {
          display: block;
          margin-top: 3px;
          color: #666675;
          font-size: 9px;
          letter-spacing: 2px;
          font-weight: 800;
        }


        .op-logout {
          height: 42px;
          padding: 0 19px;
          border-radius: 11px;
          border: 1px solid rgba(255, 42, 84, 0.4);
          background: rgba(255, 20, 65, 0.07);
          color: #fff;
          font-size: 10px;
          letter-spacing: 1.6px;
          font-weight: 900;
          cursor: pointer;
          transition: 0.25s ease;
        }


        .op-logout:hover {
          background: #ff174d;
          border-color: #ff174d;
          box-shadow:
            0 0 24px rgba(255, 23, 77, 0.38);
          transform: translateY(-1px);
        }


        /* HERO */


        .op-hero {
          min-height: 310px;
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 38px;
          padding: 45px;
          border-radius: 28px;
          border: 1px solid rgba(255, 27, 78, 0.28);
          background:
            linear-gradient(
              135deg,
              rgba(32, 8, 17, 0.94),
              rgba(8, 8, 14, 0.96)
            );
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.55),
            0 0 45px rgba(255, 0, 65, 0.09),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }


        .op-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(255, 23, 77, 0.055),
              transparent 35%
            );
          pointer-events: none;
        }


        .op-hero-shine {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          right: -160px;
          top: -190px;
          background: rgba(124, 34, 255, 0.26);
          filter: blur(90px);
        }


        .op-avatar-area {
          position: relative;
          z-index: 2;
        }


        .op-avatar-ring {
          width: 170px;
          height: 170px;
          padding: 4px;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #ff174d,
              #ff6584,
              #8f2cff
            );
          box-shadow:
            0 0 38px rgba(255, 23, 77, 0.38);
        }


        .op-avatar {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          border-radius: 50%;
          border: 5px solid #09090d;
        }


        .op-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #0b0b10;
          border: 5px solid #09090d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 52px;
          font-weight: 900;
        }


        .op-online-dot {
          position: absolute;
          width: 19px;
          height: 19px;
          right: 14px;
          bottom: 16px;
          border-radius: 50%;
          background: #14f195;
          border: 4px solid #09090d;
          box-shadow:
            0 0 15px rgba(20, 241, 149, 0.7);
        }


        .op-hero-content {
          position: relative;
          z-index: 2;
          min-width: 0;
        }


        .op-eyebrow {
          display: block;
          color: #ff496d;
          font-size: 10px;
          letter-spacing: 3px;
          font-weight: 900;
          margin-bottom: 12px;
        }


        .op-hero-content h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 60px);
          line-height: 1;
          letter-spacing: -1.5px;
          overflow-wrap: anywhere;
        }


        .op-ign {
          margin-top: 14px;
          color: #16f5a0;
          font-size: 18px;
          letter-spacing: 3px;
          font-weight: 800;
          text-transform: uppercase;
          text-shadow:
            0 0 17px rgba(22, 245, 160, 0.28);
        }


        .op-hero-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 25px;
        }


        .op-badge {
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.055);
          color: #d9d9df;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }


        .op-badge-red {
          background: rgba(255, 23, 77, 0.12);
          border-color: rgba(255, 23, 77, 0.36);
          color: #ff6685;
        }


        .op-badge-team {
          background: rgba(132, 52, 255, 0.12);
          border-color: rgba(132, 52, 255, 0.36);
          color: #b891ff;
        }


        .op-hero-meta {
          width: 205px;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }


        .op-hero-meta div {
          padding: 17px;
          border-radius: 15px;
          background: rgba(0, 0, 0, 0.29);
          border: 1px solid rgba(255, 255, 255, 0.065);
        }


        .op-hero-meta span {
          display: block;
          color: #62626e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 7px;
        }


        .op-hero-meta strong {
          display: block;
          font-size: 12px;
          overflow-wrap: anywhere;
        }


        /* STATS */


        .op-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-top: 20px;
        }


        .op-stat-card {
          min-height: 150px;
          position: relative;
          overflow: hidden;
          padding: 24px;
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              rgba(18, 18, 25, 0.93),
              rgba(7, 7, 11, 0.96)
            );
          border: 1px solid rgba(255, 255, 255, 0.075);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: 0.3s ease;
        }


        .op-stat-card::after {
          content: "";
          width: 90px;
          height: 90px;
          position: absolute;
          right: -35px;
          bottom: -35px;
          border-radius: 50%;
          background: rgba(255, 23, 77, 0.2);
          filter: blur(27px);
        }


        .op-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 23, 77, 0.25);
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.34);
        }


        .op-stat-label {
          color: #6e6e7b;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }


        .op-stat-value {
          font-size: 42px;
          line-height: 1;
          color: #ffffff;
        }


        .op-stat-subtitle {
          color: #16f5a0;
          font-size: 8px;
          letter-spacing: 1.8px;
          font-weight: 800;
        }


        /* PANELS */


        .op-panel {
          margin-top: 20px;
          padding: 30px;
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              rgba(17, 17, 23, 0.94),
              rgba(7, 7, 11, 0.95)
            );
          border: 1px solid rgba(255, 255, 255, 0.075);
          box-shadow:
            0 25px 65px rgba(0, 0, 0, 0.28);
        }


        .op-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 23px;
          margin-bottom: 23px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.055);
        }


        .op-section-heading > div {
          display: flex;
          align-items: center;
          gap: 15px;
        }


        .op-section-heading > div > span {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff466c;
          background: rgba(255, 23, 77, 0.08);
          border: 1px solid rgba(255, 23, 77, 0.22);
          font-size: 11px;
          font-weight: 900;
        }


        .op-section-heading small {
          display: block;
          color: #676774;
          font-size: 8px;
          letter-spacing: 2px;
          font-weight: 900;
          margin-bottom: 5px;
        }


        .op-section-heading h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: 0.5px;
        }


        .op-information-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }


        .op-info-box {
          min-height: 92px;
          padding: 17px;
          border-radius: 15px;
          background: rgba(0, 0, 0, 0.23);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }


        .op-info-box span,
        .op-address-box span,
        .op-contact-card span {
          display: block;
          color: #62626f;
          font-size: 8px;
          letter-spacing: 1.5px;
          font-weight: 900;
          margin-bottom: 9px;
        }


        .op-info-box strong,
        .op-address-box strong,
        .op-contact-card strong {
          display: block;
          color: #ededf1;
          font-size: 12px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }


        .op-address-box {
          margin-top: 12px;
          padding: 19px;
          border-radius: 15px;
          background: rgba(255, 23, 77, 0.035);
          border: 1px solid rgba(255, 23, 77, 0.1);
        }


        .op-subsection {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.055);
        }


        .op-mini-title {
          color: #676774;
          font-size: 9px;
          letter-spacing: 2px;
          font-weight: 900;
          margin-bottom: 14px;
        }


        .op-chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }


        .op-chip {
          padding: 10px 14px;
          border-radius: 10px;
          color: #dcdce3;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.07);
          font-size: 10px;
          font-weight: 800;
        }


        /* WEAPONS */


        .op-weapon-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }


        .op-weapon-card {
          min-height: 105px;
          position: relative;
          overflow: hidden;
          padding: 20px;
          border-radius: 16px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 23, 77, 0.065),
              rgba(255, 255, 255, 0.025)
            );
          border: 1px solid rgba(255, 23, 77, 0.16);
        }


        .op-weapon-card span {
          display: block;
          color: #ff466c;
          font-size: 9px;
          font-weight: 900;
          margin-bottom: 20px;
        }


        .op-weapon-card strong {
          font-size: 15px;
          letter-spacing: 0.5px;
        }


        /* CONTACT */


        .op-contact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 12px;
        }


        .op-contact-card {
          min-height: 92px;
          padding: 18px;
          border-radius: 15px;
          background: rgba(0, 0, 0, 0.23);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }


        .op-social-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }


        .op-social-card {
          min-height: 82px;
          padding: 14px;
          border-radius: 15px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 13px;
          align-items: center;
          text-decoration: none;
          color: white;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.065);
          transition: 0.25s ease;
        }


        .op-social-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 23, 77, 0.25);
          background: rgba(255, 23, 77, 0.06);
        }


        .op-social-icon {
          width: 43px;
          height: 43px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          background:
            linear-gradient(
              135deg,
              #ff174d,
              #782eff
            );
        }


        .op-social-card span {
          display: block;
          color: #696976;
          font-size: 7px;
          letter-spacing: 1.4px;
          font-weight: 900;
        }


        .op-social-card strong {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          letter-spacing: 0.6px;
        }


        .op-social-arrow {
          color: #ff5072;
          font-size: 17px;
        }


        .op-empty {
          color: #686874;
          font-size: 11px;
        }


        /* FOOTER */


        .op-footer {
          margin-top: 30px;
          text-align: center;
          padding: 20px;
        }


        .op-footer span {
          display: block;
          color: #63636e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }


        .op-footer small {
          display: block;
          margin-top: 5px;
          color: #35353d;
          font-size: 7px;
          letter-spacing: 2px;
        }


        /* TABLET */


        @media (max-width: 950px) {

          .op-hero {
            grid-template-columns: auto 1fr;
          }


          .op-hero-meta {
            grid-column: 1 / -1;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }


          .op-information-grid {
            grid-template-columns: repeat(2, 1fr);
          }


          .op-weapon-grid {
            grid-template-columns: repeat(2, 1fr);
          }

        }


        /* MOBILE */


        @media (max-width: 650px) {

          .op-player-dashboard {
            padding: 12px 10px 45px;
          }


          .op-topbar {
            min-height: 65px;
            padding: 10px;
            border-radius: 15px;
          }


          .op-brand-mark {
            width: 40px;
            height: 40px;
          }


          .op-brand strong {
            font-size: 12px;
          }


          .op-brand span {
            font-size: 6.5px;
            letter-spacing: 1.2px;
          }


          .op-logout {
            height: 38px;
            padding: 0 13px;
            font-size: 8px;
          }


          .op-hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 30px 18px;
            gap: 22px;
            border-radius: 22px;
          }


          .op-avatar-area {
            margin: 0 auto;
          }


          .op-avatar-ring {
            width: 135px;
            height: 135px;
          }


          .op-hero-content h1 {
            font-size: 34px;
          }


          .op-ign {
            font-size: 14px;
          }


          .op-hero-badges {
            justify-content: center;
          }


          .op-hero-meta {
            grid-column: auto;
            grid-template-columns: 1fr 1fr;
          }


          .op-stat-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }


          .op-stat-card {
            min-height: 125px;
            padding: 18px;
          }


          .op-stat-value {
            font-size: 34px;
          }


          .op-panel {
            padding: 20px 15px;
            border-radius: 19px;
          }


          .op-section-heading h2 {
            font-size: 16px;
          }


          .op-section-heading > div > span {
            width: 39px;
            height: 39px;
          }


          .op-information-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }


          .op-info-box {
            min-height: 86px;
            padding: 14px;
          }


          .op-info-box span,
          .op-address-box span,
          .op-contact-card span {
            font-size: 7px;
          }


          .op-info-box strong,
          .op-address-box strong,
          .op-contact-card strong {
            font-size: 10px;
          }


          .op-weapon-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }


          .op-social-grid,
          .op-contact-grid {
            grid-template-columns: 1fr;
          }

        }


        @media (max-width: 410px) {

          .op-information-grid {
            grid-template-columns: 1fr;
          }


          .op-hero-meta {
            grid-template-columns: 1fr;
          }


          .op-stat-grid {
            grid-template-columns: 1fr 1fr;
          }

        }

      `}</style>

    </main>
  );
}
