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

<div className="loading">
LOADING PLAYERS...
</div>

);

}




return(

<main className="players-page">


<div className="container">


<h1>
PLAYER MANAGEMENT
</h1>


<div className="players-grid">


{
players.map((player)=>(

<div className="player-card" key={player.id}>


<h2>
{player.full_name || "Unnamed Player"}
</h2>

<p>
Email: {player.email}
</p>

<p>
ROLE : {player.role || "PLAYER"}
</p>

</div>

))
}


</div>


</div>



<style jsx>{`

.players-page{

min-height:100vh;
background:#050505;
color:white;
padding:50px;

}


.container{

max-width:1200px;
margin:auto;

}


h1{

color:#ff1744;
letter-spacing:8px;
font-size:40px;

}


.players-grid{

display:grid;
grid-template-columns:repeat(3,1fr);
gap:25px;
margin-top:40px;

}


.player-card{

padding:30px;
border-radius:20px;

background:
linear-gradient(
145deg,
rgba(255,20,60,.15),
rgba(0,0,0,.8)
);

border:1px solid rgba(255,20,60,.5);

}


.player-card h2{

font-size:18px;

}


.player-card p{

color:#ff1744;

}



.loading{

height:100vh;
display:flex;
align-items:center;
justify-content:center;
background:#050505;
color:#ff1744;

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
