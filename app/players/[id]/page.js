export default async function PlayerProfile({params}){


const players = {


appelo:{
name:"APPELO",
role:"PRIMARY",
team:"OVER POWER MAIN TEAM",
image:"/players/appelo.png",
winnings:"$16,015",
facebook:"https://www.facebook.com/share/19XKoR58cb/?mibextid=wwXIfr",
instagram:"https://www.instagram.com/_appelo_ff",
youtube:"https://youtube.com/@appelo_ff",
tiktok:"https://www.tiktok.com/@appelo_offical"
},


oggy:{
name:"OGGY",
role:"SECONDARY",
team:"OVER POWER MAIN TEAM",
image:"/players/oggy.png",
winnings:"$12,500",
facebook:"https://www.facebook.com/share/1JEkiAK2J6/",
instagram:"https://www.instagram.com/being_ogggyy",
youtube:"https://youtube.com/@being_ogggyy",
tiktok:"https://www.tiktok.com/@being_ogggyy"
},


itachix:{
name:"ITACHIx",
role:"BOMBER",
team:"OVER POWER MAIN TEAM",
image:"/players/itachix.png",
winnings:"$8,500",
facebook:"https://www.facebook.com/profile.php?id=61590102347309",
instagram:"",
youtube:"https://youtube.com/@itachiontop-r2p",
tiktok:"https://www.tiktok.com/@itachix074"
},


rejwan:{
name:"REJWAN",
role:"IGL + SUPPORTER",
team:"OVER POWER MAIN TEAM",
image:"/players/rejwan.png",
winnings:"$7,800",
facebook:"https://www.facebook.com/rejwan.ahammed11",
instagram:"https://www.instagram.com/rahammed_",
youtube:"https://youtube.com/@rejwan-ff6711",
tiktok:"https://www.tiktok.com/@rejwanahammed"
},


fixfire:{
name:"FixFIRE",
role:"SNIPER",
team:"OVER POWER MAIN TEAM",
image:"/players/fixfire.png",
winnings:"$6,400",
facebook:"https://www.facebook.com/share/1DYEWmWzRr/",
instagram:"https://www.instagram.com/xr_jisan09",
youtube:"https://www.youtube.com/@fixfire09",
tiktok:"https://tiktok.com/@fixfire09"
}


}



const {id}=await params;

const player=players[id];


if(!player){

return <h1>Player Not Found</h1>

}




return(

<section className="esports-profile">



{/* HEADER */}

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


<h4>
{player.team}
</h4>


</div>



<div className="winning-card">

<span>
TOTAL WINNINGS
</span>

<h2>
{player.winnings}
</h2>

</div>


</div>







<div className="profile-layout">



{/* LEFT SIDE */}


<aside className="profile-left">


<img

className="profile-photo"

src={player.image}

alt={player.name}

/>




<h3>
PLAYER INFORMATION
</h3>


<div className="profile-row">
<span>Name</span>
{player.name}
</div>


<div className="profile-row">
<span>Role</span>
{player.role}
</div>


<div className="profile-row">
<span>Team</span>
{player.team}
</div>


<div className="profile-row">
<span>Country</span>
Bangladesh 🇧🇩
</div>


<div className="profile-row">
<span>Status</span>
Active
</div>





<h3>
LINKS
</h3>


<div className="profile-social">


{player.facebook &&
<a href={player.facebook} target="_blank">
f
</a>
}



{player.instagram &&
<a href={player.instagram} target="_blank">
◎
</a>
}



{player.youtube &&
<a href={player.youtube} target="_blank">
▶
</a>
}



{player.tiktok &&
<a href={player.tiktok} target="_blank">
♪
</a>
}



</div>





<h3>
TEAM HISTORY
</h3>


<p className="team-history">

2026 - Present

<br/>

Over Power Main Team

</p>



</aside>









{/* RIGHT SIDE */}



<div className="profile-right">





<div className="profile-table">


<h2>
🏆 ACHIEVEMENTS
</h2>

<thead>

<tr>

<th>DATE</th>
<th>TIER</th>
<th>TOURNAMENT</th>
<th>PRIZE</th>

</tr>

</thead>

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








<div className="profile-table">


<h2>
🏅 AWARDS
</h2>

<thead>

<tr>

<th>DATE</th>
<th>AWARD</th>
<th>ORGANIZATION</th>

</tr>

</thead>

<table>

<thead>

<tr>

<th>
DATE
</th>

<th>
AWARD
</th>

<th>
ORGANIZATION
</th>

</tr>

</thead>


<tbody>

<tr>

<td>
2026
</td>

<td>
Elite Player Award
</td>

<td>
Over Power Esports
</td>

</tr>


</tbody>

</table>


<td>
Elite Player Award
</td>


<td>
Over Power Esports
</td>


</tr>


</tbody>

</table>


</div>






</div>



</div>



</section>


)

}
