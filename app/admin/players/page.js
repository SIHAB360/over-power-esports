"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";


export default function PlayersPage(){

const [players,setPlayers]=useState([]);
const [loading,setLoading]=useState(true);



useEffect(()=>{
fetchPlayers();
},[]);



const fetchPlayers=async()=>{

const {data,error}=await supabase
.from("players")
.select("*")
.order("created_at",{ascending:false});


if(!error){
setPlayers(data || []);
}

setLoading(false);

};



const approvePlayer=async(id)=>{

const {error}=await supabase
.from("players")
.update({
status:"approved"
})
.eq("id",id);


if(!error){
fetchPlayers();
}

};



if(loading){

return(
<div className="loading">
LOADING PLAYERS...
</div>
)

}




return(

<main className="page">


<h1>
PLAYER MANAGEMENT
</h1>



<div className="grid">


{
players.map(player=>(


<div className="card" key={player.id}>


<div className="shine"></div>


<div className="profile">


<div className="avatar">
{player.full_name?.charAt(0)||"P"}
</div>


<div>

<h2>
{player.full_name || "PLAYER"}
</h2>

<small>
ID #{player.id.slice(0,6)}
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
<p>{player.team_name || "NO TEAM"}</p>
</div>


<div>
<label>POSITION</label>
<p>
{player.primary_role || player.position || "NOT ASSIGNED"}
</p>
</div>



<div className="status">

<span>STATUS</span>

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
player.status!=="approved" &&

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





<style jsx>{`

.page{

min-height:100vh;
background:
radial-gradient(circle,#25000c,#030303 60%);
padding:50px 30px;
color:white;

}


h1{

text-align:center;
font-size:45px;
letter-spacing:8px;
color:#ff1744;

text-shadow:
0 0 10px #ff1744,
0 0 40px #ff1744;

margin-bottom:60px;

}




.grid{

max-width:1100px;

margin:auto;

display:grid;

grid-template-columns:repeat(3,1fr);

gap:35px;

align-items:start;

}




.card{

position:relative;
overflow:hidden;

background:
linear-gradient(
145deg,
rgba(255,0,60,.18),
rgba(5,5,5,.95)
);

border-radius:25px;

padding:28px;

height:500px;

border:1px solid rgba(255,23,68,.7);

box-shadow:
0 0 25px rgba(255,0,70,.25),
inset 0 0 30px rgba(255,0,70,.08);

transition:.4s;

display:flex;
flex-direction:column;
justify-content:space-between;

}


.card:hover{

transform:translateY(-12px) scale(1.03);

box-shadow:

0 0 60px rgba(255,0,70,.7);

}




.card::before{

content:"";

position:absolute;

inset:-2px;

background:

linear-gradient(
90deg,
transparent,
#ff1744,
transparent
);

animation:borderMove 3s linear infinite;

z-index:-1;

}



.shine{

position:absolute;

width:120%;

height:40px;

background:white;

opacity:.08;

transform:rotate(-25deg);

top:-40px;

left:-50px;

animation:shine 4s infinite;

}




.profile{

display:flex;

align-items:center;

gap:18px;

}



.avatar{

width:65px;
height:65px;

border-radius:50%;

background:#ff1744;

display:flex;

align-items:center;
justify-content:center;

font-size:30px;

font-weight:bold;

box-shadow:

0 0 25px #ff1744;

}



h2{

margin:0;

font-size:22px;

}



small{

color:#888;

}



.info{

margin-top:30px;

text-align:center;

}



.info div{

margin-bottom:20px;

}



label{

display:block;

font-size:11px;

letter-spacing:3px;

color:#888;

}



p{

color:#00ff88;

word-break:break-word;

}




.status{

background:
rgba(255,23,68,.12);

border:1px solid rgba(255,23,68,.5);

border-radius:20px;

padding:12px 18px;

display:flex;

justify-content:space-between;

align-items:center;

box-shadow:
0 0 15px rgba(255,0,70,.3);

}




.approved{

color:#00ff88;

text-shadow:0 0 10px #00ff88;

}



.pending{

color:#ffc400;

text-shadow:0 0 10px #ffc400;

}




button{

width:100%;

padding:14px;

margin-top:12px;

border-radius:15px;

font-weight:bold;

cursor:pointer;

transition:.3s;

}



.view{

background:transparent;

color:#ff1744;

border:1px solid #ff1744;

box-shadow:0 0 15px rgba(255,0,70,.3);

}



.approve{

background:#ff1744;

color:white;

border:none;

box-shadow:0 0 25px #ff1744;

}




button:hover{

transform:scale(1.05);

}




.loading{

height:100vh;

display:flex;

align-items:center;
justify-content:center;

background:#000;

color:#ff1744;

font-size:30px;

}




@keyframes pulse{

50%{

box-shadow:
0 0 45px rgba(255,0,70,.45);

}

}



@keyframes borderMove{

0%{

transform:translateX(-100%);

}

100%{

transform:translateX(100%);

}

}



@keyframes shine{

50%{

top:120%;

}

}



`}</style>


</main>


)

}
