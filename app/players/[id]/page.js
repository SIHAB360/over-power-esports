import CopyUID from "../../components/CopyUID";
import { supabase } from "../../lib/supabase";

/* =========================================================
   STATIC PUBLIC PLAYER DATA
   Used for public slug, highlights and fallback information.
========================================================= */

const PLAYER_PROFILES = {
  appelo: {
    name: "SAKIB HASAN",
    ign: "EXE APPELO",
    uid: "1673606480",

    role: "PRIMARY RUSHER",
    team: "OVER POWER MAIN TEAM",

    experience: "5 Month",
    profession: "Student",
    age: "19",
    joinDate: "2026-03-01",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka, Bangladesh",
    status: "Active",

    image: "/players/appelo.png",

    facebook:
      "https://www.facebook.com/share/19XKoR58cb/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/_appelo_ff",
    youtube: "https://youtube.com/@appelo_ff",
    tiktok: "https://www.tiktok.com/@appelo_offical",

    youtubeVideos: [
      "94JjtPH6Rp4",
      "WiXfH8lHkao",
      "T9gEdEC1BqA",
      "S12LAik5ovc",
      "8jzmVk4sd2Q",
      "p9Bf-zGCefg",
    ],
  },

  oggy: {
    name: "SOMIR",
    ign: "BE1NG OGGY",
    uid: "4455951906",

    role: "SECONDARY RUSHER",
    team: "OVER POWER MAIN TEAM",

    experience: "1 Year",
    profession: "Student",
    age: "17",
    joinDate: "2026-08-21",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka",
    status: "Active",

    image: "/players/oggy.png",

    facebook: "https://www.facebook.com/share/1JEkiAK2J6/",
    instagram: "https://www.instagram.com/being_ogggyy",
    youtube: "https://youtube.com/@being_ogggyy",
    tiktok: "https://www.tiktok.com/@being_ogggyy",

    youtubeVideos: [],
  },

  itachix: {
    name: "MD SALMAN",
    ign: "OP ITACHIx",
    uid: "7743068119",

    role: "BOMBER",
    team: "OVER POWER MAIN TEAM",

    experience: "1 Year",
    profession: "Student",
    age: "17",
    joinDate: "2026-05-01",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka",
    status: "Active",

    image: "/players/itachix.png",

    facebook:
      "https://www.facebook.com/profile.php?id=61590102347309",
    instagram: "",
    youtube: "https://youtube.com/@itachiontop-r2p",
    tiktok: "https://www.tiktok.com/@itachix074",

    youtubeVideos: ["89Z_9Rffa1M", "-dzH4tBo0yY"],
  },

  rejwan: {
    name: "REJWAN AHAMMED",
    ign: "OP REJWAN",
    uid: "1111551408",

    role: "IGL + SUPPORTER",
    team: "OVER POWER MAIN TEAM",

    experience: "8 Month",
    profession: "JOB HOLDER",
    age: "18",
    joinDate: "2026-04-23",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka",
    status: "Active",

    image: "/players/rejwan.png",

    facebook: "https://www.facebook.com/rejwan.ahammed11",
    instagram: "https://www.instagram.com/rahammed_",
    youtube: "https://youtube.com/@rejwan-ff6711",
    tiktok: "https://www.tiktok.com/@rejwanahammed",

    youtubeVideos: [
      "YzetH_r6KpE",
      "1OGnv9NlgnI",
      "G9O0kwdpLmA",
      "CoRiZx_oFCU",
      "a7kPD66eTlU",
      "V2hA8Sl049Q",
    ],
  },

  fixfire: {
    name: "JISAN BISWAS",
    ign: "FixFIRE",
    uid: "63999291",

    role: "SNIPER",
    team: "OVER POWER MAIN TEAM",

    experience: "3 Years",
    profession: "Student",
    age: "21",
    joinDate: "2026-07-26",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka",
    status: "Active",

    image: "/players/fixfire.png",

    facebook: "https://www.facebook.com/share/1DYEWmWzRr/",
    instagram: "https://www.instagram.com/xr_jisan09",
    youtube: "https://www.youtube.com/@fixfire09",
    tiktok: "https://tiktok.com/@fixfire09",

    youtubeVideos: [
      "1L7XQBFOoEk",
      "eh7GKKDVvoY",
      "q1VdGlmr8_g",
      "G5tMntbjd_s",
      "JD9yIRFYHco",
      "m1s34WavzGw",
    ],
  },

  /* =====================================================
     OVER POWER ELITE
  ===================================================== */

  foysal: {
    name: "MD FOYSAL",
    ign: "OP RF NTC",
    uid: "2628615876",

    role: "PRIMARY RUSHER",
    team: "OVER POWER ELITE",

    experience: "1 Year",
    profession: "OUT OF COUNTRY",
    age: "23",
    joinDate: "2026-07-20",
    nationality: "Malaysia",
    location: "Kuala Lumpur",
    status: "Active",

    image: "/players/rfntc.png",

    facebook: "https://www.facebook.com/share/1GyYZjBWmZ/",
    instagram:
      "https://www.instagram.com/md_rasel._123?stkn=MTY5ZjBtbDEwZWtweA==",
    youtube: "https://www.youtube.com/@EmranKhan-y1p4s",
    tiktok: "https://www.tiktok.com/@emran.khan3103",

    youtubeVideos: [],
  },

  jellal: {
    name: "SHAWON AHMED",
    ign: "OP JELLAL",
    uid: "6587036423",

    role: "SECONDARY RUSHER",
    team: "OVER POWER ELITE",

    experience: "6 Month",
    profession: "JOB HOLDER",
    age: "21",
    joinDate: "2026-07-26",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka",
    status: "Active",

    image: "/players/jellal.png",

    facebook: "https://www.facebook.com/ew.r.sawon.739315",
    instagram:
      "https://www.instagram.com/sgr100m?stkn=NjFqMDVyamx3OGth",
    youtube: "https://youtube.com/@sgr100m?si=dPon0FOtSGuXmpbo",
    tiktok: "",

    youtubeVideos: [
      "sOU0G3abc0M",
      "Q_qe4D70jFE",
      "w2hgp0jga1w",
      "lQZ8SeM75Mg",
      "EJZTmnixjIg",
      "_Cg-g_K-6ic",
    ],
  },

  sojib: {
    name: "MD SOJIB",
    ign: "SOJIB",
    uid: "",

    role: "BOMBER",
    team: "OVER POWER ELITE",

    experience: "1 Year",
    profession: "STUDENT",
    age: "18",
    joinDate: "2026-09-06",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka",
    status: "Active",

    image: "/players/sojib.png",

    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",

    youtubeVideos: [],
  },

  nafiz: {
    name: "MD NAFIZ",
    ign: "NXE NAFIZ",
    uid: "5540170894",

    role: "SUPPORTER",
    team: "OVER POWER ELITE",

    experience: "1 Year",
    profession: "STUDENT",
    age: "22",
    joinDate: "2026-08-31",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka",
    status: "Active",

    image: "/players/nafiz.jpeg",

    facebook: "https://www.facebook.com/share/1FrtytpbHg/",
    instagram:
      "https://www.instagram.com/nxe_nafiz_00?stkn=MWVpNHd3OTg5bGZ1Yg==",
    youtube: "https://www.youtube.com/@MdBijoy-t7m",
    tiktok:
      "https://www.tiktok.com/@md.bijoy4059?_r=1&_t=ZS-99aN1LHLXrc",

    youtubeVideos: [],
  },

  baymax: {
    name: "SAIF AHMED",
    ign: "OP BAYMAX",
    uid: "15767917163",

    role: "SNIPER",
    team: "OVER POWER ELITE",

    experience: "4 Month",
    profession: "STUDENT",
    age: "20",
    joinDate: "2026-07-23",
    nationality: "Bangladesh 🇧🇩",
    location: "Dhaka",
    status: "Active",

    image: "/players/baymax.png",

    facebook: "https://www.facebook.com/share/18E6u8Mo18/",
    instagram:
      "https://www.instagram.com/_mhs_1037?stkn=eTRybnAyb2c1Zmxn",
    youtube: "https://youtube.com/@mhsgaming211?si=3JJBWuI_a_a5KRpt",
    tiktok: "",

    youtubeVideos: ["yDz2FzDJFc0", "u2wJUDb72xc", "DDfeZfVBJzQ"],
  },
};

