export default function Games(){

const games=[

{
title:"Over Power Main Team",
icon:"🔥",
description:"Free Fire Competitive Division",

tournaments:"75+",
championRush:"30+",
scrims:"60+",
wins:"40+",

status:"Active Roster"
},


{
title:"Over Power Elite",
icon:"⚡",
description:"Free Fire Competitive Division",

tournaments:"90+",
championRush:"30+",
scrims:"60+",
wins:"35+",

status:"Active Roster"
}

];


return(

<section className="games">


<div className="games-header">

<h2>
OP Believe in Domination
</h2>

<p>
Power • Unity • Victory
</p>

</div>



<div className="game-container">


{
games.map((game,index)=>(


<div className="game-card" key={index}>


<div className="game-icon">
{game.icon}
</div>



<h3>
{game.title}
</h3>



<p className="game-description">
{game.description}
</p>




<div className="game-stats">


<div>
<p>Tournaments</p>
<strong>{game.tournaments}</strong>
</div>


<div>
<p>Champion Rush</p>
<strong>{game.championRush}</strong>
</div>


<div>
<p>Scrims</p>
<strong>{game.scrims}</strong>
</div>


<div>
<p>Wins</p>
<strong>{game.wins}</strong>
</div>


</div>



<div className="game-status">

{game.status}

</div>



</div>


))

}


</div>


</section>

)

}
