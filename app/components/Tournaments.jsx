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

<h3>{item.name}</h3>

<p>🎮 {item.game}</p>

<p>🏆 Prize: {item.prize}</p>

<span>{item.status}</span>

</div>

))
}

</div>

</section>

)

}
