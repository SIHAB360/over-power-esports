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


    youtubeVideos:[

      "94JjtPH6Rp4",
      "WiXfH8lHkao",
      "T9gEdEC1BqA",
      "S12LAik5ovc",
      "8jzmVk4sd2Q",
      "p9Bf-zGCefg"

    ]

  },


  oggy: {

    name:"SOMIR",

    ign:"BE1NG OGGY",

    uid:"4455951906",

    role:"SECONDARY RUSHER",

    team:"OVER POWER MAIN TEAM",

    experience:"1 Year",

    profession:"Student",

    age:"17",

    joinDate:"2026-08-21",

    nationality:"Bangladesh 🇧🇩",

    location:"Dhaka",

    status:"Active",

    image:"/players/oggy.png",


    facebook:
    "https://www.facebook.com/share/1JEkiAK2J6/",


    instagram:
    "https://www.instagram.com/being_ogggyy",


    youtube:
    "https://youtube.com/@being_ogggyy",


    tiktok:
    "https://www.tiktok.com/@being_ogggyy",


    youtubeVideos:[]

  },


  itachix:{

    name:"MD SALMAN",

    ign:"OP ITACHIx",

    uid:"7743068119",

    role:"BOMBER",

    team:"OVER POWER MAIN TEAM",

    experience:"1 Year",

    profession:"Student",

    age:"17",

    joinDate:"2026-05-01",

    nationality:"Bangladesh 🇧🇩",

    location:"Dhaka",

    status:"Active",

    image:"/players/itachix.png",


    facebook:
    "https://www.facebook.com/profile.php?id=61590102347309",


    instagram:"",


    youtube:
    "https://youtube.com/@itachiontop-r2p",


    tiktok:
    "https://www.tiktok.com/@itachix074",


    youtubeVideos:[

      "89Z_9Rffa1M",
      "-dzH4tBo0yY"

    ]

  },
  rejwan: {

    name:"REJWAN AHAMMED",

    ign:"OP REJWAN",

    uid:"1111551408",

    role:"IGL + SUPPORTER",

    team:"OVER POWER MAIN TEAM",

    experience:"8 Month",

    profession:"JOB HOLDER",

    age:"18",

    joinDate:"2026-04-23",

    nationality:"Bangladesh 🇧🇩",

    location:"Dhaka",

    status:"Active",

    image:"/players/rejwan.png",


    facebook:
    "https://www.facebook.com/rejwan.ahammed11",


    instagram:
    "https://www.instagram.com/rahammed_",


    youtube:
    "https://youtube.com/@rejwan-ff6711",


    tiktok:
    "https://www.tiktok.com/@rejwanahammed",


    youtubeVideos:[

      "YzetH_r6KpE",
      "1OGnv9NlgnI",
      "G9O0kwdpLmA",
      "CoRiZx_oFCU",
      "a7kPD66eTlU",
      "V2hA8Sl049Q"

    ]

  },



  fixfire: {

    name:"JISAN BISWAS",

    ign:"FixFIRE",

    uid:"63999291",

    role:"SNIPER",

    team:"OVER POWER MAIN TEAM",

    experience:"3 Years",

    profession:"Student",

    age:"21",

    joinDate:"2026-07-26",

    nationality:"Bangladesh 🇧🇩",

    location:"Dhaka",

    status:"Active",

    image:"/players/fixfire.png",


    facebook:
    "https://www.facebook.com/share/1DYEWmWzRr/",


    instagram:
    "https://www.instagram.com/xr_jisan09",


    youtube:
    "https://www.youtube.com/@fixfire09",


    tiktok:
    "https://tiktok.com/@fixfire09",


    youtubeVideos:[

      "1L7XQBFOoEk",
      "eh7GKKDVvoY",
      "q1VdGlmr8_g",
      "G5tMntbjd_s",
      "JD9yIRFYHco",
      "m1s34WavzGw"

    ]

  },



  foysal: {

    name:"MD FOYSAL",

    ign:"OP RF NTC",

    uid:"2628615876",

    role:"PRIMARY RUSHER",

    team:"OVER POWER ELITE",

    experience:"1 Year",

    profession:"OUT OF COUNTRY",

    age:"23",

    joinDate:"2026-07-20",

    nationality:"Malaysia",

    location:"Kuala Lumpur",

    status:"Active",

    image:"/players/rfntc.png",


    facebook:
    "https://www.facebook.com/share/1GyYZjBWmZ/",


    instagram:
    "https://www.instagram.com/md_rasel._123",


    youtube:
    "https://www.youtube.com/@EmranKhan-y1p4s",


    tiktok:
    "https://www.tiktok.com/@emran.khan3103",


    youtubeVideos:[]

  },



  jellal: {

    name:"SHAWON AHMED",

    ign:"OP JELLAL",

    uid:"6587036423",

    role:"SECONDARY RUSHER",

    team:"OVER POWER ELITE",

    experience:"6 Month",

    profession:"JOB HOLDER",

    age:"21",

    joinDate:"2026-07-26",

    nationality:"Bangladesh 🇧🇩",

    location:"Dhaka",

    status:"Active",

    image:"/players/jellal.png",


    facebook:
    "https://www.facebook.com/ew.r.sawon.739315",


    instagram:
    "https://www.instagram.com/sgr100m",


    youtube:
    "https://youtube.com/@sgr100m",


    tiktok:"",


    youtubeVideos:[

      "sOU0G3abc0M",
      "Q_qe4D70jFE",
      "w2hgp0jga1w",
      "lQZ8SeM75Mg",
      "EJZTmnixjIg",
      "_Cg-g_K-6ic"

    ]

  },
     sojib: {

    name:"MD SOJIB",

    ign:"SOJIB",

    uid:"",

    role:"BOMBER",

    team:"OVER POWER ELITE",

    experience:"1 Year",

    profession:"STUDENT",

    age:"18",

    joinDate:"2026-09-06",

    nationality:"Bangladesh 🇧🇩",

    location:"Dhaka",

    status:"Active",

    image:"/players/sojib.png",


    facebook:"",

    instagram:"",

    youtube:"",

    tiktok:"",


    youtubeVideos:[]

  },



  nafiz: {

    name:"MD NAFIZ",

    ign:"NXE NAFIZ",

    uid:"5540170894",

    role:"SUPPORTER",

    team:"OVER POWER ELITE",

    experience:"1 Year",

    profession:"STUDENT",

    age:"22",

    joinDate:"2026-08-31",

    nationality:"Bangladesh 🇧🇩",

    location:"Dhaka",

    status:"Active",

    image:"/players/nafiz.jpeg",


    facebook:
    "https://www.facebook.com/share/1FrtytpbHg/",


    instagram:
    "https://www.instagram.com/nxe_nafiz_00",


    youtube:
    "https://www.youtube.com/@MdBijoy-t7m",


    tiktok:
    "https://www.tiktok.com/@md.bijoy4059",


    youtubeVideos:[]

  },



  baymax: {

    name:"SAIF AHMED",

    ign:"OP BAYMAX",

    uid:"15767917163",

    role:"SNIPER",

    team:"OVER POWER ELITE",

    experience:"4 Month",

    profession:"STUDENT",

    age:"20",

    joinDate:"2026-07-23",

    nationality:"Bangladesh 🇧🇩",

    location:"Dhaka",

    status:"Active",

    image:"/players/baymax.png",


    facebook:
    "https://www.facebook.com/share/18E6u8Mo18/",


    instagram:
    "https://www.instagram.com/_mhs_1037",


    youtube:
    "https://youtube.com/@mhsgaming211",


    tiktok:"",


    youtubeVideos:[

      "yDz2FzDJFc0",
      "u2wJUDb72xc",
      "DDfeZfVBJzQ"

    ]

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



const isActive =

String(player.status).toLowerCase() === "active";





/* ===========================
   MATCH STATISTICS
=========================== */


let stats = [];


const targetPlayerId = dbPlayer?.id;



if(targetPlayerId){


const {data,error} =

await supabase

.from("match_player_stats")

.select("*")

.eq(

"player_id",

targetPlayerId

);



if(!error){


stats = data || [];


}



}





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
   TOTAL EARNINGS
=========================== */


let totalEarning = 0;



if(player.id){


  const {
    data,
    error
  } = await supabase.rpc(
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

<section className="op-player-dashboard">


<div className="op-player-container">



{/* ===========================
    PLAYER HERO SECTION
=========================== */}



<div className="op-player-hero">



<div className="op-profile-main">


<div className="op-avatar-box">


<img

src={player.image}

alt={player.name}

className="op-avatar"

/>


<div className="op-status">

{player.status}

</div>


</div>




<div className="op-player-title">


<h1>

{player.ign}

</h1>



<h3>

{player.role}

</h3>



<p>

{player.team}

</p>



<span>

Professional Free Fire esports player of Over Power Esports.

</span>



</div>



</div>





<div className="op-winning-card">


<div>

🏆 TOTAL WINNINGS

</div>


<h2>

{formatMoney(totalEarning)}

</h2>


</div>




</div>
{/* ===========================
    MAIN DASHBOARD GRID
=========================== */}


<div className="op-dashboard-grid">



{/* LEFT COLUMN */}

<div className="op-left-column">





{/* PLAYER INFORMATION */}


<div className="op-card">


<h2>
👤 PLAYER INFORMATION
</h2>



<div className="op-info-grid">


<div className="op-info-item">

<label>
👤 Player Name
</label>

<strong>
{player.name}
</strong>

</div>




<div className="op-info-item">

<label>
🎮 IGN Name
</label>

<strong>
{player.ign}
</strong>

</div>




<div className="op-info-item">

<label>
🆔 Game UID
</label>


<div className="op-uid-box">

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





<div className="op-info-item">

<label>
🎯 Primary Role
</label>

<strong>
{player.role}
</strong>

</div>




{

player.secondaryRole && (

<div className="op-info-item">

<label>
🎯 Secondary Role
</label>


<strong>

{player.secondaryRole}

</strong>


</div>

)

}




<div className="op-info-item">

<label>
🛡️ Team
</label>


<strong>

{player.team}

</strong>


</div>





<div className="op-info-item">

<label>
⏳ Experience
</label>


<strong>

{player.experience}

</strong>


</div>




<div className="op-info-item">

<label>
💼 Profession
</label>


<strong>

{player.profession}

</strong>


</div>





<div className="op-info-item">

<label>
🎂 Age
</label>


<strong>

{player.age}

</strong>


</div>





<div className="op-info-item">

<label>
📅 Join Date
</label>


<strong>

{formatDate(player.joinDate)}

</strong>


</div>





<div className="op-info-item">

<label>
🌍 Nationality
</label>


<strong>

{player.nationality}

</strong>


</div>





<div className="op-info-item">

<label>
📍 Location
</label>


<strong>

{player.location}

</strong>


</div>




<div className="op-info-item">

<label>
🟢 Status
</label>


<strong className={

`op-status-text ${
isActive ? "active" : ""
}`

}>

{player.status}

</strong>


</div>




</div>


</div>





{/* GAME DETAILS */}



<div className="op-card">


<h2>
🎮 GAME DETAILS
</h2>



<div className="op-info-grid">



<div className="op-info-item">

<label>
📱 Device
</label>

<strong>

{player.device}

</strong>

</div>




<div className="op-info-item">

<label>
🌐 Internet
</label>

<strong>

{player.internet}

</strong>

</div>




<div className="op-info-item">

<label>
⏰ Practice Time
</label>

<strong>

{player.practiceTime}

</strong>

</div>




<div className="op-info-item">

<label>
🎮 Game Experience
</label>

<strong>

{player.gameExperience}

</strong>

</div>




<div className="op-info-item">

<label>
🏆 Tournament Experience
</label>

<strong>

{player.tournamentExperience}

</strong>

</div>




<div className="op-info-item">

<label>
📊 BR K/D Rate
</label>

<strong>

{player.kdRate}

</strong>

</div>




<div className="op-info-item">

<label>
🔫 Expert Weapon
</label>

<strong>

{player.expertWeapon}

</strong>

</div>



</div>


</div>
/* ===========================
   SOCIAL LINKS
=========================== */


<div className="op-card">


<h2>
🔗 SOCIAL LINKS
</h2>



<div className="op-social-grid">


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






{/* TEAM HISTORY */}



<div className="op-card">


<h2>
📜 TEAM HISTORY
</h2>



<div className="op-history">


<p>


<strong>

{formatDate(player.joinDate)}

</strong>


<br/>


<span>

{player.team}

</span>




{

player.previousTeam && (

<>

<br/>


Previous Team:

<strong>

{player.previousTeam}

</strong>


</>

)

}



</p>



<div className="op-active-time">


🟢 Active For:

<strong>

{getExperience(player.joinDate)}

</strong>


</div>



</div>


</div>



</div>





{/* RIGHT COLUMN */}



<div className="op-right-column">





{/* CAREER STATISTICS */}



<div className="op-card op-stat-dashboard">


<h2>

📊 CAREER STATISTICS

</h2>



<div className="op-stat-grid">



<div className="op-stat-box">

<span>
MATCHES
</span>

<strong>

{totalMatches}

</strong>

</div>



<div className="op-stat-box">

<span>
KILLS
</span>

<strong>

{totalKills}

</strong>

</div>




<div className="op-stat-box">

<span>
ASSISTS
</span>

<strong>

{totalAssists}

</strong>

</div>




<div className="op-stat-box">

<span>
DAMAGE
</span>

<strong>

{totalDamage}

</strong>

</div>




<div className="op-stat-box">

<span>
MVP
</span>

<strong>

{totalMVP}

</strong>

</div>



</div>


</div>






{/* ACHIEVEMENTS */}



<div className="op-card">


<h2>

🏆 ACHIEVEMENTS

</h2>



<div className="op-table-wrap">


<table>


<thead>

<tr>

<th>
DATE
</th>

<th>
TIER
</th>

<th>
TOURNAMENT
</th>

<th>
PRIZE
</th>


</tr>


</thead>



<tbody>


<tr>

<td>
2026
</td>

<td>
A-Tier
</td>

<td>
Free Fire Championship
</td>

<td>
$120
</td>


</tr>



<tr>

<td>
2026
</td>

<td>
A-Tier
</td>

<td>
Asia Invitational
</td>

<td>
$181
</td>


</tr>



<tr>

<td>
2026
</td>

<td>
C-Tier
</td>

<td>
Community Tournament
</td>

<td>
$48
</td>


</tr>



</tbody>


</table>


</div>


</div>
{/* ===========================
   AWARDS
=========================== */}


<div className="op-card">


<h2>

🏅 AWARDS

</h2>



<div className="op-award-grid">



<div className="op-award-card">

<div className="award-icon">
🏆
</div>


<h3>
Tournament Champion
</h3>


<p>
Free Fire Championship Winner
</p>


</div>





<div className="op-award-card">

<div className="award-icon">
🥇
</div>


<h3>
MVP Award
</h3>


<p>
Best Performance Player
</p>


</div>






<div className="op-award-card">

<div className="award-icon">
🔥
</div>


<h3>
Top Fragger
</h3>


<p>
Highest Kill Contribution
</p>


</div>




</div>



</div>






{/* ===========================
   PLAYER HIGHLIGHTS
=========================== */}



<div className="op-card">


<h2>

🎥 PLAYER HIGHLIGHTS

</h2>



<div className="op-video-grid">


{


player.youtubeVideos.length > 0 ? (


player.youtubeVideos.map(

(video,index)=>(


<div

className="op-video-card"

key={index}

>


<iframe

src={`https://www.youtube.com/embed/${video}`}

title="Player Highlight"

allowFullScreen

></iframe>



</div>


)

)


)

:

(

<p>

No highlights available.

</p>

)


}



</div>


</div>





</div>

</div>

<style jsx>{`

.op-player-dashboard{

min-height:100vh;

padding:120px 30px 60px;

background:

radial-gradient(
circle at top,
rgba(255,0,80,.15),
transparent 40%
);

color:white;

}





.op-player-container{

max-width:1400px;

margin:auto;

}





.op-player-hero{


display:flex;

justify-content:space-between;

align-items:center;

gap:30px;

padding:30px;

border-radius:28px;

background:

rgba(255,255,255,.05);


border:1px solid rgba(255,0,80,.25);


backdrop-filter:blur(20px);


box-shadow:

0 0 40px rgba(255,0,80,.15);


margin-bottom:30px;


}





.op-profile-main{


display:flex;

align-items:center;

gap:25px;


}




.op-avatar-box{

position:relative;

}





.op-avatar{


width:150px;

height:150px;

border-radius:50%;


object-fit:cover;


border:3px solid #ff2040;


box-shadow:

0 0 35px rgba(255,0,60,.8);


}




.op-status{


position:absolute;


bottom:8px;

right:15px;


background:#00ff88;


color:#000;


padding:5px 12px;


border-radius:20px;


font-size:12px;


font-weight:800;


}




.op-player-title h1{


font-size:42px;

margin:0;


}



.op-player-title h3{


color:#ff2040;

margin:10px 0;


}




.op-winning-card{


padding:25px;


border-radius:22px;


background:

linear-gradient(
135deg,
rgba(255,0,80,.3),
rgba(90,0,255,.3)
);


min-width:240px;


text-align:center;


}




.op-winning-card h2{


font-size:35px;


margin-top:15px;


}





.op-dashboard-grid{


display:grid;


grid-template-columns:

1.2fr .8fr;


gap:25px;


}




.op-card{


background:

rgba(255,255,255,.06);


border:

1px solid rgba(255,255,255,.12);


border-radius:24px;


padding:25px;


margin-bottom:25px;


backdrop-filter:blur(20px);


box-shadow:

0 20px 50px rgba(0,0,0,.3);


}





.op-card h2{


margin-bottom:25px;


font-size:20px;


color:#fff;


}




.op-info-grid{


display:grid;


grid-template-columns:

repeat(2,1fr);


gap:15px;


}




.op-info-item{


padding:15px;


background:

rgba(255,255,255,.04);


border-radius:15px;


}





.op-info-item label{


display:block;


font-size:12px;


color:#aaa;


margin-bottom:8px;


}




.op-info-item strong{


font-size:15px;


}





.op-social-grid{


display:flex;

flex-wrap:wrap;

gap:15px;


}



.op-social-grid a{


padding:12px 20px;


border-radius:30px;


background:

rgba(255,0,60,.15);


color:white;


text-decoration:none;


border:

1px solid rgba(255,0,60,.4);


}





.op-stat-grid{


display:grid;


grid-template-columns:

repeat(2,1fr);


gap:15px;


}



.op-stat-box{


padding:25px;


border-radius:18px;


background:

linear-gradient(
135deg,
rgba(255,0,80,.2),
rgba(0,0,0,.3)
);


text-align:center;


}




.op-stat-box span{


display:block;


font-size:12px;


color:#aaa;


}



.op-stat-box strong{


font-size:32px;


}





.op-table-wrap{


overflow:auto;


}



.op-table-wrap table{


width:100%;


border-collapse:collapse;


}



.op-table-wrap th,
.op-table-wrap td{


padding:14px;


border-bottom:

1px solid rgba(255,255,255,.1);


}





.op-award-grid{


display:grid;


grid-template-columns:

repeat(3,1fr);


gap:20px;


}




.op-award-card{


padding:25px;


text-align:center;


border-radius:20px;


background:

rgba(255,255,255,.05);


}




.award-icon{


font-size:40px;


}




/* ===========================
   VIDEO CARDS
=========================== */


.op-video-grid{


display:grid;


grid-template-columns:

repeat(2,1fr);


gap:20px;


}



.op-video-card{


overflow:hidden;


border-radius:20px;


background:#000;


border:

1px solid rgba(255,255,255,.12);



aspect-ratio:

16/9;



}



.op-video-card iframe{


width:100%;


height:100%;


border:0;


}




.op-active-time{


margin-top:20px;


padding:15px;


background:

rgba(0,255,120,.08);


border-radius:15px;


border:

1px solid rgba(0,255,120,.2);


}




.op-status-text.active{


color:#00ff88;


}





.op-uid-box{


display:flex;


align-items:center;


gap:10px;


}





.op-history{


color:#ddd;


}





/* ===========================
   RESPONSIVE
=========================== */



@media(max-width:1100px){



.op-dashboard-grid{


grid-template-columns:

1fr;


}



.op-player-hero{


flex-direction:column;


align-items:flex-start;


}



}




@media(max-width:768px){



.op-player-dashboard{


padding:

90px 15px 40px;


}




.op-profile-main{


flex-direction:column;


align-items:center;


text-align:center;


}




.op-avatar{


width:120px;


height:120px;


}




.op-player-title h1{


font-size:30px;


}



.op-winning-card{


width:100%;


}



.op-info-grid{


grid-template-columns:

1fr;


}



.op-stat-grid{


grid-template-columns:

1fr 1fr;


}



.op-award-grid{


grid-template-columns:

1fr;


}



.op-video-grid{


grid-template-columns:

1fr;


}



.op-card{


padding:18px;


}



}



@media(max-width:420px){



.op-stat-grid{


grid-template-columns:

1fr;


}



.op-player-title h1{


font-size:26px;


}



.op-winning-card h2{


font-size:28px;


}



}


`}</style>


</section>

);

}
