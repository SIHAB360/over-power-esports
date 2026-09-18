"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";


export default function TeamPlayersPage() {

  const params = useParams();

  const teamId = params.id;


  const [team,setTeam] = useState(null);
  const [players,setPlayers] = useState([]);
  const [availablePlayers,setAvailablePlayers] = useState([]);

  const [loading,setLoading] = useState(true);



  useEffect(()=>{

    if(teamId){
      loadData();
    }

  },[teamId]);




  async function loadData(){


    setLoading(true);



    // TEAM DATA

    const {data:teamData,error:teamError}=await supabase
    .from("teams")
    .select("*")
    .eq("id",teamId)
    .single();



    if(teamError){

      console.log(teamError);
      return;

    }



    setTeam(teamData);



    // CURRENT TEAM PLAYERS

    const {data:teamPlayers}=await supabase
    .from("players")
    .select("*")
    .eq("team_id",teamId);



    setPlayers(teamPlayers || []);




    // AVAILABLE PLAYERS

    const {data:freePlayers}=await supabase
    .from("players")
    .select("*")
    .is("team_id",null);



    setAvailablePlayers(freePlayers || []);



    setLoading(false);

  }





  async function addPlayer(playerId){


    const {error}=await supabase
    .from("players")
    .update({

      team_id:teamId

    })
    .eq("id",playerId);



    if(error){

      alert(error.message);
      return;

    }


    loadData();


  }





  async function removePlayer(playerId){


    const {error}=await supabase
    .from("players")
    .update({

      team_id:null

    })
    .eq("id",playerId);



    if(error){

      alert(error.message);
      return;

    }


    loadData();


  }




if(loading){

return(

<main className="page">

<h2>
Loading Team...
</h2>

</main>

)

}




return (

<main className="page">


<div className="container">



<header>

<p>
OVER POWER ESPORTS
</p>

<h1>
{team?.team_name}
</h1>

<span>
TEAM PLAYER MANAGEMENT
</span>

</header>




<section className="card team-info">


<h2>
TEAM INFORMATION
</h2>


<div className="info">


<div>
Coach
<b>
{team?.coach_name || "N/A"}
</b>
</div>


<div>
Manager
<b>
{team?.manager_name || "N/A"}
</b>
</div>


<div>
Country
<b>
{team?.country || "N/A"}
</b>
</div>


</div>


</section>






<section className="card">


<h2>
CURRENT ROSTER ({players.length})
</h2>



{

players.length===0 ?

<p>
No player added yet.
</p>


:

players.map((player)=>(


<div className="player" key={player.id}>


<div>

<h3>
{player.full_name}
</h3>


<p>
IGN: {player.freefire_uid}
</p>


<p>
Role: {player.primary_role || "N/A"}
</p>


</div>


<button
className="remove"
onClick={()=>removePlayer(player.id)}
>
REMOVE
</button>


</div>


))


}


</section>







<section className="card">


<h2>
AVAILABLE PLAYERS
</h2>



{

availablePlayers.length===0 ?

<p>
No available players.
</p>


:

availablePlayers.map((player)=>(


<div className="player" key={player.id}>


<div>

<h3>
{player.full_name}
</h3>


<p>
IGN: {player.freefire_uid}
</p>


<p>
Role: {player.primary_role || "N/A"}
</p>


</div>



<button
onClick={()=>addPlayer(player.id)}
>
ADD PLAYER
</button>



</div>


))


}



</section>




</div>





<style jsx>{`

.page{

min-height:100vh;

background:#050505;

color:white;

padding:40px 20px;

}



.container{

max-width:1000px;

margin:auto;

}



header{

text-align:center;

margin-bottom:30px;

}



header p{

color:#ff174d;

letter-spacing:4px;

font-size:12px;

}



header h1{

font-size:45px;

margin:10px 0;

}



header span{

color:#999;

}



.card{

background:#0c0c10;

border:1px solid rgba(255,0,80,.3);

border-radius:25px;

padding:30px;

margin-bottom:25px;

}



h2{

font-size:20px;

}



.info{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

}



.info div{

background:#111;

padding:20px;

border-radius:15px;

color:#aaa;

}



.info b{

display:block;

color:white;

margin-top:10px;

}




.player{

display:flex;

justify-content:space-between;

align-items:center;

background:#111;

padding:18px;

border-radius:18px;

margin-top:15px;

}



.player h3{

margin:0;

}



.player p{

color:#999;

margin:5px 0;

}



button{

border:none;

padding:12px 22px;

border-radius:25px;

background:linear-gradient(
135deg,
#ff174d,
#7000ff
);

color:white;

font-weight:900;

cursor:pointer;

}



.remove{

background:#ff174d;

}



@media(max-width:700px){

.info{

grid-template-columns:1fr;

}


.player{

flex-direction:column;

gap:15px;

}


}



`}</style>


</main>

);

}
