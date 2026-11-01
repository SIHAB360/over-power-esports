import CopyUID from "../../components/CopyUID";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;


/* =========================================================
   STATIC PUBLIC PLAYER DATA
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

    instagram:
      "https://www.instagram.com/_appelo_ff",

    youtube:
      "https://youtube.com/@appelo_ff",

    tiktok:
      "https://www.tiktok.com/@appelo_offical",

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

    facebook:
      "https://www.facebook.com/share/1JEkiAK2J6/",

    instagram:
      "https://www.instagram.com/being_ogggyy",

    youtube:
      "https://youtube.com/@being_ogggyy",

    tiktok:
      "https://www.tiktok.com/@being_ogggyy",

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

    youtube:
      "https://youtube.com/@itachiontop-r2p",

    tiktok:
      "https://www.tiktok.com/@itachix074",

    youtubeVideos: [
      "89Z_9Rffa1M",
      "-dzH4tBo0yY",
    ],
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

    facebook:
      "https://www.facebook.com/rejwan.ahammed11",

    instagram:
      "https://www.instagram.com/rahammed_",

    youtube:
      "https://youtube.com/@rejwan-ff6711",

    tiktok:
      "https://www.tiktok.com/@rejwanahammed",

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

    facebook:
      "https://www.facebook.com/share/1DYEWmWzRr/",

    instagram:
      "https://www.instagram.com/xr_jisan09",

    youtube:
      "https://www.youtube.com/@fixfire09",

    tiktok:
      "https://tiktok.com/@fixfire09",

    youtubeVideos: [
      "1L7XQBFOoEk",
      "eh7GKKDVvoY",
      "q1VdGlmr8_g",
      "G5tMntbjd_s",
      "JD9yIRFYHco",
      "m1s34WavzGw",
    ],
  },


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

    facebook:
      "https://www.facebook.com/share/1GyYZjBWmZ/",

    instagram:
      "https://www.instagram.com/md_rasel._123",

    youtube:
      "https://www.youtube.com/@EmranKhan-y1p4s",

    tiktok:
      "https://www.tiktok.com/@emran.khan3103",

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

    facebook:
      "https://www.facebook.com/ew.r.sawon.739315",

    instagram:
      "https://www.instagram.com/sgr100m",

    youtube:
      "https://youtube.com/@sgr100m",

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

    facebook:
      "https://www.facebook.com/share/1FrtytpbHg/",

    instagram:
      "https://www.instagram.com/nxe_nafiz_00",

    youtube:
      "https://www.youtube.com/@MdBijoy-t7m",

    tiktok:
      "https://www.tiktok.com/@md.bijoy4059",

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

    facebook:
      "https://www.facebook.com/share/18E6u8Mo18/",

    instagram:
      "https://www.instagram.com/_mhs_1037",

    youtube:
      "https://youtube.com/@mhsgaming211",

    tiktok: "",

    youtubeVideos: [
      "yDz2FzDJFc0",
      "u2wJUDb72xc",
      "DDfeZfVBJzQ",
    ],
  },

};

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


  let years =
    now.getFullYear() -
    start.getFullYear();


  let months =
    now.getMonth() -
    start.getMonth();


  if (now.getDate() < start.getDate()) {
    months--;
  }


  if (months < 0) {
    years--;
    months += 12;
  }


  if (years > 0 && months > 0) {

    return `${years} Year${years > 1 ? "s" : ""} ${months} Month${months > 1 ? "s" : ""}`;

  }


  if (years > 0) {

    return `${years} Year${years > 1 ? "s" : ""}`;

  }


  return `${Math.max(months,0)} Month${months === 1 ? "" : "s"}`;

}



function formatDate(date) {

  if (!date) return "N/A";


  const parsed = new Date(date);


  if (Number.isNaN(parsed.getTime())) {

    return date;

  }


  return parsed.toLocaleDateString(
    "en-GB",
    {
      day:"numeric",
      month:"long",
      year:"numeric",
    }
  );

}

function formatMatchDate(value) {
  if (!value) return "Date not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
    timeZone: "Asia/Dhaka",
  });
}

function getMatchTypeLabel(type) {
  const labels = { CR: "CHAMPION RUSH", Scrim: "DAILY SCRIM", Official: "OFFICIAL TOURNAMENT", Custom: "CUSTOM TOURNAMENT" };
  return labels[type] || String(type || "MATCH").toUpperCase();
}

function getMatchStatusLabel(status) {
  const labels = { upcoming: "UPCOMING", live: "LIVE NOW", completed: "COMPLETED", cancelled: "CANCELLED" };
  return labels[String(status || "").toLowerCase()] || String(status || "SCHEDULED").toUpperCase();
}



function cleanVideoIds(videos = []) {

  const cleaned =
    videos
      .filter(Boolean)
      .map(
        video =>
          String(video)
          .split("&")[0]
          .split("?")[0]
          .trim()
      )
      .filter(Boolean);


  return [...new Set(cleaned)];

}


function decodeXmlText(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

async function fetchYouTubeUploads(channelUrl, fallbackIds = []) {
  const fallback = cleanVideoIds(fallbackIds).map((id, index) => ({
    id,
    title: `Player Highlight ${index + 1}`,
    published: "",
  }));

  if (!channelUrl || !/^https?:\/\//i.test(channelUrl)) return fallback;

  try {
    const parsed = new URL(channelUrl);
    if (!/(^|\.)youtube\.com$/i.test(parsed.hostname) &&
        !/(^|\.)youtu\.be$/i.test(parsed.hostname)) return fallback;

    let channelId = "";
    const directChannel = parsed.pathname.match(/\/channel\/(UC[\w-]{22})/);
    if (directChannel) channelId = directChannel[1];

    if (!channelId) {
      const channelResponse = await fetch(channelUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; OverPowerEsports/1.0)" },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(7000),
      });
      if (!channelResponse.ok) return fallback;

      const html = await channelResponse.text();
      const channelMatch =
        html.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/) ||
        html.match(/"externalId"\s*:\s*"(UC[\w-]{22})"/) ||
        html.match(/itemprop=["']channelId["'][^>]*content=["'](UC[\w-]{22})["']/i) ||
        html.match(/content=["'](UC[\w-]{22})["'][^>]*itemprop=["']channelId["']/i);

      channelId = channelMatch?.[1] || "";
    }

    if (!channelId) return fallback;

    const feedResponse = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; OverPowerEsports/1.0)" },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(7000),
      }
    );
    if (!feedResponse.ok) return fallback;

    const xml = await feedResponse.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
    const videos = entries.map((match) => {
      const entry = match[1];
      const id = entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1] || "";
      return id ? { id, title: decodeXmlText(title), published: published.slice(0, 10) } : null;
    }).filter(Boolean);

    return videos.length ? videos.slice(0, 6) : fallback;
  } catch (error) {
    console.warn("YouTube channel feed unavailable; using saved highlights:", error?.message);
    return fallback;
  }
}



function isUUID(value) {

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  .test(value);

}



function formatMoney(value) {

  const number =
    Number(value || 0);


  return `৳${number.toLocaleString(
    "en-BD",
    {
      maximumFractionDigits:2,
    }
  )}`;

}




export default async function PlayerProfile({
  params,
}) {


const resolvedParams = await params;


const routeId =
decodeURIComponent(
resolvedParams?.id || ""
)
.trim()
.toLowerCase();



const staticPlayer =
PLAYER_PROFILES[routeId] || null;



let dbPlayer = null;



/* ===========================
 PLAYER DATABASE LOOKUP
=========================== */


