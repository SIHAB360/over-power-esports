export default function Tournaments(){

const tournaments=[
{
name:"OP Championship 2026",
game:"Valorant",
prize:"$10,000",
status:"Upcoming"
},

{
name:"Power Clash Cup",
game:"CS2",
prize:"$5,000",
status:"Live"
},

{
name:"Winter Battle Arena",
game:"PUBG Mobile",
prize:"$3,000",
status:"Completed"
}

]


return(

<section className="tournaments">

<h2>
Upcoming Tournaments
</h2>


<div className="tournament-container">

{
tournaments.map((item,index)=>(

<div className="tournament-card" key={index}>


<div className="status">
{item.status}
</div>


<h3>
{item.name}
</h3>


<div className="tournament-info">

<p>
🎮 Game: {item.game}
</p>


<p>
🏆 Prize: {item.prize}
</p>


</div>


<button>
VIEW DETAILS
</button>


</div>

))
}


</div>


<div className="join-card">

<h2>
READY TO JOIN?
</h2>

<p>
Become part of Over Power Esports
</p>

<button>
JOIN TEAM
</button>

</div>


</section>

)

}
