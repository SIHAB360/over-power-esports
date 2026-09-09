import CopyUID from "../../components/CopyUID";


export default async function PlayerProfile({ params }) {


const players = {


appelo: {

  name: "SAKIB HASAN",
  ign: "EXE APPELO",
  uid: "1673606480",
  role: "PRIMARY RUSHER",
  team: "OVER POWER MAIN TEAM",
  experience: "5 Month",
  profession: "Student",
  age: "19",
  nationality: "Bangladesh 🇧🇩",
  location: "Dhaka, Bangladesh",
  status: "Active",

  image: "/players/appelo.png",
  winnings: "$16,015",

  facebook: "https://www.facebook.com/share/19XKoR58cb/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/_appelo_ff",
  youtube: "https://youtube.com/@appelo_ff",
  tiktok: "https://www.tiktok.com/@appelo_offical",

  youtubeVideos: [
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
  nationality:"Bangladesh 🇧🇩",
  location:"Dhaka",
  status:"Active",

  image:"/players/oggy.png",
  winnings:"$12,500",

  facebook:"https://www.facebook.com/share/1JEkiAK2J6/",
  instagram:"https://www.instagram.com/being_ogggyy",
  youtube:"https://youtube.com/@being_ogggyy",
  tiktok:"https://www.tiktok.com/@being_ogggyy",

  youtubeVideos: [
    "",
    "",
    "",
    "",
    "",
    ""
  ]

},


itachix: {

  name:"MD SALMAN",
  ign:"OP ITACHIx",
  uid:"7743068119",
  role:"BOMBER",
  team:"OVER POWER MAIN TEAM",
  experience:"1 Years",
  profession:"Student",
  age:"17",
  nationality:"Bangladesh 🇧🇩",
  location:"Dhaka",
  status:"Active",

  image:"/players/itachix.png",
  winnings:"$8,500",

  facebook:"https://www.facebook.com/profile.php?id=61590102347309",
  instagram:"",
  youtube:"https://youtube.com/@itachiontop-r2p",
  tiktok:"https://www.tiktok.com/@itachix074",

  youtubeVideos: [
    "89Z_9Rffa1M",
    "89Z_9Rffa1M",
    "89Z_9Rffa1M",
    "-dzH4tBo0yY",
    "-dzH4tBo0yY",
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
  nationality:"Bangladesh 🇧🇩",
  location:"Dhaka",
  status:"Active",

  image:"/players/rejwan.png",
  winnings:"$7,800",

  facebook:"https://www.facebook.com/rejwan.ahammed11",
  instagram:"https://www.instagram.com/rahammed_",
  youtube:"https://youtube.com/@rejwan-ff6711",
  tiktok:"https://www.tiktok.com/@rejwanahammed",

  youtubeVideos: [
    "YzetH_r6KpE",
    "1OGnv9NlgnI",
    "a7kPD66eTlU",
    "UJFPFz82cEo",
    "ruDS83xiLSY",
    "1cE1la0rGaQ"
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
  nationality:"Bangladesh 🇧🇩",
  location:"Dhaka",
  status:"Active",

  image:"/players/fixfire.png",
  winnings:"$6,400",

  facebook:"https://www.facebook.com/share/1DYEWmWzRr/",
  instagram:"https://www.instagram.com/xr_jisan09",
  youtube:"https://www.youtube.com/@fixfire09",
  tiktok:"https://tiktok.com/@fixfire09",

  youtubeVideos: [
    "1L7XQBFOoEk",
    "JD9yIRFYHco",
    "igltHVFp93o",
    "1i7r3yw-LSY",
    "83X6Ywd07yI",
    "9q2YYLBJo0E"
  ]

}
};

const { id } = await params;


const player = players[id];


if (!player) {

return <h1>Player Not Found</h1>;

}
 return (

<section className="esports-profile">


<div className="profile-header reveal-header">


<div className="player-heading">


<h1>
{player.name}
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
{player.winnings}
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





{/* PLAYER INFORMATION */}


<div className="info-box reveal-card reveal-delay-1">


<h3>
👤 PLAYER INFORMATION
</h3>



<div className="info-item">
<label>👤 Player Name</label>
<strong>{player.name}</strong>
</div>



<div className="info-item">
<label>🎮 IGN Name</label>
<strong>{player.ign}</strong>
</div>



<div className="info-item uid-box">


<label>
🆔 Game UID
</label>


<div className="uid-action">


<strong>
{player.uid}
</strong>


<CopyUID uid={player.uid}/>


</div>


</div>



<div className="info-item">
<label>🎯 Role</label>
<strong>{player.role}</strong>
</div>



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
<label>🌍 Nationality</label>
<strong>{player.nationality}</strong>
</div>



<div className="info-item">
<label>📍 Location</label>
<strong>{player.location}</strong>
</div>



<div className="info-item">


<label>
🟢 Status
</label>


<strong className="player-status active">

{player.status}

</strong>


</div>



</div>





{/* SOCIAL LINKS */}



<div className="info-box reveal-card reveal-delay-2">


<h3>
🔗 SOCIAL LINKS
</h3>



<div className="profile-social">



{
player.facebook &&

<a

href={player.facebook}

target="_blank"

rel="noopener noreferrer"

>

<i className="fa-brands fa-facebook-f"></i>

Facebook

</a>

}




{
player.instagram &&

<a

href={player.instagram}

target="_blank"

rel="noopener noreferrer"

>

<i className="fa-brands fa-instagram"></i>

Instagram

</a>

}




{
player.youtube &&

<a

href={player.youtube}

target="_blank"

rel="noopener noreferrer"

>

<i className="fa-brands fa-youtube"></i>

YouTube

</a>

}




{
player.tiktok &&

<a

href={player.tiktok}

target="_blank"

rel="noopener noreferrer"

>

<i className="fa-brands fa-tiktok"></i>

TikTok

</a>

}



</div>


</div>
{/* TEAM HISTORY */}


<div className="info-box reveal-card reveal-delay-3">


<h3>
📜 TEAM HISTORY
</h3>


<p>
2026 - Present
<br/>

<span>
Over Power Main Team
</span>

</p>


</div>



</aside>







{/* RIGHT SIDE */}


<div className="profile-right">



{/* ACHIEVEMENTS */}


<div className="profile-table reveal-table reveal-table-1">


<h2>
🏆 ACHIEVEMENTS
</h2>


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







{/* AWARDS */}


<div className="profile-table reveal-table reveal-table-2">


<h2>
🏅 AWARDS
</h2>


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






{/* VIDEO GALLERY */}

<div className="profile-table video-gallery">

  <h2>
    🎬 PLAYER HIGHLIGHTS
  </h2>

  <div className="video-grid">

    {player.youtubeVideos?.map((video, index) => (

      <div className="video-card" key={index}>

        <iframe
          src={`https://www.youtube.com/embed/${video}`}
          title={`Player Highlight ${index + 1}`}
          allowFullScreen
        ></iframe>

      </div>

    ))}

  </div>

</div>


</div>   {/* profile-right */}

</div>   {/* profile-layout */}

</section>

);
}
