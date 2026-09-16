"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";


export default function PlayersPage(){


const [players,setPlayers]=useState([]);
const [loading,setLoading]=useState(true);



useEffect(()=>{

fetchPlayers();

},[]);





const fetchPlayers = async()=>{


const {data,error}=await supabase
.from("players")
.select("*")
.order("created_at",{ascending:false});



console.log("PLAYERS:",data);
console.log("ERROR:",error);



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


<div className="header">


<div className="avatar">

{player.full_name?.charAt(0) || "P"}

</div>



<div>

<h2>

{player.full_name || "Unnamed Player"}

</h2>


<small>

PLAYER ID #{player.id.slice(0,6)}

</small>


</div>


</div>






<div className="info">


<p>

<span>EMAIL</span>

{player.email || "N/A"}

</p>



<p>

<span>TEAM</span>

{player.team_name || "No Team"}

</p>



<p>

<span>POSITION</span>

{player.primary_role || player.position || "Not Assigned"}

</p>



<div className="status">

STATUS

<strong className={
player.status==="approved"
?
"approved"
:
"pending"
}>

{player.status || "pending"}

</strong>


</div>



</div>






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

text-align:center;

color:#ff1744;

font-size:42px;

letter-spacing:8px;

margin-bottom:50px;

text-shadow:0 0 20px #ff1744;

}





.players-grid{

display:grid;

grid-template-columns:repeat(3,300px);

gap:35px;

justify-content:center;

}




.player-card{


background:

linear-gradient(
145deg,
rgba(255,20,60,.2),
black
);


border:1px solid #ff1744;

border-radius:25px;

padding:25px;

min-height:430px;

display:flex;

flex-direction:column;

justify-content:space-between;

box-shadow:

0 0 25px rgba(255,0,70,.3);


}





.header{

display:flex;

align-items:center;

gap:15px;

}



.avatar{

height:55px;

width:55px;

border-radius:50%;

background:#ff1744;

display:flex;

align-items:center;

justify-content:center;

font-size:25px;

font-weight:bold;

box-shadow:0 0 20px #ff1744;

}



.header h2{

margin:0;

font-size:20px;

}



small{

color:#999;

}




.info{

text-align:center;

}



.info p{

margin:20px 0;

display:flex;

flex-direction:column;

}



.info span{

font-size:11px;

color:#888;

letter-spacing:2px;

}



.status{

border-top:1px solid #333;

padding-top:15px;

display:flex;

justify-content:space-between;

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

cursor:pointer;

font-weight:bold;

margin-top:10px;

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

transform:scale(1.05);

}





.loading{

height:100vh;

display:flex;

justify-content:center;

align-items:center;

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