/* =========================================================
   HELPERS
========================================================= */

function getExperience(joinDate) {
  if (!joinDate) return "N/A";

  const start = new Date(joinDate);
  const now = new Date();

  if (Number.isNaN(start.getTime())) {
    return "N/A";
  }

  if (start > now) {
    return "0 Months";
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (now.getDate() < start.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0 && months > 0) {
    return `${years} Year${years > 1 ? "s" : ""} ${months} Month${
      months > 1 ? "s" : ""
    }`;
  }

  if (years > 0) {
    return `${years} Year${years > 1 ? "s" : ""}`;
  }

  return `${Math.max(months, 0)} Month${months === 1 ? "" : "s"}`;
}

function formatDate(date) {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function cleanVideoIds(videos = []) {
  const cleaned = videos
    .filter(Boolean)
    .map((video) => String(video).split("&")[0].split("?")[0].trim())
    .filter(Boolean);

  return [...new Set(cleaned)];
}

function isUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function formatMoney(value) {
  const number = Number(value || 0);

  return `৳${number.toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}

/* =========================================================
   PAGE
========================================================= */

export default async function PlayerProfile({ params }) {
  const resolvedParams = await params;

  const routeId = decodeURIComponent(resolvedParams?.id || "")
    .trim()
    .toLowerCase();

  const staticPlayer = PLAYER_PROFILES[routeId] || null;

  let dbPlayer = null;

  /* =======================================================
     PLAYER DATABASE LOOKUP

     Priority:
     1. Free Fire UID from static public profile
     2. UUID route
     3. Full name fallback
     4. IGN fallback
  ======================================================= */

  if (staticPlayer?.uid) {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("freefire_uid", staticPlayer.uid)
      .limit(1)
      .maybeSingle();

    dbPlayer = data || null;
  }

  if (!dbPlayer && isUUID(routeId)) {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("id", routeId)
      .limit(1)
      .maybeSingle();

    dbPlayer = data || null;
  }

  if (!dbPlayer && staticPlayer?.name) {
    const { data } = await supabase
      .from("players")
      .select("*")
      .ilike("full_name", `%${staticPlayer.name}%`)
      .limit(1)
      .maybeSingle();

    dbPlayer = data || null;
  }

  if (!dbPlayer) {
    const safeRouteId = routeId.replace(/[%_]/g, "");

    if (safeRouteId) {
      const { data } = await supabase
        .from("players")
        .select("*")
        .ilike("ign", `%${safeRouteId}%`)
        .limit(1)
        .maybeSingle();

      dbPlayer = data || null;
    }
  }

  /*
    If both database and static profile are missing,
    this is a truly unknown player.
  */

  if (!dbPlayer && !staticPlayer) {
    return (
      <section className="esports-profile">
        <div className="profile-header">
          <div className="player-heading">
            <h1>Player Not Found</h1>
            <p>No player profile was found for this URL.</p>
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     MERGE DATABASE + STATIC FALLBACK DATA
  ======================================================= */

  const player = {
    id: dbPlayer?.id || null,

    name:
      dbPlayer?.full_name ||
      staticPlayer?.name ||
      "Unknown Player",

    ign:
      dbPlayer?.ign ||
      staticPlayer?.ign ||
      "Unknown IGN",

    uid:
      dbPlayer?.freefire_uid ||
      staticPlayer?.uid ||
      "",

    role:
      dbPlayer?.primary_role ||
      dbPlayer?.position ||
      staticPlayer?.role ||
      "N/A",

    secondaryRole:
      dbPlayer?.secondary_role ||
      "",

    team:
      dbPlayer?.team_name ||
      staticPlayer?.team ||
      "N/A",

    experience:
      dbPlayer?.experience ||
      staticPlayer?.experience ||
      "N/A",

    profession:
      staticPlayer?.profession ||
      "N/A",

    age:
      dbPlayer?.age ??
      staticPlayer?.age ??
      "N/A",

    joinDate:
      dbPlayer?.joining_date ||
      staticPlayer?.joinDate ||
      null,

    nationality:
      dbPlayer?.country ||
      staticPlayer?.nationality ||
      "N/A",

    location:
      dbPlayer?.full_address ||
      staticPlayer?.location ||
      "N/A",

    status:
      dbPlayer?.status ||
      staticPlayer?.status ||
      "N/A",

    image:
      dbPlayer?.profile_image ||
      dbPlayer?.avatar_url ||
      staticPlayer?.image ||
      "/players/default.png",

    facebook:
      dbPlayer?.facebook_link ||
      staticPlayer?.facebook ||
      "",

    instagram:
      dbPlayer?.instagram_link ||
      staticPlayer?.instagram ||
      "",

    youtube:
      dbPlayer?.youtube_link ||
      staticPlayer?.youtube ||
      "",

    tiktok:
      dbPlayer?.tiktok_link ||
      staticPlayer?.tiktok ||
      "",

    previousTeam:
      dbPlayer?.previous_team ||
      "",

    device:
      dbPlayer?.device ||
      "N/A",

    internet:
      dbPlayer?.internet_connection ||
      "N/A",

    practiceTime:
      dbPlayer?.practice_time ||
      "N/A",

    gameExperience:
      dbPlayer?.game_experience ||
      "N/A",

    tournamentExperience:
      dbPlayer?.tournament_experience ||
      "N/A",

    kdRate:
      dbPlayer?.average_br_kd_rate ||
      "N/A",

    expertWeapon:
      dbPlayer?.expert_weapon ||
      "N/A",

    youtubeVideos: cleanVideoIds(
      staticPlayer?.youtubeVideos || []
    ),
  };

  /* =======================================================
     PLAYER MATCH STATISTICS
  ======================================================= */

  let stats = [];

  if (player.id) {
    const { data } = await supabase
      .from("match_player_stats")
      .select("kills, assists, damage, mvp, placement")
      .eq("player_id", player.id);

    stats = data || [];
  }

  const totalMatches = stats.length;

  const totalKills = stats.reduce(
    (sum, item) => sum + Number(item.kills || 0),
    0
  );

  const totalAssists = stats.reduce(
    (sum, item) => sum + Number(item.assists || 0),
    0
  );

  const totalDamage = stats.reduce(
    (sum, item) => sum + Number(item.damage || 0),
    0
  );

  const totalMVP = stats.filter(
    (item) => item.mvp === true
  ).length;

  /* =======================================================
     PLAYER EARNINGS
  ======================================================= */

  let earnings = [];

  if (player.id) {
    const { data } = await supabase
      .from("player_earnings")
      .select("amount")
      .eq("player_id", player.id);

    earnings = data || [];
  }

  const totalEarning = earnings.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const statusValue = String(player.status || "").toLowerCase();

  const isActive =
    statusValue === "active" ||
    statusValue === "approved" ||
    statusValue === "verified";

  return (
    <section className="esports-profile">
      {/* ===================================================
          PROFILE HEADER
      =================================================== */}

      <div className="profile-header reveal-header">
        <div className="player-heading">
          <h1>{player.ign}</h1>

          <h3>{player.role}</h3>

          <h4>{player.team}</h4>

          <p>
            Professional Free Fire esports player of Over Power Esports.
          </p>
        </div>

        <div className="winning-card reveal-win">
          <span>🏆 TOTAL WINNINGS</span>

          <h2>{formatMoney(totalEarning)}</h2>
        </div>
      </div>

      <div className="profile-layout">
        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <aside className="profile-left">
          <div className="photo-box reveal-photo">
            <img
              className="profile-photo"
              src={player.image}
              alt={player.name}
            />
          </div>

          {/* =================================================
              PLAYER INFORMATION
          ================================================= */}

          <div className="info-box reveal-card">
            <h3>👤 PLAYER INFORMATION</h3>

            <div className="info-item">
              <label>👤 Player Name</label>
              <strong>{player.name}</strong>
            </div>

            <div className="info-item">
              <label>🎮 IGN Name</label>
              <strong>{player.ign}</strong>
            </div>

            <div className="info-item uid-box">
              <label>🆔 Game UID</label>

              <div className="uid-action">
                <strong>
                  {player.uid || "Not Available"}
                </strong>

                {player.uid && (
                  <CopyUID uid={player.uid} />
                )}
              </div>
            </div>

            <div className="info-item">
              <label>🎯 Primary Role</label>
              <strong>{player.role}</strong>
            </div>

            {player.secondaryRole && (
              <div className="info-item">
                <label>🎯 Secondary Role</label>
                <strong>{player.secondaryRole}</strong>
              </div>
            )}

            <div className="info-item">
              <label>🛡️ Team</label>
              <strong>{player.team}</strong>
            </div>

            <div className="info-item">
              <label>⏳ Experience</label>
              <strong>{player.experience}</strong>
            </div>

            <div className="info-item">
              <label>💼 Profession</label>
              <strong>{player.profession}</strong>
            </div>

            <div className="info-item">
              <label>🎂 Age</label>
              <strong>{player.age}</strong>
            </div>

            <div className="info-item">
              <label>📅 Join Date</label>
              <strong>{formatDate(player.joinDate)}</strong>
            </div>

            <div className="info-item">
              <label>🌍 Nationality</label>
              <strong>{player.nationality}</strong>
            </div>

            <div className="info-item">
              <label>📍 Location</label>
              <strong>{player.location}</strong>
            </div>

            <div className="info-item">
              <label>🟢 Status</label>

              <strong
                className={`player-status ${
                  isActive ? "active" : ""
                }`}
              >
                {player.status}
              </strong>
            </div>
          </div>

          {/* =================================================
              GAME DETAILS
          ================================================= */}

          <div className="info-box reveal-card">
            <h3>🎮 GAME DETAILS</h3>

            <div className="info-item">
              <label>📱 Device</label>
              <strong>{player.device}</strong>
            </div>

            <div className="info-item">
              <label>🌐 Internet</label>
              <strong>{player.internet}</strong>
            </div>

            <div className="info-item">
              <label>⏰ Practice Time</label>
              <strong>{player.practiceTime}</strong>
            </div>

            <div className="info-item">
              <label>🎮 Game Experience</label>
              <strong>{player.gameExperience}</strong>
            </div>

            <div className="info-item">
              <label>🏆 Tournament Experience</label>
              <strong>{player.tournamentExperience}</strong>
            </div>

            <div className="info-item">
              <label>📊 BR K/D Rate</label>
              <strong>{player.kdRate}</strong>
            </div>

            <div className="info-item">
              <label>🔫 Expert Weapon</label>
              <strong>{player.expertWeapon}</strong>
            </div>
          </div>

          {/* =================================================
              SOCIAL LINKS
          ================================================= */}

          <div className="info-box reveal-card">
            <h3>🔗 SOCIAL LINKS</h3>

            <div className="profile-social">
              {player.facebook && (
                <a
                  href={player.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                  Facebook
                </a>
              )}

              {player.instagram && (
                <a
                  href={player.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-instagram"></i>
                  Instagram
                </a>
              )}

              {player.youtube && (
                <a
                  href={player.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-youtube"></i>
                  YouTube
                </a>
              )}

              {player.tiktok && (
                <a
                  href={player.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-tiktok"></i>
                  TikTok
                </a>
              )}

              {!player.facebook &&
                !player.instagram &&
                !player.youtube &&
                !player.tiktok && (
                  <span>No social links available.</span>
                )}
            </div>
          </div>

          {/* =================================================
              TEAM HISTORY
          ================================================= */}

          <div className="info-box reveal-card">
            <h3>📜 TEAM HISTORY</h3>

            <p>
              {formatDate(player.joinDate)} - Present
              <br />

              <span>{player.team}</span>

              {player.previousTeam && (
                <>
                  <br />
                  <span>
                    Previous Team: {player.previousTeam}
                  </span>
                </>
              )}

              <br />

              <strong>
                🟢 Active For: {getExperience(player.joinDate)}
              </strong>
            </p>
          </div>
        </aside>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="profile-right">
          {/* =================================================
              CAREER STATISTICS
          ================================================= */}

          <div className="profile-table reveal-table">
            <h2>📊 CAREER STATISTICS</h2>

            <table>
              <thead>
                <tr>
                  <th>MATCHES</th>
                  <th>KILLS</th>
                  <th>ASSISTS</th>
                  <th>DAMAGE</th>
                  <th>MVP</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>{totalMatches}</td>
                  <td>{totalKills}</td>
                  <td>{totalAssists}</td>
                  <td>{totalDamage}</td>
                  <td>{totalMVP}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* =================================================
              ACHIEVEMENTS
          ================================================= */}

          <div className="profile-table reveal-table">
            <h2>🏆 ACHIEVEMENTS</h2>

            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TIER</th>
                  <th>TOURNAMENT</th>
                  <th>PRIZE</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>2026</td>
                  <td>A-Tier</td>
                  <td>Free Fire Championship</td>
                  <td>$120</td>
                </tr>

                <tr>
                  <td>2026</td>
                  <td>A-Tier</td>
                  <td>Asia Invitational</td>
                  <td>$181</td>
                </tr>

                <tr>
                  <td>2026</td>
                  <td>C-Tier</td>
                  <td>Community Tournament</td>
                  <td>$48</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* =================================================
              AWARDS
          ================================================= */}

          <div className="profile-table reveal-table">
            <h2>🏅 AWARDS</h2>

            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>AWARD</th>
                  <th>ORGANIZATION</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>2026</td>
                  <td>Elite Player Award</td>
                  <td>Over Power Esports</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* =================================================
              PLAYER HIGHLIGHTS
          ================================================= */}

          <div className="profile-table video-gallery">
            <h2>🎬 PLAYER HIGHLIGHTS</h2>

            {player.youtubeVideos.length > 0 ? (
              <div className="video-grid">
                {player.youtubeVideos.map(
                  (video, index) => (
                    <div
                      className="video-card"
                      key={`${video}-${index}`}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${video}`}
                        title={`${player.ign} Highlight ${
                          index + 1
                        }`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p>No player highlights available yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
