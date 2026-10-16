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

        if (changedPlayerId === player.id) {
          await loadPlayer(player.user_id);
        }
      }
    )
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

        if (changedPlayerId === player.id) {
          await loadPlayer(player.user_id);
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


  /* Chart series are derived from the same filtered match records as the career stats. */
  const performanceSeries = filteredStats
    .map((stat, index) => {
      const matchData = Array.isArray(stat.matches) ? stat.matches[0] : stat.matches;
      const rawDate = matchData?.match_date || matchData?.created_at;
      const parsedDate = rawDate ? new Date(rawDate) : null;
      const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
      return {
        index,
        date,
        kills: Number(stat.kills || 0),
        assists: Number(stat.assists || 0),
        damage: Number(stat.damage || 0),
      };
    })
    .sort((a, b) => {
      if (a.date && b.date) return a.date.getTime() - b.date.getTime();
      if (a.date) return -1;
      if (b.date) return 1;
      return a.index - b.index;
    })
    .slice(-8);

  const maxMatchOutput = Math.max(
    1,
    ...performanceSeries.flatMap((item) => [item.kills, item.assists])
  );
  const maxMatchDamage = Math.max(1, ...performanceSeries.map((item) => item.damage));
  const barStep = 520 / Math.max(performanceSeries.length, 1);
  const performanceBars = performanceSeries.map((item, index) => ({
    ...item,
    x: 30 + index * barStep,
    killsHeight: Math.max(3, (item.kills / maxMatchOutput) * 108),
    assistsHeight: Math.max(3, (item.assists / maxMatchOutput) * 108),
    label: item.date
      ? item.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      : "M" + (index + 1),
  }));
  const damagePoints = performanceSeries.map((item, index) => ({
    ...item,
    x: 32 + index * (536 / Math.max(performanceSeries.length - 1, 1)),
    y: 150 - (item.damage / maxMatchDamage) * 100,
    label: item.date
      ? item.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      : "M" + (index + 1),
  }));
  const damageLinePoints = damagePoints.map((point) => point.x + "," + point.y).join(" ");
  const damageAreaPath = damagePoints.length
    ? "M " + damagePoints[0].x + " 166 L " +
      damagePoints.map((point) => point.x + " " + point.y).join(" L ") +
      " L " + damagePoints[damagePoints.length - 1].x + " 166 Z"
    : "";

  return (
    <main className="page">
      {/* Animated Background Lights */}
      <div className="light light-1"></div>
      <div className="light light-2"></div>
      <div className="light light-3"></div>

      <div className="wrap">
        <div className="dashboard-layout">

          <div className="dashboard-content">
        {/* Hero */}
        <section className="hero" id="overview">
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

        {/* Performance */}
        <section className="career-shell">
{/* Career Statistics Filter */}
<section className="career-section" id="performance">

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


  <div className="performance-grid">
    <article className="chart-card">
      <div className="chart-heading">
        <div>
          <h4>MATCH PERFORMANCE</h4>
          <p>Kills and assists across recent matches</p>
        </div>
        <span className="chart-chip">LAST {performanceSeries.length}</span>
      </div>
      <div className="chart-legend">
        <span><i className="legend-kills"></i>Kills</span>
        <span><i className="legend-assists"></i>Assists</span>
      </div>
      <svg className="performance-chart" viewBox="0 0 600 215" role="img" aria-label="Bar chart showing kills and assists for recent matches">
        <defs>
          <linearGradient id="opKillsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#35e6ff" />
            <stop offset="100%" stopColor="#1676e8" />
          </linearGradient>
          <linearGradient id="opAssistsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2a7ff" />
            <stop offset="100%" stopColor="#8b3dff" />
          </linearGradient>
        </defs>
        {[55, 90, 125, 160].map((y) => (
          <line key={y} x1="20" y1={y} x2="580" y2={y} className="chart-grid-line" />
        ))}
        {performanceBars.map((item, index) => (
          <g key={item.index + "-" + index}>
            <rect x={item.x + 7} y={165 - item.killsHeight} width="15" height={item.killsHeight} rx="4" fill="url(#opKillsGradient)" />
            <rect x={item.x + 28} y={165 - item.assistsHeight} width="15" height={item.assistsHeight} rx="4" fill="url(#opAssistsGradient)" />
            <text x={item.x + 25} y="191" textAnchor="middle" className="chart-axis-label">{item.label}</text>
          </g>
        ))}
      </svg>
      {performanceSeries.length === 0 && (
        <p className="chart-empty">Match data will appear here after your first recorded match.</p>
      )}
    </article>

    <article className="chart-card">
      <div className="chart-heading">
        <div>
          <h4>DAMAGE TREND</h4>
          <p>Damage output by match</p>
        </div>
        <span className="chart-chip">LIVE DATA</span>
      </div>
      <div className="chart-legend">
        <span><i className="legend-damage"></i>Damage</span>
      </div>
      <svg className="performance-chart" viewBox="0 0 600 215" role="img" aria-label="Line chart showing damage output for recent matches">
        <defs>
          <linearGradient id="opDamageArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34e6b1" stopOpacity=".25" />
            <stop offset="100%" stopColor="#34e6b1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[55, 90, 125, 160].map((y) => (
          <line key={y} x1="20" y1={y} x2="580" y2={y} className="chart-grid-line" />
        ))}
        {damagePoints.length > 0 && <path d={damageAreaPath} fill="url(#opDamageArea)" />}
        {damagePoints.length > 0 && (
          <polyline points={damageLinePoints} fill="none" stroke="#34e6b1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="damage-line" />
        )}
        {damagePoints.map((point, index) => (
          <g key={point.index + "-" + index}>
            <circle cx={point.x} cy={point.y} r="4.5" className="damage-point" />
            <text x={point.x} y="191" textAnchor="middle" className="chart-axis-label">{point.label}</text>
          </g>
        ))}
      </svg>
      {performanceSeries.length === 0 && (
        <p className="chart-empty">Your damage trend will appear when match results are recorded.</p>
      )}
    </article>
  </div>