if (staticPlayer?.uid) {


const {data} =
await supabase
.from("players")
.select("*")
.eq(
"freefire_uid",
staticPlayer.uid
)
.limit(1)
.maybeSingle();


dbPlayer = data || null;


}



if(!dbPlayer && isUUID(routeId)){


const {data} =
await supabase
.from("players")
.select("*")
.eq(
"id",
routeId
)
.limit(1)
.maybeSingle();


dbPlayer = data || null;


}



if(!dbPlayer && staticPlayer?.name){


const {data} =
await supabase
.from("players")
.select("*")
.ilike(
"full_name",
`%${staticPlayer.name}%`
)
.limit(1)
.maybeSingle();


dbPlayer = data || null;


}



if(!dbPlayer){


const safeRouteId =
routeId.replace(
/[%_]/g,
""
);


if(safeRouteId){


const {data} =
await supabase
.from("players")
.select("*")
.ilike(
"ign",
`%${safeRouteId}%`
)
.limit(1)
.maybeSingle();


dbPlayer = data || null;


}

}





if(!dbPlayer && !staticPlayer){


return (

<section className="esports-profile">

<div className="profile-header">

<div className="player-heading">

<h1>
Player Not Found
</h1>

<p>
No player profile was found for this URL.
</p>

</div>

</div>

</section>

);


}




