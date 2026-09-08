export default async function PlayerProfile({params}){


const players = {

appelo:{
name:"APPELO",
role:"PRIMARY",
team:"OVER POWER MAIN TEAM",
image:"/players/appelo.png",
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
facebook:"https://www.facebook.com/profile.php?id=61590102347309",
instagram:"",
youtube:"https://youtube.com/@itachiontop-r2p",
tiktok:"https://www.tiktok.com/@itachix074"
},


rejwan:{
name:"REJWAN",
role:"IGL+SUPPORTER",
team:"OVER POWER MAIN TEAM",
image:"/players/rejwan.png",
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

<section className="player-profile premium">


<div className="player-header">

<img
src={player.image}
alt={player.name}
/>


<div className="player-title">

<span className="badge">
PRO PLAYER
</span>

<h1>
{player.name}
</h1>


<h3>
{player.role}
</h3>


<h4>
{player.team}
</h4>

</div>

</div>




<div className="stats-panel">


<div className="stat-box">
<h2>25+</h2>
<p>MATCHES</p>
</div>


<div className="stat-box">
<h2>12</h2>
<p>WINS</p>
</div>


<div className="stat-box">
<h2>5</h2>
<p>MVP</p>
</div>


<div className="stat-box">
<h2>#01</h2>
<p>RANK</p>
</div>


</div>





<div className="player-info">


<p>
<span>ROLE</span>
{player.role}
</p>


<p>
<span>TEAM</span>
{player.team}
</p>


<p>
<span>STATUS</span>
ACTIVE PLAYER
</p>


<p>
<span>COUNTRY</span>
BANGLADESH
</p>


</div>






<div className="awards">


<h2>
🏅 AWARDS
</h2>


<div className="award-card">

<h3>
ELITE PLAYER
</h3>

<p>
Over Power Esports Official Roster
</p>

</div>


<div className="award-card">

<h3>
TEAM WARRIOR
</h3>

<p>
Competitive Gaming Specialist
</p>

</div>


</div>







<div className="achievements">


<h2>
🏆 ACHIEVEMENTS
</h2>


<ul>

<li>
Over Power Esports Main Team Player
</li>

<li>
Competitive Tournament Participant
</li>

<li>
Professional Free Fire Player
</li>

</ul>


</div>







<div className="social-links">


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



</section>

)

}
