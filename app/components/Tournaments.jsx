export default function Tournaments(){

const tournaments=[

{
name:"OP Championship 2026",
game:"Valorant",
prize:"$10,000",
status:"Upcoming",
icon:"🔥"
},

{
name:"Power Clash Cup",
game:"CS2",
prize:"$5,000",
status:"Live",
icon:"⚡"
},

{
name:"Winter Battle Arena",
game:"PUBG Mobile",
prize:"$3,000",
status:"Completed",
icon:"🏆"
}

];


return(

<section className="tournaments">


<div className="tournament-header">

<h2>
Upcoming Tournaments
</h2>

<p>
Compete • Dominate • Become Champion
</p>

</div>



<div className="tournament-container">


{
tournaments.map((item,index)=>(


<div 
className="tournament-card" 
key={index}
>



<div className="tournament-top">


<span className="status">
{item.status}
</span>


<span className="tournament-icon">
{item.icon}
</span>


</div>



<h3>
{item.name}
</h3>




<div className="tournament-info">


<p>
<span>🎮 Game:</span> {item.game}
</p>


<p>
<span>🏆 Prize:</span> {item.prize}
</p>


</div>




<button>
VIEW DETAILS
</button>



</div>


))
}


</div>


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