const player = {


id:
dbPlayer?.id || null,


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


image:
dbPlayer?.profile_image ||
dbPlayer?.avatar_url ||
staticPlayer?.image ||
"/players/default.png",


status:
dbPlayer?.status ||
staticPlayer?.status ||
"N/A",

                      experience:
                     dbPlayer?.experience ||
                     staticPlayer?.experience ||
                     "N/A",
                     
                     profession:
                     dbPlayer?.profession ||
                     staticPlayer?.profession ||
                     "N/A",
                     
                     age:
                     dbPlayer?.age ||
                     staticPlayer?.age ||
                     "N/A",
                     
                     nationality:
                     dbPlayer?.nationality ||
                     staticPlayer?.nationality ||
                     "Bangladesh 🇧🇩",
                     
                     location:
                     dbPlayer?.location ||
                     staticPlayer?.location ||
                     "N/A",  

joinDate:
dbPlayer?.joining_date ||
staticPlayer?.joinDate ||
null,


youtubeVideos:
cleanVideoIds(
staticPlayer?.youtubeVideos || []
),


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
dbPlayer?.previous_team || "",


device:
dbPlayer?.device || "N/A",


internet:
dbPlayer?.internet_connection || "N/A",


practiceTime:
dbPlayer?.practice_time || "N/A",


gameExperience:
dbPlayer?.game_experience || "N/A",


tournamentExperience:
dbPlayer?.tournament_experience || "N/A",


kdRate:
dbPlayer?.average_br_kd_rate || "N/A",


expertWeapon:
dbPlayer?.expert_weapon || "N/A",


};

// Pull each player's latest public uploads from their linked YouTube channel.
// RSS metadata is cached for one hour; saved highlight IDs remain a safe fallback.
player.youtubeVideos = await fetchYouTubeUploads(player.youtube, player.youtubeVideos);

const isActive =
  String(player.status).toLowerCase() === "active";



/* ===========================
 MATCH STATISTICS
=========================== */


let stats = [];

const targetPlayerId = dbPlayer?.id;

   console.log("TARGET PLAYER UUID:", targetPlayerId);
console.log("PLAYER DATABASE:", dbPlayer);
console.log("PLAYER ID FOR STATS:", targetPlayerId);


if (targetPlayerId) {

  const { data, error } = await supabase
    .from("match_player_stats")
    .select("*")
    .eq("player_id", targetPlayerId);

     console.log("STATS FROM DATABASE:", data);
  console.log("STATS ERROR:", error);


  if (error) {

    console.error(
      "PLAYER STATS ERROR:",
      error
    );

  }


  stats = data || [];


}

   

// fallback check

console.log(
  "FINAL PLAYER STATS:",
  stats
);





