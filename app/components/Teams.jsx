export default function Teams(){

const teams = [

{
name:"OVER POWER MAIN TEAM",
slogan:"Born To Dominate",

players:[
{name:"APPELO",role:"PRIMARY"},
{name:"OGGY",role:"SECONDARY"},
{name:"ITACHIx",role:"BOMBER"},
{name:"REJWAN",role:"IGL+SUPPORTER"},
{name:"FixFIRE",role:"SNIPER"}
]

},


{
name:"OVER POWER ELITE",
slogan:"Victory Is Our Language",

players:[
{
name:"RF NTC",
role:"PRIMARY",
image:"/players/rfntc.png"
},

{
name:"JELLAL",
role:"SECONDARY",
image:"/players/jellal.png"
},

{
name:"SOJIB",
role:"BOMBER",
image:"/players/sojib.png"
},

{
name:"NAFIZ",
role:"SUPPORTER",
image:"/players/nafiz.jpeg"
},

{
name:"BAYMAX",
role:"SNIPER",
image:"/players/baymax.png"
}
]

},


{
name:"OVER POWER RISING",
slogan:"Future Champions",

players:[
{name:"PLAYER ONE",role:"RISING STAR"},
{name:"PLAYER TWO",role:"ASSAULTER"},
{name:"PLAYER THREE",role:"SNIPER"},
{name:"PLAYER FOUR",role:"ALL ROUNDER"},
{name:"PLAYER FIVE",role:"SUPPORT"}
]

}

]


return(

<section className="teams">


<h2>
OUR TEAMS
</h2>


{
teams.map((team,index)=>(

<div className="team-block" key={index}>


<h3>
{team.name}
</h3>


<p>
{team.slogan}
</p>



<div className="team-players">


{
team.players.map((player,i)=>(


<div className="player-card" key={i}>


<div className="player-image">

<img 
src={player.image}
alt={player.name}
/>

</div>


<h4>
{player.name}
</h4>


<span>
{player.role}
</span>



<div className="social-links">


<a href="#">
<i className="fa-brands fa-facebook-f"></i>
</a>


<a href="#">
<i className="fa-brands fa-instagram"></i>
</a>


<a href="#">
<i className="fa-brands fa-youtube"></i>
</a>


<a href="#">
<i className="fa-brands fa-tiktok"></i>
</a>


</div>



<button>
VIEW PROFILE
</button>


</div>


))

}


</div>


</div>

))

}


</section>

)

}
