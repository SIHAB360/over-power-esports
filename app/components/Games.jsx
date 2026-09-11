export default function Games(){

const games = [
{
title:"Free Fire",
icon:"🔥",
description:"Free Fire Competitive Team",
tournaments:"25+",
wins:"15+",
status:"Active Division"
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

<div 
className="game-card"
key={index}
>



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

<span>
🏆
</span>

<p>
Tournaments
</p>

<strong>
{game.tournaments}
</strong>

</div>



<div>

<span>
🥇
</span>

<p>
Wins
</p>

<strong>
{game.wins}
</strong>

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