const totalMatches =
stats.length;



const totalKills =
stats.reduce(
(sum,item)=>
sum + Number(item.kills || 0),
0
);



const totalAssists =
stats.reduce(
(sum,item)=>
sum + Number(item.assists || 0),
0
);



const totalDamage =
stats.reduce(
(sum,item)=>
sum + Number(item.damage || 0),
0
);



const totalMVP =
stats.filter(
item =>
item.mvp === true ||
item.mvp === "true" ||
item.mvp === 1
)
.length;





/* ===========================
 PLAYER MATCH PARTICIPATION
=========================== */

let playerLineups = [];
let matchHistory = [];
let matchTeams = [];
let matchTournaments = [];

if (targetPlayerId) {
  const { data: lineupRows, error: lineupError } = await supabase
    .from("match_players")
    .select("match_id, team_id, created_at")
    .eq("player_id", targetPlayerId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (lineupError) console.error("PLAYER MATCH LINEUP ERROR:", lineupError);
  else playerLineups = lineupRows || [];

  const matchIds = [...new Set([
    ...playerLineups.map(row => row.match_id),
    ...stats.map(row => row.match_id),
  ].filter(Boolean))];

  if (matchIds.length) {
    const { data: matchRows, error: matchesError } = await supabase
      .from("matches")
      .select("id, tournament_id, match_date, match_type, status, platform, map, team1_id, team2_id, winner_id, team_id, notice")
      .in("id", matchIds)
      .order("match_date", { ascending: false, nullsFirst: false });

    if (matchesError) console.error("PLAYER MATCH HISTORY ERROR:", matchesError);
    else matchHistory = matchRows || [];

    const tournamentIds = [...new Set(matchHistory.map(match => match.tournament_id).filter(Boolean))];
    if (tournamentIds.length) {
      const { data, error } = await supabase
        .from("tournaments")
        .select("id, name, status, banner")
        .in("id", tournamentIds);
      if (error) console.error("PLAYER TOURNAMENT DETAILS ERROR:", error);
      else matchTournaments = data || [];
    }

    const teamIds = [...new Set([
      ...playerLineups.map(row => row.team_id),
      ...matchHistory.flatMap(match => [match.team_id, match.team1_id, match.team2_id]),
      ...stats.map(row => row.team_id_at_match),
    ].filter(Boolean))];
    if (teamIds.length) {
      const { data, error } = await supabase
        .from("teams")
        .select("id, team_name, logo")
        .in("id", teamIds);
      if (error) console.error("PLAYER MATCH TEAM DETAILS ERROR:", error);
      else matchTeams = data || [];
    }
  }
}

const playerMatchCards = matchHistory.map(match => {
  const lineup = playerLineups.find(row => row.match_id === match.id);
  const playerStat = stats.find(row => row.match_id === match.id);
  const tournament = matchTournaments.find(item => item.id === match.tournament_id);
  const teamId = lineup?.team_id || playerStat?.team_id_at_match || match.team_id || match.team1_id;
  const team = matchTeams.find(item => item.id === teamId);
  return { ...match, playerStat, tournamentName: tournament?.name || "", teamName: team?.team_name || player.team || "Team not recorded" };
});

const activePlayerMatches = playerMatchCards.filter(match =>
  ["upcoming", "live"].includes(String(match.status || "").toLowerCase())
);
const completedPlayerMatches = playerMatchCards.filter(match =>
  String(match.status || "").toLowerCase() === "completed"
);
const playerTopThreeFinishes = stats.filter(item =>
  Number(item.placement) > 0 && Number(item.placement) <= 3
).length;

const playerAchievements = [
  { id: "debut", icon: "🎮", title: "MATCH DEBUT", detail: "Recorded first match appearance", earned: totalMatches >= 1, value: "UNLOCKED" },
  { id: "mvp", icon: "🏅", title: "MVP PERFORMER", detail: "Earned MVP recognition in recorded matches", earned: totalMVP > 0, value: `${totalMVP} MVP${totalMVP === 1 ? "" : "s"}` },
  { id: "top-three", icon: "🥉", title: "TOP 3 FINISHER", detail: "Finished in the top three in recorded matches", earned: playerTopThreeFinishes > 0, value: `${playerTopThreeFinishes} TOP 3` },
  { id: "ten-matches", icon: "🔥", title: "10 MATCH CLUB", detail: "Reached ten recorded match appearances", earned: totalMatches >= 10, value: `${totalMatches}/10 MATCHES` },
  { id: "fifty-kills", icon: "⚔️", title: "50 KILL CLUB", detail: "Reached fifty total recorded kills", earned: totalKills >= 50, value: `${totalKills}/50 KILLS` },
  { id: "damage", icon: "💥", title: "DAMAGE DEALER", detail: "Recorded at least 5,000 total damage", earned: totalDamage >= 5000, value: `${totalDamage.toLocaleString("en-BD")}/5,000 DMG` },
].filter(item => item.earned);

/* ===========================
 TOTAL EARNINGS
=========================== */


let totalEarning = 0;



if(player.id){


const {
data,
error
}
=
await supabase.rpc(
"get_player_positive_earnings_v2",
{
p_player_id:
player.id
}
);



if(!error){

totalEarning =
Number(data || 0);

}


}
return (

<section className="esports-profile">


<div className="profile-header reveal-header">

<div className="player-heading">

<h1>
{player.ign}
</h1>

<h3>
{player.role}
</h3>

<h4>
{player.team}
</h4>

<p>
Professional Free Fire esports player of Over Power Esports.
</p>

</div>



<div className="winning-card reveal-win">

<span>
🏆 TOTAL WINNINGS
</span>

<h2>
{formatMoney(totalEarning)}
</h2>

</div>


</div>





<div className="profile-layout">



<aside className="profile-left">



<div className="photo-box reveal-photo">

<img
className="profile-photo"
src={player.image}
alt={player.name}
/>

</div>





<div className="info-box reveal-card">


<h3>
👤 PLAYER INFORMATION
</h3>



<div className="info-item">

<label>
👤 Player Name
</label>

<strong>
{player.name}
</strong>

</div>




<div className="info-item">

<label>
🎮 IGN Name
</label>

<strong>
{player.ign}
</strong>

</div>





<div className="info-item uid-box">

<label>
🆔 Game UID
</label>


<div className="uid-action">

<strong>
{player.uid || "Not Available"}
</strong>


{
player.uid && (
<CopyUID uid={player.uid}/>
)
}


</div>


</div>






<div className="info-item">

<label>
🎯 Primary Role
</label>


<strong>
{player.role}
</strong>


</div>





{
player.secondaryRole && (

<div className="info-item">

<label>
🎯 Secondary Role
</label>


<strong>
{player.secondaryRole}
</strong>


</div>

)
}





<div className="info-item">

<label>
🛡️ Team
</label>


<strong>
{player.team}
</strong>


</div>





<div className="info-item">

<label>
⏳ Experience
</label>


<strong>
{player.experience}
</strong>


</div>





<div className="info-item">

<label>
💼 Profession
</label>


<strong>
{player.profession}
</strong>


</div>





<div className="info-item">

<label>
🎂 Age
</label>


<strong>
{player.age}
</strong>


</div>





<div className="info-item">

<label>
📅 Join Date
</label>


<strong>
{formatDate(player.joinDate)}
</strong>


</div>





<div className="info-item">

<label>
🌍 Nationality
</label>


<strong>
{player.nationality}
</strong>


</div>





<div className="info-item">

<label>
📍 Location
</label>


<strong>
{player.location}
</strong>


</div>





<div className="info-item">

<label>
🟢 Status
</label>


<strong
className={
`player-status ${
isActive ? "active" : ""
}`
}
>

{player.status}

</strong>


</div>



</div>
   



<div className="info-box reveal-card">


<h3>
🎮 GAME DETAILS
</h3>



<div className="info-item">

<label>
📱 Device
</label>

<strong>
{player.device}
</strong>

</div>



<div className="info-item">

<label>
🌐 Internet
</label>

<strong>
{player.internet}
</strong>

</div>



<div className="info-item">

<label>
⏰ Practice Time
</label>

<strong>
{player.practiceTime}
</strong>

</div>



<div className="info-item">

<label>
🎮 Game Experience
</label>

<strong>
{player.gameExperience}
</strong>

</div>



<div className="info-item">

<label>
🏆 Tournament Experience
</label>

<strong>
{player.tournamentExperience}
</strong>

</div>



<div className="info-item">

<label>
📊 BR K/D Rate
</label>

<strong>
{player.kdRate}
</strong>

</div>



<div className="info-item">

<label>
🔫 Expert Weapon
</label>

<strong>
{player.expertWeapon}
</strong>

</div>


</div>





<div className="info-box reveal-card">


<h3>
🔗 SOCIAL LINKS
</h3>


<div className="profile-social">


{
player.facebook && (

<a
href={player.facebook}
target="_blank"
rel="noopener noreferrer"
>

<i className="fa-brands fa-facebook-f"></i>

Facebook

</a>

)
}




{
player.instagram && (

<a
href={player.instagram}
target="_blank"
rel="noopener noreferrer"
>

<i className="fa-brands fa-instagram"></i>

Instagram

</a>

)

}




{
player.youtube && (

<a
href={player.youtube}
target="_blank"
rel="noopener noreferrer"
>

<i className="fa-brands fa-youtube"></i>

YouTube

</a>

)

}





{
player.tiktok && (

<a
href={player.tiktok}
target="_blank"
rel="noopener noreferrer"
>

<i className="fa-brands fa-tiktok"></i>

TikTok

</a>

)

}




</div>


</div>







<div className="info-box reveal-card">


<h3>
📜 TEAM HISTORY
</h3>



<p>

{formatDate(player.joinDate)} - Present

<br/>


<span>
{player.team}
</span>



{
player.previousTeam && (

<>

<br/>

<span>
Previous Team: {player.previousTeam}
</span>

</>

)

}



<br/>


<strong>

🟢 Active For:
{" "}
{getExperience(player.joinDate)}

</strong>


</p>


</div>



</aside>







<div className="profile-right">



<div className="profile-table reveal-table">


<h2>
📊 CAREER STATISTICS
</h2>


<table>

<thead>

<tr>

<th>
MATCHES
</th>

<th>
KILLS
</th>

<th>
ASSISTS
</th>

<th>
DAMAGE
</th>

<th>
MVP
</th>

</tr>

</thead>



<tbody>


<tr>

<td>
{totalMatches}
</td>


<td>
{totalKills}
</td>


<td>
{totalAssists}
</td>


<td>
{totalDamage}
</td>


<td>
{totalMVP}
</td>


</tr>


</tbody>


</table>


</div>






<section className="profile-table career-achievements reveal-table">
  <div className="profile-section-heading">
    <div><span className="profile-section-kicker">PLAYER PROGRESSION</span><h2>🏆 VERIFIED ACHIEVEMENTS</h2></div>
    <span className="profile-section-count">{playerAchievements.length} EARNED</span>
  </div>
  {playerAchievements.length ? (
    <div className="achievement-grid">
      {playerAchievements.map(item => (
        <article className="achievement-card" key={item.id}>
          <span className="achievement-icon">{item.icon}</span>
          <div className="achievement-copy">
            <strong>{item.title}</strong><p>{item.detail}</p><span>{item.value}</span>
          </div>
          <span className="achievement-unlocked">✓</span>
        </article>
      ))}
    </div>
  ) : (
    <div className="profile-empty-state"><span>🏆</span><strong>ACHIEVEMENTS ARE WAITING</strong><p>Verified milestones unlock automatically as match results and player statistics are recorded.</p></div>
  )}
</section>

<section className="profile-table player-match-history reveal-table">
  <div className="profile-section-heading">
    <div><span className="profile-section-kicker">LIVE FROM MATCH CENTER</span><h2>🎯 MATCH PARTICIPATION</h2></div>
    <span className="profile-section-count">{playerMatchCards.length} MATCHES</span>
  </div>
  <div className="match-summary-strip">
    <div><strong>{activePlayerMatches.length}</strong><span>UPCOMING / LIVE</span></div>
    <div><strong>{completedPlayerMatches.length}</strong><span>COMPLETED</span></div>
    <div><strong>{totalMVP}</strong><span>MVP AWARDS</span></div>
  </div>
  {playerMatchCards.length ? (
    <div className="player-match-list">
      {playerMatchCards.map(match => {
        const status = String(match.status || "").toLowerCase();
        const result = match.playerStat;
        return (
          <article className="player-match-card" key={match.id}>
            <div className="player-match-main">
              <div className="player-match-topline">
                <span className={`match-type-chip match-type-${String(match.match_type || "match").toLowerCase()}`}>{getMatchTypeLabel(match.match_type)}</span>
                <span className={`match-status-chip match-status-${status || "unknown"}`}>{getMatchStatusLabel(status)}</span>
              </div>
              <h3>{match.tournamentName || (match.match_type === "Scrim" ? "Daily Scrim" : getMatchTypeLabel(match.match_type))}</h3>
              <p>{match.teamName}{match.map ? ` · ${match.map}` : ""}{match.platform ? ` · ${match.platform}` : ""}</p>
              <time>{formatMatchDate(match.match_date)}</time>
            </div>
            {result ? (
              <div className="player-match-stats">
                <div><strong>{Number(result.kills || 0)}</strong><span>KILLS</span></div>
                <div><strong>{Number(result.assists || 0)}</strong><span>ASSISTS</span></div>
                <div><strong>{Number(result.damage || 0).toLocaleString("en-BD")}</strong><span>DAMAGE</span></div>
                <div><strong>{result.mvp ? "MVP" : (result.placement ? `#${result.placement}` : "—")}</strong><span>{result.mvp ? "AWARD" : "PLACE"}</span></div>
              </div>
            ) : (
              <div className="player-match-pending">{status === "upcoming" ? "LINEUP CONFIRMED" : status === "live" ? "MATCH IN PROGRESS" : "RESULT NOT RECORDED"}</div>
            )}
          </article>
        );
      })}
    </div>
  ) : (
    <div className="profile-empty-state"><span>🎮</span><strong>NO MATCHES RECORDED YET</strong><p>When this player is added to a Match Center lineup, the match will automatically appear here.</p></div>
  )}
</section>

<div className="profile-table video-gallery">


<h2>
🎬 PLAYER HIGHLIGHTS
</h2>




{
player.youtubeVideos.length > 0 ? (


<div className="video-grid">


{
player.youtubeVideos.map(
(video,index)=>(


<article
className="video-card"
key={`${video.id}-${index}`}
>
  <div className="video-frame">
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
      title={video.title || `${player.ign} Highlight ${index + 1}`}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    ></iframe>
  </div>
  <div className="video-card-meta">
    <span className="video-card-index">HIGHLIGHT {String(index + 1).padStart(2, "0")}</span>
    <h3>{video.title || `Latest upload from ${player.ign}`}</h3>
    <span className="video-card-date">{video.published || "YouTube channel upload"}</span>
  </div>
</article>


)

)


}


</div>


) : (


<p>
No player highlights available yet.
</p>


)

}


</div>


</div>


</div>


</section>


);

}
