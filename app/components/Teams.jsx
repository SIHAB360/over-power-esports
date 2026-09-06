export default function Teams(){

const teams = [

{
name:"OVER POWER MAIN TEAM",
slogan:"Born To Dominate",

players:[
{name:"APPELO",role:"PRIMARY"},
{name:"OGGY",role:"SECOUNDARY"},
{name:"ITACHIx",role:"BOMBER"},
{name:"REJWAN",role:"IGL+SUPPORTER"},
{name:"FixFIRE",role:"SNIPER"}
]

},


{
name:"OVER POWER ELITE",
slogan:"Victory Is Our Language",

players:[
{name:"RF NTC",role:"PRIMARY"},
{name:"JELLAL",role:"SECOUNDARY"},
{name:"PLAYER THREE",role:"BOMBER"},
{name:"NAFIZ",role:"SUPPORTER"},
{name:"BAYMAX",role:"SNIPER"}
]

},


{
name:"OVER POWER RISING",
slogan:"Future Champions.",

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
</div>


<h4>
{player.name}
</h4>


<span>
{player.role}
</span>


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