</section>
        </section>

        <section className="card card-red player-info-card" id="player-information">
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
        <section className="card card-purple" id="gaming-profile">
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
        <section className="card card-green" id="experience">
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
        <section className="card card-red" id="expert-weapons">
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
        <section className="card card-orange" id="social-links">
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
        </div>
        <div className="dashboard-bottom-actions">
          <button className="logout magic-logout" onClick={handleLogout} aria-label="Log out of player dashboard">
            <span className="logout-label">LOG OUT</span>
            <span className="logout-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
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


        /* =====================================================
           OVER POWER PLAYER DASHBOARD — WARM GLASS REDESIGN
           Existing profile data and actions preserved
        ===================================================== */
        .page {
          padding: clamp(12px, 2vw, 30px);
          background:
            radial-gradient(ellipse 44% 38% at 3% 0%, rgba(229, 171, 95, .22), transparent 100%),
            radial-gradient(ellipse 42% 36% at 98% 4%, rgba(151, 111, 202, .19), transparent 100%),
            radial-gradient(ellipse 42% 38% at 90% 90%, rgba(201, 142, 91, .12), transparent 100%),
            linear-gradient(135deg, #17120f 0%, #100e13 48%, #090b12 100%);
          color: #f7f0e5;
        }
        .light-1 { background: #e5ad65; opacity: .12; }
        .light-2 { background: #a78ad8; opacity: .10; }
        .light-3 { background: #f3c78b; opacity: .07; }
        .wrap { width: 100%; max-width: 1560px; margin: 0 auto; }
        .topbar {
          margin-bottom: 18px;
          padding: 13px 18px;
          border: 1px solid rgba(255, 218, 166, .23);
          border-radius: 17px;
          background: linear-gradient(110deg, rgba(53, 39, 31, .91), rgba(23, 20, 30, .92) 55%, rgba(21, 19, 29, .94));
          box-shadow: 0 14px 38px rgba(0, 0, 0, .24), inset 0 1px 0 rgba(255, 255, 255, .07);
          backdrop-filter: blur(18px);
        }
        .logo {
          color: #21151a;
          background: linear-gradient(135deg, #ffe2a6 0%, #f2bd87 35%, #c7a6ef 72%, #f5c4b1 100%);
          box-shadow: 0 0 22px rgba(240, 190, 123, .24);
        }
        .logo-area b { color: #fff6e9; letter-spacing: .4px; }
        .logo-area small { color: #b8a99b; }
        .logout {
          border-color: rgba(244, 202, 139, .45);
          background: linear-gradient(110deg, rgba(243, 194, 120, .14), rgba(195, 157, 231, .10));
          color: #ffe4b3;
        }
        .logout:hover {
          color: #21151a;
          background: linear-gradient(110deg, #ffe1a5, #eac0b7, #cbb6f3);
          box-shadow: 0 0 24px rgba(240, 190, 123, .30);
        }
        .dashboard-layout { display: grid; grid-template-columns: 232px minmax(0, 1fr); gap: 20px; align-items: start; }
        .sidebar {
          position: sticky;
          top: 18px;
          display: flex;
          flex-direction: column;
          min-height: min(760px, calc(100vh - 36px));
          padding: 22px 15px 18px;
          border: 1px solid rgba(255, 218, 166, .20);
          border-radius: 21px;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(230, 177, 105, .12), transparent 54%),
            radial-gradient(ellipse at 100% 100%, rgba(160, 128, 218, .11), transparent 52%),
            linear-gradient(165deg, rgba(38, 29, 28, .94), rgba(15, 15, 23, .96) 68%, rgba(13, 15, 23, .97));
          box-shadow: 0 18px 42px rgba(0, 0, 0, .24), inset 0 1px 0 rgba(255, 255, 255, .06);
          backdrop-filter: blur(18px);
        }
        .sidebar-heading { display: flex; align-items: center; gap: 10px; padding: 2px 5px 21px; border-bottom: 1px solid rgba(255, 222, 177, .13); }
        .sidebar-mark {
          width: 37px; height: 37px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 12px;
          color: #251923; font-size: 12px; font-weight: 1000;
          background: linear-gradient(135deg, #ffe0a0, #e7b9b6 48%, #b7a5e9);
          box-shadow: 0 0 20px rgba(231, 186, 135, .20);
        }
        .sidebar-heading strong, .sidebar-heading small { display: block; }
        .sidebar-heading strong { color: #fff4e4; font-size: 11px; letter-spacing: 1px; }
        .sidebar-heading small { margin-top: 4px; color: #a99d9c; font-size: 8px; letter-spacing: 1.2px; }
        .sidebar-caption { margin: 23px 8px 10px; color: #9f938d; font-size: 9px; font-weight: 900; letter-spacing: 1.8px; }
        .sidebar-nav { display: grid; gap: 6px; }
        .sidebar-link {
          display: flex; align-items: center; gap: 11px; min-height: 42px; padding: 10px 11px;
          border: 1px solid transparent; border-radius: 11px; color: #c8bcb2; font-size: 12px; font-weight: 650;
          text-decoration: none; transition: color .22s ease, background .22s ease, border-color .22s ease, box-shadow .22s ease;
        }
        .nav-symbol { width: 20px; color: #e9c48e; font-size: 16px; text-align: center; text-shadow: 0 0 12px rgba(233, 196, 142, .24); }
        .sidebar-link:hover, .sidebar-link.active {
          color: #fff3db; border-color: rgba(243, 202, 143, .22);
          background: linear-gradient(100deg, rgba(236, 187, 115, .16), rgba(197, 164, 235, .09));
          box-shadow: inset 2px 0 0 #edc58b, 0 5px 18px rgba(0, 0, 0, .12);
        }
        .sidebar-footer { margin-top: auto; padding: 18px 8px 0; border-top: 1px solid rgba(255, 222, 177, .12); }
        .sidebar-live { display: flex; align-items: center; gap: 7px; color: #f2d5a7; font-size: 8px; font-weight: 900; letter-spacing: 1px; }
        .sidebar-live span { width: 6px; height: 6px; border-radius: 50%; background: #b6d8ae; box-shadow: 0 0 9px rgba(182, 216, 174, .65); }
        .sidebar-footer small { display: block; margin-top: 8px; color: #918780; font-size: 10px; line-height: 1.5; }
        .dashboard-content { display: grid; gap: 16px; min-width: 0; }
        .hero {
          margin-bottom: 0; padding: clamp(24px, 3vw, 38px) 20px 27px; border-color: rgba(255, 218, 166, .30);
          background:
            radial-gradient(ellipse at 15% 0%, rgba(237, 189, 121, .14), transparent 48%),
            radial-gradient(ellipse at 100% 100%, rgba(172, 142, 221, .14), transparent 48%),
            linear-gradient(120deg, rgba(47, 35, 32, .92), rgba(21, 20, 29, .95) 62%, rgba(18, 19, 29, .96));
          box-shadow: 0 18px 42px rgba(0, 0, 0, .24), 0 0 28px rgba(221, 179, 122, .055), inset 0 1px 0 rgba(255, 255, 255, .08);
        }
        .hero::before { background: linear-gradient(90deg, transparent, #f2d39c, #d6b8ed, #e7b39e, transparent); opacity: .85; }
        .avatar { background: linear-gradient(135deg, #ffe1a1, #e7b2a8, #c2a5f1, #9fdfe0); box-shadow: 0 0 24px rgba(231, 184, 123, .22), 0 0 34px rgba(170, 142, 221, .12); }
        .avatar img, .fallback { border-color: #19151b; }
        .fallback { color: #f5d6a2; background: #17141b; }
        .hero h1 { color: #fff6e9; letter-spacing: clamp(.5px, .2vw, 2px); text-shadow: 0 0 20px rgba(240, 202, 145, .12); }
        .ign { color: #e8c8ff; text-shadow: 0 0 13px rgba(203, 164, 244, .22); }
        .tag.red { color: #2b1a19; background: linear-gradient(110deg, #ffe0a1, #efc09b); box-shadow: 0 0 17px rgba(240, 192, 127, .18); }
        .tag.purple { color: #e4d5ff; border-color: rgba(198, 166, 240, .38); background: linear-gradient(110deg, rgba(170, 132, 222, .17), rgba(235, 190, 156, .09)); }
        .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 0; }
        .stat {
          min-width: 0; padding: 16px 14px; border-color: rgba(255, 218, 166, .19); border-radius: 16px;
          background: radial-gradient(ellipse at 0% 0%, rgba(231, 182, 117, .11), transparent 65%), linear-gradient(145deg, rgba(43, 33, 31, .88), rgba(19, 19, 28, .94));
          box-shadow: 0 10px 26px rgba(0, 0, 0, .17), inset 0 1px 0 rgba(255, 255, 255, .045);
        }
        .stat span { filter: saturate(.72); }
        .stat small { color: #b2a69d; font-size: 9px; letter-spacing: .65px; }
        .stat b { color: #f6d59b; font-size: clamp(17px, 1.5vw, 22px); text-shadow: 0 0 12px rgba(246, 213, 155, .17); overflow-wrap: anywhere; }
        .earning-stat b { font-size: clamp(14px, 1.25vw, 19px); }
        .career-shell { margin: 0; padding: 0; border: 0; background: transparent; box-shadow: none; overflow: visible; }
        .career-section {
          position: relative; overflow: hidden; margin: 0; padding: clamp(17px, 2.2vw, 27px);
          border: 1px solid rgba(255, 218, 166, .23); border-radius: 20px;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(232, 183, 115, .12), transparent 55%),
            radial-gradient(ellipse at 100% 100%, rgba(163, 135, 218, .10), transparent 55%),
            linear-gradient(140deg, rgba(37, 29, 28, .94), rgba(17, 17, 25, .97));
          box-shadow: 0 17px 40px rgba(0, 0, 0, .22), inset 0 1px 0 rgba(255, 255, 255, .055);
        }
        .career-section::before {
          content: ""; position: absolute; top: 0; left: 24px; right: 24px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 223, 171, .42), rgba(201, 174, 239, .35), transparent);
          pointer-events: none;
        }
        .career-header h3 { color: #f3d09a; font-size: 13px; letter-spacing: 1.3px; text-shadow: 0 0 15px rgba(243, 208, 154, .12); }
        .career-header p { color: #b3a8a0; font-size: 11px; }
        .filter-buttons { gap: 8px; margin: 18px 0 17px; }
        .filter-btn { color: #c9bdb2; border-color: rgba(244, 206, 151, .23); background: linear-gradient(110deg, rgba(240, 192, 128, .055), rgba(179, 148, 219, .055)); }
        .filter-btn:hover { color: #fff2d8; border-color: rgba(244, 206, 151, .55); box-shadow: 0 0 15px rgba(239, 196, 131, .10); }
        .filter-btn.active { color: #26191b; border-color: #f0cd91; background: linear-gradient(110deg, #ffe0a2, #efc5a9 55%, #d5baf0); box-shadow: 0 0 19px rgba(240, 198, 135, .18); }
        .custom-date-filter { background: rgba(255, 255, 255, .025); border-color: rgba(255, 218, 166, .13); }
        .custom-date-filter label { color: #b7a99e; }
        .custom-date-filter input { border-color: rgba(255, 218, 166, .18); background: rgba(13, 13, 20, .88); accent-color: #e9c28b; }
        .clear-date-btn { color: #f2d5a6; border-color: rgba(240, 198, 135, .32); background: rgba(240, 198, 135, .08); }
        .career-grid { gap: 10px; }
        .career-stat {
          min-width: 0; min-height: 100px; padding: 14px 10px; border-color: rgba(255, 218, 166, .15);
          background: radial-gradient(ellipse at 50% 0%, rgba(232, 185, 119, .09), transparent 65%), linear-gradient(145deg, rgba(43, 34, 32, .86), rgba(20, 19, 27, .92));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .035);
        }
        .career-stat small { color: #b5a99f; }
        .career-stat strong { color: #e9d3a6; text-shadow: 0 0 12px rgba(233, 211, 166, .13); }
        .performance-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 22px; }
        .chart-card {
          min-width: 0; padding: 19px 17px 14px; border: 1px solid rgba(255, 218, 166, .16); border-radius: 17px;
          background: radial-gradient(ellipse at 100% 0%, rgba(170, 142, 220, .10), transparent 55%), linear-gradient(145deg, rgba(35, 29, 30, .91), rgba(17, 18, 26, .96));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .045);
        }
        .chart-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .chart-heading h4 { margin: 0; color: #fff0d7; font-size: 12px; font-weight: 900; letter-spacing: 1px; }
        .chart-heading p { margin: 6px 0 0; color: #a99f9a; font-size: 10px; line-height: 1.5; }
        .chart-chip { flex: 0 0 auto; padding: 6px 8px; border: 1px solid rgba(239, 204, 153, .20); border-radius: 999px; color: #e7cda4; background: rgba(240, 199, 139, .07); font-size: 8px; font-weight: 900; letter-spacing: .5px; }
        .chart-legend { display: flex; align-items: center; gap: 15px; margin: 16px 0 3px; color: #bfb3a9; font-size: 10px; }
        .chart-legend span { display: inline-flex; align-items: center; gap: 6px; }
        .chart-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 3px; }
        .legend-kills, .legend-damage { background: #f0cd8f; box-shadow: 0 0 8px rgba(240, 205, 143, .25); }
        .legend-assists { background: #bca6eb; box-shadow: 0 0 8px rgba(188, 166, 235, .22); }
        .performance-chart { display: block; width: 100%; height: auto; overflow: visible; }
        .chart-grid-line { stroke: rgba(255, 225, 184, .10); stroke-width: 1; stroke-dasharray: 3 6; }
        .chart-axis-label { fill: #a99d94; font-size: 10px; font-family: inherit; }
        .damage-line { filter: drop-shadow(0 0 5px rgba(244, 199, 127, .22)); }
        .damage-point { fill: #ffe1a4; stroke: #6d543c; stroke-width: 2; filter: drop-shadow(0 0 5px rgba(244, 199, 127, .4)); }
        .chart-empty { margin: 0 0 5px; color: #a99d94; text-align: center; font-size: 11px; line-height: 1.6; }
        .player-info-card { margin: 0; }
        .card {
          border-radius: 18px;
          background: radial-gradient(ellipse at 0% 0%, rgba(231, 183, 118, .09), transparent 55%), linear-gradient(145deg, rgba(36, 29, 29, .91), rgba(17, 18, 26, .96));
          box-shadow: 0 13px 30px rgba(0, 0, 0, .18), inset 0 1px 0 rgba(255, 255, 255, .04);
          backdrop-filter: blur(16px);
        }
        .card h3 { font-size: 12px; letter-spacing: 1.2px; }
        .grid { gap: 18px 16px; }
        .grid label { color: #b4a89d; letter-spacing: .3px; }
        .grid p { color: #f4ede2; line-height: 1.5; }
        .card-red { border-color: rgba(240, 198, 135, .25); box-shadow: 0 13px 30px rgba(0, 0, 0, .18), inset 0 1px 0 rgba(255, 255, 255, .04); }
        .card-red h3 { color: #f0cd92; }
        .card-red::before { background: linear-gradient(180deg, #ffe1a5, #e4b48e, #bca6e8); box-shadow: 0 0 12px rgba(239, 199, 139, .30); }
        .card-purple { border-color: rgba(189, 165, 234, .28); box-shadow: 0 13px 30px rgba(0, 0, 0, .18), inset 0 1px 0 rgba(255, 255, 255, .04); }
        .card-purple h3 { color: #d5c0f4; }
        .card-purple::before { background: linear-gradient(180deg, #e3d0ff, #b59ce8); box-shadow: 0 0 12px rgba(189, 165, 234, .25); }
        .card-green { border-color: rgba(211, 204, 152, .25); box-shadow: 0 13px 30px rgba(0, 0, 0, .18), inset 0 1px 0 rgba(255, 255, 255, .04); }
        .card-green h3, .exp label { color: #e8d3a0; }
        .card-green::before { background: linear-gradient(180deg, #f6dda2, #b8d2b0); box-shadow: 0 0 12px rgba(221, 208, 156, .22); }
        .exp p { color: #fff0d7; }
        .card-orange { border-color: rgba(222, 177, 140, .26); box-shadow: 0 13px 30px rgba(0, 0, 0, .18), inset 0 1px 0 rgba(255, 255, 255, .04); }
        .card-orange h3 { color: #edc4a5; }
        .card-orange::before { background: linear-gradient(180deg, #f6d49a, #d7b5e8); box-shadow: 0 0 12px rgba(221, 177, 140, .22); }
        .weapon { color: #2a1d20; background: linear-gradient(110deg, #f6d99f, #e9c0ac 55%, #c9b4ed); box-shadow: 0 0 15px rgba(240, 198, 135, .15); }
        .social { color: #ecd7b2; border-color: rgba(239, 204, 153, .28); background: linear-gradient(110deg, rgba(240, 199, 139, .08), rgba(190, 164, 231, .08)); }
        .social:hover { color: #241a1c; background: linear-gradient(110deg, #f5d59a, #e7c0b5, #c8b3ed); box-shadow: 0 0 18px rgba(240, 198, 135, .22); }
        .empty { color: #a99d94; }
        [id] { scroll-margin-top: 20px; }
        @media (max-width: 1100px) {
          .dashboard-layout { grid-template-columns: 195px minmax(0, 1fr); gap: 14px; }
          .sidebar { padding: 18px 11px 15px; }
          .sidebar-link { padding: 9px; font-size: 11px; }
          .stats { gap: 8px; }
          .stat { padding: 13px 10px; gap: 7px; }
          .stat span { font-size: 18px; }
          .career-grid { gap: 8px; }
          .career-stat { padding: 12px 7px; }
        }
        @media (max-width: 850px) {
          .dashboard-layout { grid-template-columns: minmax(0, 1fr); }
          .sidebar { position: relative; top: auto; min-height: 0; padding: 15px; }
          .sidebar-heading { padding-bottom: 13px; }
          .sidebar-caption { margin: 14px 5px 8px; }
          .sidebar-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
          .sidebar-link { justify-content: center; min-height: 39px; padding: 8px 7px; font-size: 10px; }
          .nav-symbol { width: auto; }
          .sidebar-footer { display: none; }
          .dashboard-content { gap: 13px; }
          .performance-grid { gap: 11px; }
        }
        @media (max-width: 620px) {
          .page { padding: 10px 9px 28px; }
          .topbar { padding: 10px 11px; margin-bottom: 12px; border-radius: 14px; }
          .logo { width: 34px; height: 34px; }
          .logo-area { gap: 8px; }
          .logo-area b { font-size: 11px; }
          .logo-area small { font-size: 8px; letter-spacing: .7px; }
          .logout { height: 33px; padding: 0 11px; font-size: 10px; }
          .sidebar { padding: 12px 10px; border-radius: 16px; }
          .sidebar-mark { width: 32px; height: 32px; }
          .sidebar-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .sidebar-link { justify-content: flex-start; min-height: 38px; font-size: 10px; }
          .dashboard-content { gap: 11px; }
          .hero { padding: 24px 13px 21px; border-radius: 18px; }
          .avatar { width: 82px; height: 82px; margin-bottom: 12px; }
          .hero h1 { font-size: clamp(21px, 6vw, 27px); overflow-wrap: anywhere; }
          .ign { font-size: 12px; }
          .tag { padding: 6px 11px; font-size: 10px; }
          .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .stat { min-height: 75px; padding: 11px 9px; border-radius: 13px; }
          .stat span { font-size: 17px; }
          .stat small { font-size: 8px; line-height: 1.4; }
          .stat b { font-size: 17px; }
          .earning-stat b { font-size: 14px; }
          .career-section { padding: 17px 12px; border-radius: 16px; }
          .career-header h3 { font-size: 11px; }
          .career-header p { font-size: 10px; line-height: 1.5; }
          .filter-buttons { gap: 6px; margin: 14px 0; }
          .filter-btn { padding: 8px 9px; font-size: 9px; border-radius: 9px; }
          .career-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .career-stat { min-height: 88px; padding: 10px 7px; }
          .career-stat span { font-size: 17px; }
          .career-stat small { font-size: 8px; }
          .career-stat strong { font-size: 17px; }
          .performance-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; margin-top: 15px; }
          .chart-card { padding: 15px 10px 12px; border-radius: 14px; }
          .chart-heading h4 { font-size: 10px; }
          .chart-heading p { font-size: 9px; }
          .chart-chip { font-size: 7px; padding: 5px 6px; }
          .chart-axis-label { font-size: 9px; }
          .player-info-card, .card { padding: 16px 13px; border-radius: 15px; }
          .card h3 { font-size: 11px; margin-bottom: 14px; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px 10px; }
          .grid label { font-size: 9px; }
          .grid p { font-size: 12px; }
          .exp { grid-template-columns: minmax(0, 1fr); gap: 13px; }
          .exp label { font-size: 10px; }
          .exp p { font-size: 13px; }
          .custom-date-filter { grid-template-columns: minmax(0, 1fr); padding: 10px; }
          .clear-date-btn { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .light, .damage-line { animation: none !important; }
          .sidebar-link, .logout, .social { transition: none !important; }
        }



        /* FINAL CONTRAST PASS — vivid esports colors, clear type, no glow */
        .page {
          color: #f4f7ff;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(17, 126, 167, .16), transparent 45%),
            radial-gradient(ellipse at 100% 4%, rgba(119, 57, 190, .15), transparent 43%),
            linear-gradient(135deg, #070b14 0%, #0c1220 52%, #080d18 100%);
        }
        .topbar {
          background: linear-gradient(105deg, #111b2b 0%, #141626 58%, #171326 100%);
          border-color: #34445f;
          box-shadow: 0 8px 20px rgba(0, 0, 0, .22);
        }
        .logo {
          color: #08111c;
          background: linear-gradient(135deg, #4be7f5 0%, #4e9dff 48%, #c08bff 100%);
          box-shadow: none;
        }
        .logo-area b { color: #ffffff; font-size: 13px; }
        .logo-area small { color: #b8c6dc; font-size: 10px; }
        .logout {
          min-height: 38px;
          color: #f7fbff;
          background: linear-gradient(115deg, #2456d8, #7538d4);
          border: 1px solid #6da5ff;
          font-size: 11px;
          font-weight: 900;
          box-shadow: none;
        }
        .logout:hover {
          color: #ffffff;
          background: linear-gradient(115deg, #3278f6, #984af0);
          box-shadow: none;
        }
        .sidebar {
          background: linear-gradient(160deg, #111a2a 0%, #101523 58%, #171326 100%);
          border-color: #33445f;
          box-shadow: 0 10px 26px rgba(0, 0, 0, .22);
        }
        .sidebar-heading { border-bottom-color: #2b3b55; }
        .sidebar-mark {
          color: #08111c;
          background: linear-gradient(135deg, #45e4f3, #508aff 55%, #b98cff);
          box-shadow: none;
        }
        .sidebar-heading strong { color: #ffffff; font-size: 12px; }
        .sidebar-heading small { color: #b8c6dc; font-size: 9px; }
        .sidebar-caption { color: #a8b7ce; font-size: 10px; }
        .sidebar-link {
          color: #d8e2f3;
          font-size: 13px;
          font-weight: 700;
          border-color: transparent;
        }
        .nav-symbol { color: #46d9f1; text-shadow: none; }
        .sidebar-link:hover, .sidebar-link.active {
          color: #ffffff;
          background: linear-gradient(100deg, #153a58, #202344);
          border-color: #338fca;
          box-shadow: inset 3px 0 0 #39d9f0;
        }
        .sidebar-footer { border-top-color: #2b3b55; }
        .sidebar-live { color: #58e4b4; font-size: 10px; }
        .sidebar-live span { background: #58e4b4; box-shadow: none; }
        .sidebar-footer small { color: #b7c4d9; font-size: 11px; }

        .hero {
          background: linear-gradient(120deg, #14243a 0%, #17192d 53%, #251735 100%);
          border-color: #405a7d;
          box-shadow: 0 10px 25px rgba(0, 0, 0, .23);
        }
        .hero::before {
          background: linear-gradient(90deg, #24d5e9, #477dff, #a66cff, #f45f9c);
          opacity: .9;
        }
        .avatar {
          background: linear-gradient(135deg, #35d9ef, #457dff 45%, #b75bff 72%, #ff648c);
          box-shadow: none;
        }
        .hero h1 {
          color: #ffffff;
          font-size: clamp(25px, 2vw, 32px);
          letter-spacing: 1.2px;
          text-shadow: none;
        }
        .ign { color: #6fe6f4; font-size: 15px; text-shadow: none; }
        .tag { font-size: 12px; font-weight: 800; }
        .tag.red {
          color: #07131c;
          background: linear-gradient(120deg, #49e5f1, #6aa8ff);
          box-shadow: none;
        }
        .tag.purple {
          color: #ffffff;
          border-color: #9868f3;
          background: linear-gradient(120deg, #6f3bd1, #a044d8);
        }

        .stats { gap: 12px; }
        .stat {
          background: linear-gradient(145deg, #151e2e, #111522);
          border-color: #34445f;
          border-radius: 15px;
          box-shadow: none;
        }
        .stat:nth-child(1) { border-top: 3px solid #28d7ec; }
        .stat:nth-child(2) { border-top: 3px solid #a98aff; }
        .stat:nth-child(3) { border-top: 3px solid #ff668e; }
        .stat:nth-child(4) { border-top: 3px solid #f7bd4b; }
        .stat span { filter: none; font-size: 22px; }
        .stat small { color: #c1cde0; font-size: 11px; letter-spacing: .7px; font-weight: 800; }
        .stat b {
          color: #ffffff;
          font-size: clamp(21px, 1.7vw, 26px);
          text-shadow: none;
          line-height: 1.3;
        }
        .earning-stat b { color: #ffd166; font-size: clamp(18px, 1.4vw, 23px); }

        .career-section {
          border-color: #364965;
          background: linear-gradient(135deg, #111b2b 0%, #101522 58%, #17162a 100%);
          box-shadow: 0 10px 26px rgba(0, 0, 0, .22);
        }
        .career-section::before {
          height: 2px;
          background: linear-gradient(90deg, #27d9ed, #487cff, #b76aff, #f45c9a);
        }
        .career-header h3 {
          color: #ffffff;
          font-size: 15px;
          letter-spacing: 1.2px;
          text-shadow: none;
        }
        .career-header p { color: #c1cde0; font-size: 12px; }
        .filter-buttons { gap: 10px; margin: 19px 0 18px; }
        .filter-btn {
          min-height: 39px;
          padding: 10px 15px;
          border-radius: 10px;
          color: #ffffff;
          border: 1px solid transparent;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .25px;
          box-shadow: none;
          transition: background .18s ease, border-color .18s ease, transform .18s ease;
        }
        .filter-btn:nth-child(1) { background: linear-gradient(120deg, #20cfe5, #367ff4); border-color: #59e6f5; color: #061321; }
        .filter-btn:nth-child(2) { background: linear-gradient(120deg, #7148e8, #9a4df2); border-color: #b8a0ff; }
        .filter-btn:nth-child(3) { background: linear-gradient(120deg, #df3977, #f05c9c); border-color: #ff91bc; }
        .filter-btn:nth-child(4) { background: linear-gradient(120deg, #f0a923, #f06a32); border-color: #ffd16a; color: #211406; }
        .filter-btn:hover { transform: translateY(-1px); filter: brightness(1.09); box-shadow: none; }
        .filter-btn.active {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
          border-color: #ffffff;
          filter: brightness(1.08);
          box-shadow: none;
        }
        .custom-date-filter {
          background: #101827;
          border-color: #3a4d6b;
        }
        .custom-date-filter label { color: #d0dced; font-size: 11px; }
        .custom-date-filter input {
          color: #ffffff;
          border-color: #3d5273;
          background: #090f1b;
          font-size: 13px;
          accent-color: #25d7eb;
        }
        .clear-date-btn {
          min-height: 38px;
          color: #ffffff;
          border-color: #f0789e;
          background: linear-gradient(120deg, #b72e67, #e54c84);
          font-weight: 900;
          box-shadow: none;
        }

        .career-grid { gap: 10px; }
        .career-stat {
          min-height: 104px;
          padding: 14px 10px;
          background: linear-gradient(145deg, #172033, #111522);
          border-color: #35445f;
          border-radius: 13px;
          box-shadow: none;
        }
        .career-stat:nth-child(5n + 1) { border-top: 3px solid #24d7eb; }
        .career-stat:nth-child(5n + 2) { border-top: 3px solid #a88bff; }
        .career-stat:nth-child(5n + 3) { border-top: 3px solid #ff668e; }
        .career-stat:nth-child(5n + 4) { border-top: 3px solid #f8bf4d; }
        .career-stat:nth-child(5n) { border-top: 3px solid #39d9a7; }
        .career-stat span { font-size: 23px; }
        .career-stat small {
          color: #c8d4e7;
          font-size: 10.5px;
          line-height: 1.35;
          letter-spacing: .4px;
          font-weight: 800;
        }
        .career-stat strong {
          color: #ffffff;
          font-size: 22px;
          line-height: 1.35;
          text-shadow: none;
        }

        .performance-grid { gap: 14px; margin-top: 22px; }
        .chart-card {
          background: linear-gradient(145deg, #121d2e, #101522 65%, #17162a);
          border-color: #364a67;
          border-radius: 16px;
          box-shadow: none;
        }
        .chart-heading h4 { color: #ffffff; font-size: 14px; letter-spacing: .8px; }
        .chart-heading p { color: #c3cfe2; font-size: 12px; }
        .chart-chip {
          color: #ffffff;
          border-color: #4e6d98;
          background: #1b2e48;
          font-size: 10px;
          padding: 7px 10px;
        }
        .chart-legend { color: #d2dced; font-size: 12px; }
        .legend-kills { background: #2bd8ee; box-shadow: none; }
        .legend-assists { background: #b47cff; box-shadow: none; }
        .legend-damage { background: #39dfb1; box-shadow: none; }
        .chart-grid-line { stroke: rgba(181, 203, 234, .22); stroke-width: 1; stroke-dasharray: 4 5; }
        .chart-axis-label { fill: #d1dced; font-size: 12px; font-family: inherit; }
        .damage-line { filter: none; }
        .damage-point { fill: #39dfb1; stroke: #0e6d63; stroke-width: 2; filter: none; }
        .chart-empty { color: #d0dced; font-size: 12px; }

        .card {
          background: linear-gradient(145deg, #141e2f, #101522 65%, #17162a);
          border-radius: 16px;
          box-shadow: none;
          backdrop-filter: none;
        }
        .card h3 { font-size: 14px; letter-spacing: 1px; }
        .grid { gap: 20px 16px; }
        .grid label { color: #bdcce1; font-size: 11px; font-weight: 800; }
        .grid p { color: #ffffff; font-size: 14px; font-weight: 650; line-height: 1.55; overflow-wrap: anywhere; }
        .card-red { border-color: #ef527e; }
        .card-red h3 { color: #ff789c; }
        .card-red::before { background: linear-gradient(180deg, #ff477e, #f6a13c); box-shadow: none; }
        .card-purple { border-color: #9365f5; }
        .card-purple h3 { color: #bd9aff; }
        .card-purple::before { background: #a78bfa; box-shadow: none; }
        .card-green { border-color: #26cfa0; }
        .card-green h3, .exp label { color: #4ce2b3; }
        .card-green::before { background: #34d399; box-shadow: none; }
        .exp p { color: #ffffff; font-size: 15px; }
        .card-orange { border-color: #f5a936; }
        .card-orange h3 { color: #ffc45d; }
        .card-orange::before { background: #fbbf24; box-shadow: none; }

        .weapon {
          color: #ffffff;
          background: linear-gradient(120deg, #6337cb, #a13fc8);
          border: 1px solid #bb9bff;
          box-shadow: none;
          font-size: 12px;
        }
        .social {
          color: #ffffff;
          border-color: #43618b;
          background: #1a2940;
          font-size: 12px;
          font-weight: 800;
        }
        .social:nth-child(1) { background: #1d61bb; border-color: #438ee9; }
        .social:nth-child(2) { background: #9d285f; border-color: #e45b9b; }
        .social:nth-child(3) { background: #273248; border-color: #7185a8; }
        .social:nth-child(4) { background: #a82f39; border-color: #f06a73; }
        .social:hover { color: #ffffff; filter: brightness(1.12); box-shadow: none; }
        .empty { color: #c2cfe2; font-size: 12px; }

        @media (max-width: 1100px) {
          .sidebar-link { font-size: 12px; }
          .stat small { font-size: 10px; }
          .career-stat small { font-size: 10px; }
          .grid label { font-size: 11px; }
        }
        @media (max-width: 850px) {
          .sidebar-link { font-size: 12px; }
          .sidebar-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .career-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .performance-grid { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 620px) {
          .page { padding: 10px 9px 28px; }
          .topbar { padding: 11px 12px; }
          .logo-area b { font-size: 12px; }
          .logo-area small { font-size: 9px; }
          .logout { min-height: 36px; font-size: 11px; }
          .sidebar-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .sidebar-link { justify-content: flex-start; min-height: 42px; font-size: 12px; }
          .hero h1 { font-size: clamp(23px, 6.4vw, 29px); }
          .ign { font-size: 14px; }
          .stat { padding: 13px 10px; }
          .stat small { font-size: 10px; }
          .stat b { font-size: 21px; }
          .earning-stat b { font-size: 17px; }
          .career-header h3 { font-size: 13px; }
          .career-header p { font-size: 11px; }
          .filter-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
          .filter-btn { flex: 1 1 calc(50% - 8px); min-height: 40px; padding: 10px 8px; font-size: 10px; }
          .career-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .career-stat { min-height: 94px; padding: 11px 8px; }
          .career-stat span { font-size: 21px; }
          .career-stat small { font-size: 10px; }
          .career-stat strong { font-size: 21px; }
          .chart-card { padding: 15px 11px 12px; }
          .chart-heading h4 { font-size: 12px; }
          .chart-heading p { font-size: 11px; }
          .chart-chip { font-size: 9px; }
          .chart-legend { font-size: 11px; }
          .chart-axis-label { font-size: 11px; }
          .player-info-card, .card { padding: 17px 13px; }
          .card h3 { font-size: 13px; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 10px; }
          .grid label { font-size: 10px; }
          .grid p { font-size: 13px; }
          .exp label { font-size: 11px; }
          .exp p { font-size: 14px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sidebar-link, .logout, .social, .filter-btn { transition: none !important; }
        }



        /* Full-width player dashboard and bottom neon logout action */
        .page {
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          padding: clamp(12px, 1.7vw, 28px) clamp(12px, 2vw, 34px) 28px;
          overflow-x: clip;
        }
        .wrap {
          width: 100%;
          max-width: none;
          margin: 0;
        }
        .topbar {
          width: 100%;
          box-sizing: border-box;
          margin-bottom: clamp(14px, 1.5vw, 22px);
          padding: 13px clamp(13px, 1.5vw, 22px);
        }
        .dashboard-layout {
          display: block;
          width: 100%;
          min-width: 0;
          margin: 0;
        }
        .dashboard-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(13px, 1.35vw, 20px);
          width: 100%;
          min-width: 0;
        }
        .hero, .stats, .career-shell, .career-section, .card, .performance-grid {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .hero {
          padding: clamp(26px, 3vw, 42px) 20px clamp(23px, 2.4vw, 32px);
        }
        .stats {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(9px, 1vw, 14px);
          margin-bottom: 0;
        }
        .stat {
          min-width: 0;
          padding: clamp(13px, 1.2vw, 19px);
        }
        .career-section {
          padding: clamp(18px, 2vw, 30px);
          margin-bottom: 0;
        }
        .career-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: clamp(8px, .8vw, 12px);
        }
        .performance-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(12px, 1vw, 16px);
        }
        .card {
          margin-bottom: 0;
          padding: clamp(17px, 1.6vw, 24px);
        }
        .dashboard-bottom-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          margin-top: clamp(16px, 2vw, 28px);
          padding: clamp(16px, 1.8vw, 24px) 0 6px;
          border-top: 1px solid rgba(92, 177, 255, .22);
        }
        .logout.magic-logout {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          width: min(270px, 100%);
          min-height: 58px;
          padding: 0 24px;
          overflow: hidden;
          border: 2px solid transparent;
          border-radius: 999px;
          color: #f7fbff;
          background:
            linear-gradient(110deg, #0c1328 0%, #11132b 48%, #101c30 100%) padding-box,
            linear-gradient(115deg, #b45cff 0%, #4c8dff 30%, #42e6f4 57%, #a66cff 82%, #f08bdf 100%) border-box;
          background-size: 100% 100%, 240% 240%;
          box-shadow: 0 0 0 1px rgba(83, 196, 255, .10), 0 8px 22px rgba(0, 0, 0, .22);
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease, background-position .8s ease;
          animation: logout-spectrum 5s ease-in-out infinite alternate;
        }
        .logout.magic-logout::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 3px;
          border-radius: inherit;
          background: linear-gradient(110deg, rgba(72, 70, 170, .16), rgba(37, 205, 237, .12), rgba(177, 83, 245, .16));
          pointer-events: none;
        }
        .logout.magic-logout::after {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, .10) 48%, transparent 72%);
          background-size: 220% 100%;
          background-position: 180% 0;
          animation: logout-shimmer 4s ease-in-out infinite;
          pointer-events: none;
        }
        .logout-label, .logout-arrow { position: relative; z-index: 1; }
        .logout-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          color: #10152b;
          background: linear-gradient(135deg, #f5c6ff, #9defff);
          font-size: 19px;
          line-height: 1;
          letter-spacing: 0;
        }
        .logout.magic-logout:hover {
          color: #ffffff;
          transform: translateY(-2px);
          background-position: 0 0, 100% 100%;
          box-shadow: 0 0 0 1px rgba(82, 224, 255, .18), 0 10px 26px rgba(50, 178, 255, .18);
        }
        .logout.magic-logout:focus-visible {
          outline: 3px solid #8feeff;
          outline-offset: 4px;
        }
        @keyframes logout-spectrum {
          0% { background-position: 0 0, 0% 50%; }
          100% { background-position: 0 0, 100% 50%; }
        }
        @keyframes logout-shimmer {
          0%, 25% { background-position: 180% 0; }
          65%, 100% { background-position: -180% 0; }
        }
        @media (max-width: 1100px) {
          .page { padding-inline: 16px; }
          .career-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 850px) {
          .page { padding: 12px; }
          .career-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .performance-grid { grid-template-columns: minmax(0, 1fr); }
          .dashboard-bottom-actions { justify-content: center; }
        }
        @media (max-width: 620px) {
          .page { padding: 10px 9px 22px; }
          .topbar { padding: 10px 12px; margin-bottom: 12px; }
          .hero { padding: 24px 13px 21px; }
          .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .career-section { padding: 16px 11px; }
          .career-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .performance-grid { grid-template-columns: minmax(0, 1fr); }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .logout.magic-logout { width: 100%; max-width: 320px; min-height: 56px; }
          .dashboard-bottom-actions { padding-top: 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .logout.magic-logout, .logout.magic-logout::after { animation: none !important; transition: none !important; }
        }



        /* READABILITY PASS: larger text, stronger contrast, more comfortable card sizing */
        .page {
          font-size: 16px;
          padding: clamp(12px, 1.4vw, 26px) clamp(12px, 1.6vw, 30px) 28px;
        }
        .wrap { width: 100%; max-width: none; margin: 0; }
        .topbar { display: none !important; }
        .dashboard-layout { display: block; width: 100%; min-width: 0; }
        .dashboard-content { gap: clamp(16px, 1.5vw, 24px); }
        .hero {
          min-height: 230px;
          padding: clamp(28px, 3vw, 44px) 22px clamp(26px, 2.5vw, 36px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .avatar { width: clamp(78px, 6vw, 108px); height: clamp(78px, 6vw, 108px); }
        .hero h1 {
          font-size: clamp(28px, 2vw, 38px);
          line-height: 1.2;
          letter-spacing: .8px;
          color: #fff;
          text-shadow: 0 0 18px rgba(87, 209, 255, .12);
        }
        .ign { font-size: clamp(14px, 1vw, 18px); line-height: 1.45; }
        .tag { font-size: 13px; padding: 8px 15px; }
        .stats {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(10px, 1vw, 16px);
        }
        .stat {
          min-height: 82px;
          padding: clamp(14px, 1.25vw, 21px);
          gap: 12px;
          border-radius: 16px;
        }
        .stat span { font-size: clamp(22px, 1.6vw, 30px); }
        .stat small {
          font-size: clamp(12px, .85vw, 14px);
          line-height: 1.35;
          letter-spacing: .5px;
          color: #cbd8ed;
        }
        .stat b {
          display: inline-block;
          font-size: clamp(22px, 1.65vw, 30px);
          line-height: 1.25;
          color: #f4fbff;
        }
        .earning-stat b { font-size: clamp(19px, 1.35vw, 25px); }
        .career-section {
          padding: clamp(18px, 1.8vw, 30px);
          border-radius: 20px;
        }
        .career-header h3 {
          font-size: clamp(18px, 1.25vw, 23px);
          line-height: 1.35;
          letter-spacing: 1.2px;
        }
        .career-header p {
          font-size: clamp(13px, .9vw, 15px);
          line-height: 1.5;
          color: #c6d4e9;
        }
        .filter-buttons { gap: 10px; margin: 20px 0 18px; }
        .filter-btn {
          min-height: 44px;
          padding: 11px 17px;
          font-size: clamp(12px, .85vw, 14px);
          font-weight: 900;
          letter-spacing: .35px;
          border-radius: 12px;
        }
        .custom-date-filter label { font-size: 13px; color: #d2dced; }
        .custom-date-filter input { min-height: 44px; font-size: 15px; }
        .clear-date-btn { min-height: 44px; font-size: 13px; }
        .career-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: clamp(9px, .9vw, 14px);
        }
        .career-stat {
          min-height: clamp(104px, 8vw, 132px);
          padding: clamp(13px, 1.2vw, 20px) 10px;
          border-radius: 14px;
        }
        .career-stat span { font-size: clamp(23px, 1.65vw, 31px); margin-bottom: 9px; }
        .career-stat small {
          font-size: clamp(11px, .8vw, 13px);
          line-height: 1.35;
          letter-spacing: .55px;
          color: #c9d6ea;
        }
        .career-stat strong {
          margin-top: 7px;
          font-size: clamp(22px, 1.6vw, 30px);
          line-height: 1.25;
          color: #f5fbff;
        }
        .performance-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(12px, 1vw, 18px);
          margin-top: clamp(14px, 1.1vw, 20px);
        }
        .chart-card {
          min-height: 350px;
          padding: clamp(17px, 1.4vw, 24px);
          border-radius: 17px;
        }
        .chart-heading h4 {
          font-size: clamp(16px, 1.05vw, 20px);
          line-height: 1.35;
          letter-spacing: .7px;
        }
        .chart-heading p { font-size: clamp(13px, .85vw, 15px); line-height: 1.5; }
        .chart-chip { font-size: 12px; padding: 7px 11px; }
        .chart-legend { font-size: 13px; line-height: 1.5; }
        .chart-axis-label { font-size: 13px; }
        .chart-empty { font-size: 14px; line-height: 1.5; }
        .card {
          padding: clamp(18px, 1.8vw, 30px);
          border-radius: 18px;
        }
        .card h3 {
          font-size: clamp(17px, 1.15vw, 21px);
          line-height: 1.35;
          letter-spacing: .9px;
          margin-bottom: 22px;
        }
        .grid { gap: clamp(18px, 1.5vw, 26px) 18px; }
        .grid label {
          font-size: clamp(12px, .85vw, 14px);
          line-height: 1.45;
          color: #c5d5e9;
          margin-bottom: 5px;
        }
        .grid p {
          font-size: clamp(15px, 1vw, 18px);
          line-height: 1.55;
          font-weight: 700;
          color: #ffffff;
        }
        .exp label { font-size: clamp(13px, .9vw, 15px); }
        .exp p { font-size: clamp(16px, 1.1vw, 19px); }
        .weapon, .social { font-size: 14px; padding: 11px 15px; }
        .empty { font-size: 14px; }

        /* Neon tube logout: violet at left, electric blue through white, cyan at right */
        .dashboard-bottom-actions {
          justify-content: center;
          margin-top: clamp(22px, 2.5vw, 38px);
          padding: clamp(22px, 2.4vw, 36px) 0 18px;
          border-top: 1px solid rgba(104, 146, 255, .24);
        }
        .logout.magic-logout {
          isolation: isolate;
          position: relative;
          width: min(340px, 100%);
          min-height: 68px;
          padding: 0 28px;
          gap: 20px;
          border: 2px solid transparent;
          border-radius: 999px;
          color: #ffffff;
          background:
            linear-gradient(110deg, #080d24 0%, #10123b 48%, #081b2c 100%) padding-box,
            linear-gradient(105deg, #bd59ff 0%, #7757ff 22%, #c8d8ff 43%, #ffffff 51%, #5deaff 70%, #3a92ff 88%, #b45dff 100%) border-box;
          background-size: 100% 100%, 220% 220%;
          box-shadow:
            0 0 8px 2px rgba(178, 86, 255, .52),
            0 0 20px 5px rgba(101, 100, 255, .35),
            0 0 34px 8px rgba(58, 207, 255, .22),
            inset 0 0 17px rgba(75, 91, 255, .20);
          font-size: 15px;
          font-weight: 950;
          letter-spacing: 2.5px;
          text-shadow: 0 0 9px rgba(255,255,255,.3);
          animation: logout-spectrum 4s ease-in-out infinite alternate;
        }
        .logout.magic-logout::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 4px;
          border-radius: inherit;
          background:
            radial-gradient(ellipse at 12% 50%, rgba(168, 70, 255, .23), transparent 40%),
            radial-gradient(ellipse at 90% 50%, rgba(43, 222, 255, .20), transparent 43%),
            linear-gradient(100deg, rgba(9, 12, 42, .9), rgba(11, 18, 49, .92));
          box-shadow: inset 0 0 18px rgba(115, 127, 255, .2);
          pointer-events: none;
        }
        .logout.magic-logout::after {
          content: "";
          position: absolute;
          z-index: -1;
          inset: -5px;
          border-radius: inherit;
          background: linear-gradient(105deg, #b94dff, #6174ff, #f5fdff, #48e7ff, #a451ff);
          filter: blur(14px);
          opacity: .45;
          animation: logout-aura 3s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .logout-label, .logout-arrow { position: relative; z-index: 1; }
        .logout-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          color: #10152b;
          background: linear-gradient(135deg, #f9f5ff 0%, #c8c7ff 48%, #9df4ff 100%);
          box-shadow: 0 0 13px rgba(191, 225, 255, .7);
          font-size: 22px;
          line-height: 1;
          letter-spacing: 0;
        }
        .logout.magic-logout:hover {
          color: #ffffff;
          transform: translateY(-2px) scale(1.015);
          box-shadow:
            0 0 12px 3px rgba(178, 86, 255, .65),
            0 0 26px 7px rgba(101, 100, 255, .43),
            0 0 44px 10px rgba(58, 207, 255, .32),
            inset 0 0 20px rgba(75, 91, 255, .26);
        }
        .logout.magic-logout:focus-visible { outline: 3px solid #8feeff; outline-offset: 5px; }
        @keyframes logout-spectrum {
          0% { background-position: 0 0, 0% 50%; }
          100% { background-position: 0 0, 100% 50%; }
        }
        @keyframes logout-aura {
          from { opacity: .32; filter: blur(12px); }
          to { opacity: .62; filter: blur(18px); }
        }

        @media (min-width: 1500px) {
          .hero { min-height: 250px; }
          .career-stat { min-height: 138px; }
          .chart-card { min-height: 390px; }
          .career-header h3 { font-size: 23px; }
          .career-stat small { font-size: 13px; }
          .career-stat strong { font-size: 29px; }
          .stat small { font-size: 14px; }
          .stat b { font-size: 30px; }
        }
        @media (max-width: 1100px) {
          .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .career-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .performance-grid { grid-template-columns: minmax(0, 1fr); }
          .career-stat { min-height: 112px; }
          .chart-card { min-height: 320px; }
          .grid label { font-size: 13px; }
          .grid p { font-size: 15px; }
        }
        @media (max-width: 620px) {
          .page { padding: 9px 8px 18px; }
          .dashboard-content { gap: 12px; }
          .hero { min-height: 205px; padding: 23px 12px 21px; }
          .hero h1 { font-size: clamp(25px, 7vw, 32px); }
          .ign { font-size: 14px; }
          .tag { font-size: 12px; padding: 7px 12px; }
          .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .stat { min-height: 78px; padding: 12px 10px; gap: 8px; }
          .stat span { font-size: 22px; }
          .stat small { font-size: 11px; }
          .stat b { font-size: 22px; }
          .earning-stat b { font-size: 18px; }
          .career-section { padding: 15px 10px; }
          .career-header h3 { font-size: 17px; }
          .career-header p { font-size: 13px; }
          .filter-buttons { gap: 7px; margin: 15px 0; }
          .filter-btn { flex: 1 1 calc(50% - 7px); min-height: 42px; padding: 10px 7px; font-size: 11px; }
          .career-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .career-stat { min-height: 102px; padding: 11px 6px; }
          .career-stat span { font-size: 22px; }
          .career-stat small { font-size: 10px; }
          .career-stat strong { font-size: 21px; }
          .performance-grid { grid-template-columns: minmax(0, 1fr); gap: 10px; }
          .chart-card { min-height: 290px; padding: 14px 11px; }
          .chart-heading h4 { font-size: 16px; }
          .chart-heading p { font-size: 13px; }
          .chart-chip { font-size: 11px; }
          .chart-legend { font-size: 12px; }
          .chart-axis-label { font-size: 12px; }
          .chart-empty { font-size: 13px; }
          .card { padding: 17px 12px; }
          .card h3 { font-size: 16px; margin-bottom: 18px; }
          .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 17px 10px; }
          .grid label { font-size: 11px; }
          .grid p { font-size: 13px; }
          .exp label { font-size: 12px; }
          .exp p { font-size: 14px; }
          .weapon, .social { font-size: 12px; }
          .dashboard-bottom-actions { padding-top: 18px; }
          .logout.magic-logout { width: 100%; max-width: 320px; min-height: 64px; font-size: 14px; }
          .logout-arrow { width: 31px; height: 31px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .logout.magic-logout, .logout.magic-logout::after { animation: none !important; transition: none !important; }
        }



        /* ACCESSIBILITY READABILITY FIX — deliberately larger type throughout */
        .page { font-size: 18px !important; }
        .hero h1 { font-size: clamp(34px, 2.4vw, 44px) !important; line-height: 1.2 !important; font-weight: 950 !important; }
        .ign { font-size: 18px !important; line-height: 1.5 !important; font-weight: 850 !important; }
        .tag { font-size: 14px !important; min-height: 36px !important; padding: 9px 16px !important; font-weight: 900 !important; }
        .stat { min-height: 92px !important; padding: 18px !important; }
        .stat span { font-size: 28px !important; }
        .stat small { font-size: 15px !important; line-height: 1.4 !important; letter-spacing: .45px !important; font-weight: 850 !important; color: #e1ebff !important; }
        .stat b { font-size: 30px !important; line-height: 1.25 !important; font-weight: 950 !important; color: #fff !important; }
        .earning-stat b { font-size: 25px !important; }
        .career-header h3 { font-size: 23px !important; line-height: 1.35 !important; font-weight: 950 !important; }
        .career-header p { font-size: 15px !important; line-height: 1.55 !important; color: #e0eaff !important; }
        .filter-btn { min-height: 48px !important; padding: 12px 18px !important; font-size: 14px !important; font-weight: 950 !important; letter-spacing: .4px !important; }
        .custom-date-filter label { font-size: 15px !important; }
        .custom-date-filter input { font-size: 16px !important; min-height: 46px !important; }
        .clear-date-btn { font-size: 14px !important; min-height: 46px !important; }
        .career-stat { min-height: 126px !important; padding: 18px 12px !important; }
        .career-stat span { font-size: 30px !important; margin-bottom: 10px !important; }
        .career-stat small { font-size: 13px !important; line-height: 1.45 !important; letter-spacing: .5px !important; font-weight: 900 !important; color: #e1ebff !important; }
        .career-stat strong { font-size: 30px !important; line-height: 1.25 !important; margin-top: 8px !important; font-weight: 950 !important; color: #fff !important; }
        .chart-card { min-height: 380px !important; padding: 22px !important; }
        .chart-heading h4 { font-size: 20px !important; line-height: 1.4 !important; font-weight: 950 !important; }
        .chart-heading p { font-size: 15px !important; line-height: 1.55 !important; color: #e0eaff !important; }
        .chart-chip { font-size: 13px !important; padding: 8px 12px !important; font-weight: 900 !important; }
        .chart-legend { font-size: 15px !important; line-height: 1.6 !important; color: #f0f5ff !important; }
        .chart-axis-label { font-size: 14px !important; }
        .chart-empty { font-size: 15px !important; line-height: 1.6 !important; color: #e2ecff !important; }
        .card h3 { font-size: 21px !important; line-height: 1.4 !important; font-weight: 950 !important; margin-bottom: 22px !important; }
        .grid { gap: 24px 22px !important; }
        .grid label { font-size: 15px !important; line-height: 1.5 !important; font-weight: 850 !important; color: #dce8ff !important; }
        .grid p { font-size: 18px !important; line-height: 1.6 !important; font-weight: 750 !important; color: #fff !important; }
        .exp label { font-size: 15px !important; }
        .exp p { font-size: 18px !important; }
        .weapon, .social { font-size: 15px !important; padding: 12px 16px !important; font-weight: 900 !important; }
        .empty { font-size: 15px !important; line-height: 1.6 !important; }
        .logout.magic-logout { font-size: 16px !important; min-height: 70px !important; }

        @media (min-width: 1500px) {
          .stat small { font-size: 16px !important; }
          .career-stat small { font-size: 14px !important; }
          .chart-axis-label { font-size: 15px !important; }
          .grid label { font-size: 16px !important; }
          .grid p { font-size: 19px !important; }
        }
        @media (max-width: 1100px) {
          .stat small { font-size: 14px !important; }
          .stat b { font-size: 28px !important; }
          .career-stat small { font-size: 13px !important; }
          .career-stat strong { font-size: 27px !important; }
          .grid label { font-size: 14px !important; }
          .grid p { font-size: 16px !important; }
          .chart-heading h4 { font-size: 19px !important; }
          .chart-heading p, .chart-legend, .chart-empty { font-size: 14px !important; }
        }
        @media (max-width: 620px) {
          .page { font-size: 16px !important; padding: 9px 8px 18px !important; }
          .hero h1 { font-size: clamp(27px, 7.2vw, 34px) !important; }
          .ign { font-size: 15px !important; }
          .tag { font-size: 12px !important; min-height: 32px !important; padding: 7px 12px !important; }
          .stat { min-height: 80px !important; padding: 12px 10px !important; }
          .stat span { font-size: 23px !important; }
          .stat small { font-size: 12px !important; }
          .stat b { font-size: 24px !important; }
          .earning-stat b { font-size: 19px !important; }
          .career-header h3 { font-size: 18px !important; }
          .career-header p { font-size: 13px !important; }
          .filter-btn { min-height: 43px !important; padding: 10px 7px !important; font-size: 11px !important; }
          .career-stat { min-height: 106px !important; padding: 12px 6px !important; }
          .career-stat span { font-size: 24px !important; }
          .career-stat small { font-size: 11px !important; }
          .career-stat strong { font-size: 23px !important; }
          .chart-card { min-height: 300px !important; padding: 15px 11px !important; }
          .chart-heading h4 { font-size: 17px !important; }
          .chart-heading p { font-size: 13px !important; }
          .chart-chip { font-size: 11px !important; }
          .chart-legend { font-size: 12px !important; }
          .chart-axis-label { font-size: 12px !important; }
          .chart-empty { font-size: 13px !important; }
          .card { padding: 17px 12px !important; }
          .card h3 { font-size: 17px !important; margin-bottom: 18px !important; }
          .grid { gap: 18px 10px !important; }
          .grid label { font-size: 12px !important; }
          .grid p { font-size: 14px !important; }
          .exp label { font-size: 12px !important; }
          .exp p { font-size: 15px !important; }
          .weapon, .social { font-size: 12px !important; padding: 10px 12px !important; }
          .empty { font-size: 13px !important; }
          .logout.magic-logout { font-size: 14px !important; min-height: 64px !important; }
        }



        /* LARGE-TYPE PASS — scale text to the wide dashboard cards */
        /* Desktop: type scales with the large full-width cards instead of staying tiny. */
        .page { font-size: clamp(20px, 1vw, 34px) !important; }
        .hero h1 { font-size: clamp(42px, 2.4vw, 72px) !important; line-height: 1.16 !important; font-weight: 950 !important; }
        .ign { font-size: clamp(20px, 1.1vw, 34px) !important; line-height: 1.4 !important; font-weight: 900 !important; }
        .tag { font-size: clamp(16px, .7vw, 24px) !important; min-height: 40px !important; padding: 10px 18px !important; font-weight: 950 !important; }
        .stat { min-height: 112px !important; padding: 20px !important; gap: 8px !important; }
        .stat span { font-size: clamp(28px, 1.2vw, 42px) !important; }
        .stat small { font-size: clamp(18px, .9vw, 32px) !important; line-height: 1.35 !important; letter-spacing: .3px !important; font-weight: 950 !important; color: #f3f7ff !important; }
        .stat b { font-size: clamp(34px, 1.5vw, 60px) !important; line-height: 1.2 !important; font-weight: 950 !important; color: #fff !important; }
        .earning-stat b { font-size: clamp(28px, 1.25vw, 48px) !important; }
        .career-header h3 { font-size: clamp(28px, 1.35vw, 46px) !important; line-height: 1.25 !important; font-weight: 950 !important; letter-spacing: .4px !important; }
        .career-header p { font-size: clamp(18px, .9vw, 30px) !important; line-height: 1.5 !important; color: #edf3ff !important; }
        .filter-buttons { gap: 12px !important; margin: 24px 0 20px !important; }
        .filter-btn { min-height: 54px !important; padding: 13px 22px !important; font-size: clamp(17px, .85vw, 30px) !important; font-weight: 950 !important; letter-spacing: .3px !important; }
        .custom-date-filter label { font-size: clamp(18px, .85vw, 28px) !important; }
        .custom-date-filter input { font-size: clamp(18px, .9vw, 30px) !important; min-height: 54px !important; }
        .clear-date-btn { font-size: clamp(17px, .8vw, 28px) !important; min-height: 54px !important; }
        .career-stat { min-height: 156px !important; padding: 22px 14px !important; gap: 5px !important; }
        .career-stat span { font-size: clamp(32px, 1.25vw, 46px) !important; margin-bottom: 8px !important; }
        .career-stat small { font-size: clamp(18px, .9vw, 32px) !important; line-height: 1.35 !important; letter-spacing: .2px !important; font-weight: 950 !important; color: #f0f5ff !important; }
        .career-stat strong { font-size: clamp(36px, 1.55vw, 62px) !important; line-height: 1.2 !important; margin-top: 8px !important; font-weight: 950 !important; color: #fff !important; }
        .chart-card { min-height: 440px !important; padding: 24px !important; }
        .chart-heading h4 { font-size: clamp(24px, 1.15vw, 40px) !important; line-height: 1.3 !important; font-weight: 950 !important; }
        .chart-heading p { font-size: clamp(18px, .85vw, 29px) !important; line-height: 1.5 !important; color: #eaf1ff !important; }
        .chart-chip { font-size: clamp(15px, .65vw, 23px) !important; padding: 9px 14px !important; font-weight: 950 !important; }
        .chart-legend { font-size: clamp(18px, .85vw, 29px) !important; line-height: 1.6 !important; color: #f4f7ff !important; }
        .chart-axis-label { font-size: clamp(18px, .8vw, 30px) !important; }
        .chart-empty { font-size: clamp(18px, .9vw, 30px) !important; line-height: 1.5 !important; color: #eef4ff !important; font-weight: 650 !important; }
        .card { padding: 24px !important; }
        .card h3 { font-size: clamp(24px, 1.1vw, 38px) !important; line-height: 1.3 !important; font-weight: 950 !important; margin-bottom: 24px !important; letter-spacing: .5px !important; }
        .grid { gap: 28px 24px !important; }
        .grid label { font-size: clamp(18px, .9vw, 32px) !important; line-height: 1.4 !important; font-weight: 900 !important; color: #e3edff !important; margin-bottom: 8px !important; }
        .grid p { font-size: clamp(24px, 1.15vw, 40px) !important; line-height: 1.5 !important; font-weight: 800 !important; color: #fff !important; }
        .exp { gap: 24px !important; }
        .exp label { font-size: clamp(18px, .9vw, 32px) !important; line-height: 1.4 !important; font-weight: 900 !important; }
        .exp p { font-size: clamp(24px, 1.15vw, 40px) !important; line-height: 1.5 !important; font-weight: 800 !important; }
        .weapon, .social { font-size: clamp(17px, .8vw, 28px) !important; padding: 14px 20px !important; font-weight: 900 !important; }
        .empty { font-size: clamp(18px, .9vw, 30px) !important; line-height: 1.5 !important; }
        .logout.magic-logout { font-size: clamp(18px, .9vw, 30px) !important; min-height: 78px !important; }

        @media (max-width: 1100px) {
          .stat small { font-size: 17px !important; }
          .stat b { font-size: 32px !important; }
          .career-stat small { font-size: 16px !important; }
          .career-stat strong { font-size: 32px !important; }
          .grid label, .exp label { font-size: 16px !important; }
          .grid p, .exp p { font-size: 20px !important; }
          .chart-heading h4 { font-size: 22px !important; }
          .chart-heading p, .chart-legend, .chart-empty { font-size: 16px !important; }
        }
        @media (max-width: 620px) {
          .page { font-size: 16px !important; padding: 10px 9px 22px !important; }
          .hero h1 { font-size: clamp(28px, 7.4vw, 36px) !important; }
          .ign { font-size: 16px !important; }
          .tag { font-size: 13px !important; min-height: 34px !important; padding: 8px 12px !important; }
          .stat { min-height: 86px !important; padding: 13px 10px !important; gap: 5px !important; }
          .stat span { font-size: 24px !important; }
          .stat small { font-size: 13px !important; }
          .stat b { font-size: 27px !important; }
          .earning-stat b { font-size: 20px !important; }
          .career-header h3 { font-size: 20px !important; }
          .career-header p { font-size: 14px !important; }
          .filter-btn { min-height: 46px !important; padding: 10px 8px !important; font-size: 12px !important; }
          .career-stat { min-height: 112px !important; padding: 13px 6px !important; }
          .career-stat span { font-size: 24px !important; }
          .career-stat small { font-size: 13px !important; }
          .career-stat strong { font-size: 26px !important; }
          .chart-card { min-height: 300px !important; padding: 15px 11px !important; }
          .chart-heading h4 { font-size: 18px !important; }
          .chart-heading p { font-size: 14px !important; }
          .chart-chip { font-size: 12px !important; }
          .chart-legend { font-size: 13px !important; }
          .chart-axis-label { font-size: 13px !important; }
          .chart-empty { font-size: 14px !important; }
          .card { padding: 17px 12px !important; }
          .card h3 { font-size: 18px !important; margin-bottom: 18px !important; }
          .grid { gap: 18px 10px !important; }
          .grid label, .exp label { font-size: 13px !important; }
          .grid p, .exp p { font-size: 16px !important; }
          .exp { gap: 18px !important; }
          .weapon, .social { font-size: 12px !important; padding: 10px 12px !important; }
          .empty { font-size: 14px !important; }
          .logout.magic-logout { font-size: 15px !important; min-height: 66px !important; }
        }

      `}</style>
    </main>
  );
}
