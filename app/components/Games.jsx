"use client";

import { useEffect, useState } from "react";


function Counter({value}){

const [count,setCount]=useState(0);


useEffect(()=>{

let start=0;

const end=parseInt(value);

const duration=1200;

const increment=end/(duration/30);


const timer=setInterval(()=>{

start+=increment;


if(start>=end){

setCount(end);

clearInterval(timer);

}

else{

setCount(Math.floor(start));

}


},30);



return()=>clearInterval(timer);


},[value]);



return <strong>{count}+</strong>;

}




export default function Games(){


const games=[

{
title:"Over Power Main Team",
icon:"🔥",
description:"Free Fire Competitive Division",

tournaments:75,
championRush:30,
scrims:60,
wins:40,

status:"Active Roster"
},


{
title:"Over Power Elite",
icon:"⚡",
description:"Free Fire Competitive Division",

tournaments:90,
championRush:30,
scrims:60,
wins:35,

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

<p>
Tournaments
</p>

<Counter value={game.tournaments}/>

</div>




<div>

<p>
Champion Rush
</p>

<Counter value={game.championRush}/>

</div>





<div>

<p>
Scrims
</p>

<Counter value={game.scrims}/>

</div>





<div>

<p>
Wins
</p>

<Counter value={game.wins}/>

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
