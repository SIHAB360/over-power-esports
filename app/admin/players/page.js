"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

export default function PlayersPage(){

const [players,setPlayers]=useState([]);
const [loading,setLoading]=useState(true);


useEffect(()=>{
fetchPlayers();
},[]);



const fetchPlayers = async()=>{

const {data,error}=await supabase
.from("profiles")
.select("*")
.order("created_at",{ascending:false});


if(!error){
setPlayers(data || []);
}

setLoading(false);

};



if(loading){

return(
<div>
Loading Players...
</div>
);

}



return(

<main className="players-page">

<h1>
PLAYER MANAGEMENT
</h1>


<div className="players-grid">

{
players.map((player)=>(

<div className="player-card" key={player.id}>

<h2>
{player.email}
</h2>

<p>
Role: {player.role || "PLAYER"}
</p>


</div>

))
}

</div>


<style jsx>{`

.players-page{

min-height:100vh;
padding:50px;
background:#050505;
color:white;

}


.players-grid{

display:grid;
grid-template-columns:repeat(3,1fr);
gap:25px;

}


.player-card{

padding:25px;
border-radius:20px;

background:rgba(255,20,60,.08);

border:1px solid rgba(255,20,60,.5);

}


@media(max-width:900px){

.players-grid{

grid-template-columns:1fr;

}

}

`}</style>


</main>

);

}
