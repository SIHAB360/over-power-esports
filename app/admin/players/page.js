"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";


export default function PlayersPage() {

const [players,setPlayers] = useState([]);
const [loading,setLoading] = useState(true);



useEffect(()=>{
fetchPlayers();
},[]);



const fetchPlayers = async()=>{

const {data,error}=await supabase
.from("players")
.select("*")
.order("created_at",{ascending:false});


console.log(data,error);


if(!error){
setPlayers(data || []);
}

setLoading(false);

};




const approvePlayer = async(id)=>{

const {error}=await supabase
.from("players")
.update({
status:"approved"
})
.eq("id",id);



if(error){
console.log(error);
return;
}


fetchPlayers();

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


<div className="top">


<div className="avatar">
{player.full_name?.charAt(0) || "P"}
</div>


<div>
<h2>
{player.full_name || "Unnamed Player"}
</h2>

<small>
PLAYER #{player.id.slice(0,6)}
</small>

</div>


</div>




<div className="info">


<div>
<label>EMAIL</label>
<p>{player.email || "N/A"}</p>
</div>



<div>
<label>TEAM</label>
<p>{player.team_name || "No Team"}</p>
</div>



<div>
<label>POSITION</label>
<p>{player.primary_role || player.position || "Not Assigned"}</p>
</div>



<div className="status-box">

<span>STATUS</span>

<strong className={player.status==="approved"?"approved":"pending"}>
{player.status || "pending"}
</strong>

</div>


</div>




<div>


<button
className="view"
onClick={()=>window.location.href=`/admin/players/${player.id}`}
>
VIEW PROFILE
</button>



{
player.status !== "approved" &&
<button
className="approve"
onClick={()=>approvePlayer(player.id)}
>
APPROVE PLAYER
</button>
}


</div>



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
padding:50px 20px;

}



.container{

max-width:1200px;
margin:auto;

}



h1{

text-align:center;
font-size:40px;
letter-spacing:6px;
color:#ff1744;
text-shadow:0 0 20px #ff1744;
margin-bottom:50px;

}




.players-grid{

display:grid;
grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
gap:30px;

}




.player-card{

background:
linear-gradient(145deg,#160008,#050505);

border:1px solid rgba(255,23,68,.5);

border-radius:25px;

padding:25px;

box-shadow:
0 0 30px rgba(255,0,70,.2);

transition:.3s;

min-height:420px;

display:flex;
flex-direction:column;
justify-content:space-between;

}



.player-card:hover{

transform:translateY(-8px);

box-shadow:
0 0 40px rgba(255,0,70,.5);

}




.top{

display:flex;
align-items:center;
gap:15px;

}



.avatar{

width:60px;
height:60px;
border-radius:50%;

background:#ff1744;

display:flex;
align-items:center;
justify-content:center;

font-size:25px;
font-weight:bold;

box-shadow:0 0 20px #ff1744;

}




h2{

font-size:20px;
margin:0;

}



small{

color:#888;

}



.info{

margin-top:25px;

}



.info div{

margin-bottom:18px;

}



label{

font-size:11px;
color:#888;
letter-spacing:2px;

}



.info p{

margin:5px 0;

word-break:break-word;

}



.status-box{

display:flex;
justify-content:space-between;

padding-top:15px;
border-top:1px solid #333;

}



.approved{

color:#00ff88;

}



.pending{

color:#ffc400;

}





button{

width:100%;
padding:13px;

border-radius:12px;
margin-top:10px;

font-weight:bold;
cursor:pointer;

transition:.3s;

}



.view{

background:transparent;
border:1px solid #ff1744;
color:#ff1744;

}



.approve{

background:#ff1744;
border:none;
color:white;

}



button:hover{

transform:scale(1.03);

}



.loading{

height:100vh;
display:flex;
justify-content:center;
align-items:center;

background:#050505;
color:#ff1744;

}



`}</style>


</main>

);

}
