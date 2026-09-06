export default function Teams(){

const teams = [

{
name:"OVER POWER MAIN TEAM",
slogan:"Power. Skill. Victory.",

players:[
{name:"BLADE",role:"RUSHER"},
{name:"FLICKER",role:"SNIPER"},
{name:"NEJAD",role:"BOMBER"},
{name:"KUTTUSH",role:"ALL ROUNDER"},
{name:"PLAYER FIVE",role:"SUPPORT"}
]

},


{
name:"OVER POWER ELITE",
slogan:"Rise Beyond Limits.",

players:[
{name:"PLAYER ONE",role:"RUSHER"},
{name:"PLAYER TWO",role:"SNIPER"},
{name:"PLAYER THREE",role:"SUPPORT"},
{name:"PLAYER FOUR",role:"IGL"},
{name:"PLAYER FIVE",role:"ASSAULTER"}
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
