"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function PlayerDashboard() {
  const router = useRouter();
 const [player, setPlayer] = useState(null);
const [loading, setLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState("");

const [allStats, setAllStats] = useState([]);
const [filterType, setFilterType] = useState("all");
const [customFrom, setCustomFrom] = useState("");
const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    checkUser();
  }, []);
useEffect(() => {
  if (!player?.id || !player?.user_id) {
    return;
  }

  console.log(
    "STARTING REALTIME FOR PLAYER:",
    player.id
  );

  const channel = supabase
    .channel(`player-dashboard-${player.id}`)

    /*
      MATCH STATS REALTIME
      No database-side filter.
      We verify player_id inside callback.
    */
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "match_player_stats",
      },
      async (payload) => {
        console.log(
          "REALTIME STATS EVENT:",
          payload
        );

        const changedPlayerId =
          payload?.new?.player_id ||
          payload?.old?.player_id;

        if (
          changedPlayerId === player.id
        ) {
          console.log(
            "THIS PLAYER STATS CHANGED"
          );

          await loadPlayer(
            player.user_id
          );
        }
      }
    )

    /*
      PLAYER EARNINGS REALTIME
    */
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "player_earnings",
      },
      async (payload) => {
        console.log(
          "REALTIME EARNINGS EVENT:",
          payload
        );

        const changedPlayerId =
          payload?.new?.player_id ||
          payload?.old?.player_id;

        if (
          changedPlayerId === player.id
        ) {
          console.log(
            "THIS PLAYER EARNINGS CHANGED"
          );

          await loadPlayer(
            player.user_id
          );
        }
      }
    )

    .subscribe((status, error) => {
      console.log(
        "REALTIME STATUS:",
        status
      );

      if (error) {
        console.error(
          "REALTIME ERROR:",
          error
        );
      }
    });

  return () => {
    console.log(
      "REMOVING REALTIME CHANNEL"
    );

    supabase.removeChannel(channel);
  };
}, [player?.id, player?.user_id]);
  
      async (payload) => {
        console.log(
          "REALTIME EARNINGS EVENT:",
          payload
        );

        await loadPlayer(
          player.user_id
        );
      }
    )

    .subscribe((status) => {
      console.log(
        "REALTIME STATUS:",
        status
      );
    });

  return () => {
    console.log(
      "REMOVING REALTIME CHANNEL"
    );

    supabase.removeChannel(channel);
  };
}, [player?.id, player?.user_id]);
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
  console.log("LOAD PLAYER START", userId);

  /*
    STEP 1
    LOAD CURRENT LOGGED-IN PLAYER
  */

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    console.error("PLAYER LOAD ERROR:", error);

    setErrorMessage("Player profile not found.");
    setLoading(false);
    return;
  }

  /*
    STEP 2
    LOAD ALL-TIME MATCH STATISTICS
  */

  const { data: stats, error: statsError } = await supabase
  .from("match_player_stats")
  .select(`
    id,
    match_id,
    kills,
    assists,
    damage,
    mvp,
    placement,
    matches (
      id,
      match_date,
      created_at,
      match_type,
      status
    )
  `)
  .eq("player_id", data.id);

  if (statsError) {
    console.error("PLAYER STATS ERROR:", statsError);

    setErrorMessage("Player statistics could not be loaded.");
    setLoading(false);
    return;
  }
   setAllStats(stats || []);

  /*
    STEP 3
    LOAD ALL-TIME PLAYER EARNINGS

    IMPORTANT:
    এখানে কোনো date/month filter নেই।

    তাই player যতদিন যত match earning পাবে,
    সব player_earnings.amount যোগ হয়ে
    lifetime total earnings হবে।
  */

  const { data: earnings, error: earningsError } = await supabase
    .from("player_earnings")
    .select("amount")
    .eq("player_id", data.id);

  if (earningsError) {
    console.error("PLAYER EARNINGS ERROR:", earningsError);

    setErrorMessage("Player earnings could not be loaded.");
    setLoading(false);
    return;
  }

  /*
    ALL-TIME STATS CALCULATION
  */

  const matches = stats?.length || 0;

  const kills =
    stats?.reduce(
      (sum, item) => sum + Number(item.kills || 0),
      0
    ) || 0;

  const assists =
    stats?.reduce(
      (sum, item) => sum + Number(item.assists || 0),
      0
    ) || 0;

  const damage =
    stats?.reduce(
      (sum, item) => sum + Number(item.damage || 0),
      0
    ) || 0;

  const mvp =
    stats?.filter(
      (item) => item.mvp === true
    ).length || 0;

  const wins =
    stats?.filter(
      (item) => Number(item.placement) === 1
    ).length || 0;

  /*
    ALL-TIME EARNINGS CALCULATION
  */

  const totalEarnings =
    earnings?.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    ) || 0;

  /*
    FINAL PLAYER DASHBOARD DATA
  */

  setPlayer({
    ...data,

    matches_played: matches,
    wins,
    total_kills: kills,
    total_assists: assists,
    total_damage: damage,
    total_mvp: mvp,

    /*
      Lifetime / All-Time
      কোনো monthly reset নেই।
    */
    total_earnings: totalEarnings,
  });

  setLoading(false);
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const val = (v) => (v === null || v === undefined || v === "" ? "N/A" : v);

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
      .map((i) => i.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>LOADING PROFILE...</p>
        <style jsx>{`
          .loading {
            min-height: 100vh;
            background: #000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: #fff;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #222;
            border-top-color: #ff1744;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          p {
            font-size: 12px;
            letter-spacing: 3px;
            color: #ff4d6d;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="loading">
        <p>{errorMessage}</p>
        <button onClick={() => router.push("/login")}>Go to Login</button>
      </div>
    );
  }

  const weapons = listFromValue(player?.expert_weapon);
  const internet = listFromValue(player?.internet_connection);
/* =========================================================
   CAREER STATS FILTER ENGINE
========================================================= */

const filteredStats = allStats.filter((stat) => {
  if (filterType === "all") {
    return true;
  }

  const matchData = Array.isArray(stat.matches)
    ? stat.matches[0]
    : stat.matches;

  const rawDate =
    matchData?.match_date ||
    matchData?.created_at;

  if (!rawDate) {
    return false;
  }

  const matchDate = new Date(rawDate);

  if (Number.isNaN(matchDate.getTime())) {
    return false;
  }

  const now = new Date();

  /* THIS WEEK */
  if (filterType === "week") {
    const startOfWeek = new Date(now);

    const day = startOfWeek.getDay();
    const diff =
      day === 0
        ? 6
        : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() - diff
    );

    startOfWeek.setHours(
      0,
      0,
      0,
      0
    );

    return matchDate >= startOfWeek &&
      matchDate <= now;
  }

  /* THIS MONTH */
  if (filterType === "month") {
    return (
      matchDate.getFullYear() ===
        now.getFullYear() &&
      matchDate.getMonth() ===
        now.getMonth()
    );
  }

  /* CUSTOM DATE RANGE */
  if (filterType === "custom") {
    if (!customFrom && !customTo) {
      return true;
    }

    let fromDate = null;
    let toDate = null;

    if (customFrom) {
      fromDate = new Date(
        `${customFrom}T00:00:00`
      );
    }

    if (customTo) {
      toDate = new Date(
        `${customTo}T23:59:59`
      );
    }

    if (
      fromDate &&
      matchDate < fromDate
    ) {
      return false;
    }

    if (
      toDate &&
      matchDate > toDate
    ) {
      return false;
    }

    return true;
  }

  return true;
});


/* =========================================================
   FILTERED CAREER CALCULATIONS
========================================================= */

const filteredMatches =
  filteredStats.length;


const filteredWins =
  filteredStats.filter(
    (item) =>
      Number(item.placement) === 1
  ).length;


const filteredKills =
  filteredStats.reduce(
    (sum, item) =>
      sum + Number(item.kills || 0),
    0
  );


const filteredAssists =
  filteredStats.reduce(
    (sum, item) =>
      sum + Number(item.assists || 0),
    0
  );


const filteredDamage =
  filteredStats.reduce(
    (sum, item) =>
      sum + Number(item.damage || 0),
    0
  );


const filteredMVP =
  filteredStats.filter(
    (item) =>
      item.mvp === true
  ).length;


const filteredWinRate =
  filteredMatches > 0
    ? (
        (filteredWins /
          filteredMatches) *
        100
      ).toFixed(1)
    : "0.0";


const averageKills =
  filteredMatches > 0
    ? (
        filteredKills /
        filteredMatches
      ).toFixed(2)
    : "0.00";


const averageDamage =
  filteredMatches > 0
    ? (
        filteredDamage /
        filteredMatches
      ).toFixed(0)
    : "0";


const validPlacements =
  filteredStats
    .map((item) =>
      Number(item.placement)
    )
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value > 0
    );


const bestPlacement =
  validPlacements.length > 0
    ? Math.min(
        ...validPlacements
      )
    : 0;

  return (
    <main className="page">
      {/* Animated Background Lights */}
      <div className="light light-1"></div>
      <div className="light light-2"></div>
      <div className="light light-3"></div>

      <div className="wrap">
        {/* Top Bar */}
        <div className="topbar">
          <div className="logo-area">
            <div className="logo">OP</div>
            <div>
              <b>OVER POWER</b>
              <small>PLAYER DASHBOARD</small>
            </div>
          </div>
          <button className="logout" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>

        {/* Hero */}
        <section className="hero">
          <div className="avatar">
            {player?.profile_image ? (
              <img src={player.profile_image} alt="avatar" />
            ) : (
              <div className="fallback">{player?.full_name?.[0] || "P"}</div>
            )}
          </div>

          <h1>{val(player?.full_name)}</h1>
          <p className="ign">{val(player?.ign)}</p>

          <div className="tags">
            {player?.primary_role && (
              <span className="tag red">{player.primary_role}</span>
            )}
            {player?.team_name && (
              <span className="tag purple">{player.team_name}</span>
            )}
          </div>
        </section>

       {/* Stats */}
<div className="stats">
  <div className="stat">
    <span>⚔</span>
    <div>
      <small>MATCHES</small>
      <b>{player?.matches_played || 0}</b>
    </div>
  </div>

  <div className="stat">
    <span>🏆</span>
    <div>
      <small>WINS</small>
      <b>{player?.wins || 0}</b>
    </div>
  </div>

  <div className="stat">
    <span>💀</span>
    <div>
      <small>KILLS</small>
      <b>{player?.total_kills || 0}</b>
    </div>
  </div>

  <div className="stat earning-stat">
    <span>💰</span>
    <div>
      <small>ALL-TIME EARNINGS</small>

      <b>
        ৳
        {Number(
          player?.total_earnings || 0
        ).toLocaleString("en-BD", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}
      </b>
    </div>
  </div>
</div>

        {/* Player Info */}
        <section className="card card-red">
{/* Career Statistics Filter */}
<section className="career-section">

  <div className="career-header">

    <div>
      <h3>📊 CAREER STATISTICS</h3>
      <p>
        Filter your match performance by time period
      </p>
    </div>

  </div>


  {/* FILTER BUTTONS */}

  <div className="filter-buttons">

    <button
      type="button"
      className={
        filterType === "all"
          ? "filter-btn active"
          : "filter-btn"
      }
      onClick={() =>
        setFilterType("all")
      }
    >
      ALL TIME
    </button>


    <button
      type="button"
      className={
        filterType === "week"
          ? "filter-btn active"
          : "filter-btn"
      }
      onClick={() =>
        setFilterType("week")
      }
    >
      THIS WEEK
    </button>


    <button
      type="button"
      className={
        filterType === "month"
          ? "filter-btn active"
          : "filter-btn"
      }
      onClick={() =>
        setFilterType("month")
      }
    >
      THIS MONTH
    </button>


    <button
      type="button"
      className={
        filterType === "custom"
          ? "filter-btn active"
          : "filter-btn"
      }
      onClick={() =>
        setFilterType("custom")
      }
    >
      CUSTOM DATE
    </button>

  </div>


  {/* CUSTOM DATE RANGE */}

  {filterType === "custom" && (

    <div className="custom-date-filter">

      <div>
        <label>
          FROM DATE
        </label>

        <input
          type="date"
          value={customFrom}
          onChange={(e) =>
            setCustomFrom(
              e.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          TO DATE
        </label>

        <input
          type="date"
          value={customTo}
          min={customFrom || undefined}
          onChange={(e) =>
            setCustomTo(
              e.target.value
            )
          }
        />
      </div>


      <button
        type="button"
        className="clear-date-btn"
        onClick={() => {
          setCustomFrom("");
          setCustomTo("");
        }}
      >
        CLEAR
      </button>

    </div>

  )}


  {/* FILTERED STATS */}

  <div className="career-grid">


    <div className="career-stat">
      <span>⚔️</span>
      <small>MATCHES</small>
      <strong>
        {filteredMatches}
      </strong>
    </div>


    <div className="career-stat">
      <span>🏆</span>
      <small>WINS</small>
      <strong>
        {filteredWins}
      </strong>
    </div>


    <div className="career-stat">
      <span>💀</span>
      <small>KILLS</small>
      <strong>
        {filteredKills}
      </strong>
    </div>


    <div className="career-stat">
      <span>🤝</span>
      <small>ASSISTS</small>
      <strong>
        {filteredAssists}
      </strong>
    </div>


    <div className="career-stat">
      <span>💥</span>
      <small>DAMAGE</small>
      <strong>
        {filteredDamage}
      </strong>
    </div>


    <div className="career-stat">
      <span>⭐</span>
      <small>MVP</small>
      <strong>
        {filteredMVP}
      </strong>
    </div>


    <div className="career-stat">
      <span>📈</span>
      <small>WIN RATE</small>
      <strong>
        {filteredWinRate}%
      </strong>
    </div>


    <div className="career-stat">
      <span>🎯</span>
      <small>AVG KILLS</small>
      <strong>
        {averageKills}
      </strong>
    </div>


    <div className="career-stat">
      <span>🔥</span>
      <small>AVG DAMAGE</small>
      <strong>
        {averageDamage}
      </strong>
    </div>


    <div className="career-stat">
      <span>🥇</span>
      <small>BEST PLACEMENT</small>
      <strong>
        {bestPlacement > 0
          ? `#${bestPlacement}`
          : "N/A"}
      </strong>
    </div>


  </div>

</section>
          
          <h3>PLAYER INFORMATION</h3>
          <div className="grid">
            <div>
              <label>FREE FIRE UID</label>
              <p>{val(player?.freefire_uid)}</p>
            </div>
            <div>
              <label>COUNTRY</label>
              <p>{val(player?.country)}</p>
            </div>
            <div>
              <label>AGE</label>
              <p>{val(player?.age)}</p>
            </div>
            <div>
              <label>PHONE</label>
              <p>{val(player?.phone)}</p>
            </div>
            <div>
              <label>JOINING DATE</label>
              <p>{formatDate(player?.joining_date)}</p>
            </div>
            <div>
              <label>PREVIOUS TEAM</label>
              <p>{val(player?.previous_team)}</p>
            </div>
          </div>
        </section>

        {/* Gaming Profile */}
        <section className="card card-purple">
          <h3>GAMING PROFILE</h3>
          <div className="grid">
            <div>
              <label>PRIMARY ROLE</label>
              <p>{val(player?.primary_role)}</p>
            </div>
            <div>
              <label>SECONDARY ROLE</label>
              <p>{val(player?.secondary_role)}</p>
            </div>
            <div>
              <label>DEVICE</label>
              <p>{val(player?.device)}</p>
            </div>
            <div>
              <label>INTERNET</label>
              <p>{internet.length ? internet.join(", ") : "N/A"}</p>
            </div>
            <div>
              <label>PRACTICE TIME</label>
              <p>{val(player?.practice_time)}</p>
            </div>
            <div>
              <label>BR K/D RATE</label>
              <p>{val(player?.average_br_kd_rate)}</p>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="card card-green">
          <h3>EXPERIENCE</h3>
          <div className="exp">
            <div>
              <label>Game Experience</label>
              <p>{val(player?.game_experience)}</p>
            </div>
            <div>
              <label>Tournament Experience</label>
              <p>{val(player?.tournament_experience)}</p>
            </div>
          </div>
        </section>

        {/* Expert Weapons */}
        <section className="card card-red">
          <h3>EXPERT WEAPONS</h3>
          <div className="weapons">
            {weapons.length > 0 ? (
              weapons.map((w, i) => (
                <span key={i} className="weapon">
                  {w}
                </span>
              ))
            ) : (
              <span className="empty">No weapons added</span>
            )}
          </div>
        </section>

        {/* Social Links */}
        <section className="card card-orange">
          <h3>SOCIAL LINKS</h3>
          <div className="socials">
            {player?.facebook_link && (
              <a
                href={player.facebook_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social"
              >
                Facebook
              </a>
            )}
            {player?.instagram_link && (
              <a
                href={player.instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social"
              >
                Instagram
              </a>
            )}
            {player?.tiktok_link && (
              <a
                href={player.tiktok_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social"
              >
                TikTok
              </a>
            )}
            {player?.youtube_link && (
              <a
                href={player.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="social"
              >
                YouTube
              </a>
            )}
            {!player?.facebook_link &&
              !player?.instagram_link &&
              !player?.tiktok_link &&
              !player?.youtube_link && (
                <span className="empty">No social links</span>
              )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #000;
          color: #fff;
          position: relative;
          overflow-x: hidden;
          font-family: "Inter", system-ui, sans-serif;
          padding: 20px 16px 50px;
        }

        /* ===== Animated Lights ===== */
        .light {
          position: fixed;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
          animation: blink 6s ease-in-out infinite;
        }
        .light-1 {
          width: 480px;
          height: 480px;
          background: #ff1744;
          top: -200px;
          left: -140px;
          opacity: 0.18;
          animation-delay: 0s;
        }
        .light-2 {
          width: 380px;
          height: 380px;
          background: #7c3aed;
          top: 35%;
          right: -120px;
          opacity: 0.12;
          animation-delay: 2s;
        }
        .light-3 {
          width: 320px;
          height: 320px;
          background: #00ff9d;
          bottom: -100px;
          left: 25%;
          opacity: 0.07;
          animation-delay: 4s;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.22;
            transform: scale(1.08);
          }
        }

        .wrap {
          max-width: 680px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        /* Topbar */
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 12px 14px;
          background: rgba(20, 8, 12, 0.85);
          border: 1px solid rgba(255, 23, 68, 0.35);
          border-radius: 14px;
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.1);
        }
        .logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #ff1744, #7c3aed);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 13px;
          box-shadow: 0 0 15px rgba(255, 23, 68, 0.4);
        }
        .logo-area b {
          display: block;
          font-size: 13px;
        }
        .logo-area small {
          display: block;
          font-size: 9px;
          color: #888;
          letter-spacing: 1px;
        }
        .logout {
          height: 36px;
          padding: 0 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 23, 68, 0.5);
          background: rgba(255, 23, 68, 0.12);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.25s;
        }
        .logout:hover {
          background: #ff1744;
          box-shadow: 0 0 18px rgba(255, 23, 68, 0.5);
        }

        /* Hero */
        .hero {
          background: rgba(18, 6, 10, 0.92);
          border: 1px solid rgba(255, 23, 68, 0.4);
          border-radius: 22px;
          padding: 36px 20px 28px;
          text-align: center;
          margin-bottom: 16px;
          box-shadow: 0 0 45px rgba(255, 23, 68, 0.15);
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ff1744, #7c3aed, transparent);
        }
        .avatar {
          width: 100px;
          height: 100px;
          margin: 0 auto 16px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #ff1744, #7c3aed, #00ff9d);
          box-shadow: 0 0 30px rgba(255, 23, 68, 0.5);
        }
        .avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #0a0a0a;
          display: block;
        }
        .fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #111;
          border: 3px solid #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 900;
        }
        .hero h1 {
          font-size: 28px;
          font-weight: 900;
          margin: 0 0 4px;
        }
        .ign {
          color: #00ff9d;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin: 0 0 16px;
          text-shadow: 0 0 12px rgba(0, 255, 157, 0.4);
        }
        .tags {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag {
          padding: 7px 14px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
        }
        .tag.red {
          background: #ff1744;
          color: #fff;
          box-shadow: 0 0 15px rgba(255, 23, 68, 0.4);
        }
        .tag.purple {
          background: rgba(124, 58, 237, 0.25);
          border: 1px solid rgba(124, 58, 237, 0.5);
          color: #c4b5fd;
        }

        /* Stats */
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .stat {
          background: rgba(18, 6, 10, 0.92);
          border: 1px solid rgba(255, 23, 68, 0.3);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 0 20px rgba(255, 23, 68, 0.08);
        }
        .stat span {
          font-size: 20px;
        }
        .stat small {
          display: block;
          font-size: 10px;
          color: #888;
          margin-bottom: 2px;
        }
        .stat b {
          font-size: 20px;
          color: #00ff9d;
          text-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
        }

        /* Cards */
        /* ===== Career Statistics ===== */

.career-section {
  background: rgba(18, 6, 10, 0.92);
  border: 1px solid rgba(255, 23, 68, 0.35);
  border-radius: 18px;
  padding: 22px 18px;
  margin-bottom: 16px;
  box-shadow: 0 0 30px rgba(255, 23, 68, 0.1);
}

.career-header h3 {
  margin: 0;
  color: #ff1744;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 1px;
}

.career-header p {
  margin: 6px 0 0;
  color: #777;
  font-size: 11px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0 16px;
}

.filter-btn {
  border: 1px solid rgba(255, 23, 68, 0.28);
  background: rgba(255, 23, 68, 0.06);
  color: #aaa;
  padding: 9px 13px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.filter-btn:hover {
  color: #fff;
  border-color: #ff1744;
}

.filter-btn.active {
  color: #fff;
  background: #ff1744;
  border-color: #ff1744;
  box-shadow: 0 0 18px rgba(255, 23, 68, 0.35);
}

.custom-date-filter {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  margin-bottom: 18px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.custom-date-filter label {
  display: block;
  margin-bottom: 6px;
  color: #777;
  font-size: 9px;
  font-weight: 800;
}

.custom-date-filter input {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  color: white;
  color-scheme: dark;
  background: #09090c;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9px;
  outline: none;
}

.clear-date-btn {
  height: 40px;
  padding: 0 15px;
  border-radius: 9px;
  border: 1px solid rgba(255, 23, 68, 0.4);
  background: rgba(255, 23, 68, 0.1);
  color: #ff4d6d;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.career-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.career-stat {
  min-height: 105px;
  padding: 14px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 23, 68, 0.16);
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.career-stat span {
  font-size: 18px;
  margin-bottom: 7px;
}

.career-stat small {
  color: #777;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.7px;
}

.career-stat strong {
  margin-top: 5px;
  color: #00ff9d;
  font-size: 18px;
  font-weight: 900;
}

@media (max-width: 650px) {
  .career-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .custom-date-filter {
    grid-template-columns: 1fr;
  }

  .clear-date-btn {
    width: 100%;
  }
}
        .card {
          background: rgba(18, 6, 10, 0.92);
          border-radius: 16px;
          padding: 20px 18px;
          margin-bottom: 14px;
          position: relative;
          overflow: hidden;
        }
        .card h3 {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin: 0 0 16px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px 12px;
        }
        .grid label {
          display: block;
          font-size: 10px;
          color: #777;
          margin-bottom: 3px;
        }
        .grid p {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #eee;
          word-break: break-word;
        }

        /* Card Color Variants */
        .card-red {
          border: 1px solid rgba(255, 23, 68, 0.35);
          box-shadow: 0 0 25px rgba(255, 23, 68, 0.1);
        }
        .card-red h3 {
          color: #ff1744;
        }
        .card-red::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #ff1744;
          box-shadow: 0 0 12px #ff1744;
        }

        .card-purple {
          border: 1px solid rgba(124, 58, 237, 0.35);
          box-shadow: 0 0 25px rgba(124, 58, 237, 0.1);
        }
        .card-purple h3 {
          color: #c084fc;
        }
        .card-purple::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #7c3aed;
          box-shadow: 0 0 12px #7c3aed;
        }

        .card-green {
          border: 1px solid rgba(0, 255, 157, 0.3);
          box-shadow: 0 0 25px rgba(0, 255, 157, 0.08);
        }
        .card-green h3 {
          color: #00ff9d;
        }
        .card-green::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #00ff9d;
          box-shadow: 0 0 12px #00ff9d;
        }

        .card-orange {
          border: 1px solid rgba(255, 140, 0, 0.35);
          box-shadow: 0 0 25px rgba(255, 140, 0, 0.1);
        }
        .card-orange h3 {
          color: #ff9f1c;
        }
        .card-orange::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #ff9f1c;
          box-shadow: 0 0 12px #ff9f1c;
        }

        /* Experience */
        .exp {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .exp label {
          display: block;
          font-size: 11px;
          color: #00ff9d;
          margin-bottom: 4px;
        }
        .exp p {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        /* Weapons */
        .weapons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .weapon {
          padding: 8px 16px;
          border-radius: 30px;
          background: #ff1744;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 0 15px rgba(255, 23, 68, 0.4);
        }

        /* Social */
        .socials {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .social {
          padding: 10px 18px;
          border-radius: 30px;
          border: 1px solid rgba(255, 140, 0, 0.45);
          background: rgba(255, 140, 0, 0.1);
          color: #ff9f1c;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: 0.25s;
        }
        .social:hover {
          background: #ff9f1c;
          color: #000;
          box-shadow: 0 0 18px rgba(255, 140, 0, 0.5);
        }
        .empty {
          font-size: 13px;
          color: #666;
        }

        /* Responsive */
        @media (max-width: 560px) {
          .stats {
            grid-template-columns: 1fr;
          }
          .grid {
            grid-template-columns: 1fr 1fr;
          }
          .exp {
            grid-template-columns: 1fr;
          }
          .hero h1 {
            font-size: 24px;
          }
          .card {
            padding: 18px 16px;
          }
        }
      `}</style>
    </main>
  );
}
