"use client";

import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


export default function PlayerProfilePage(){

const params = useParams();

const id = params.id;


const [player,setPlayer]=useState(null);
const [loading,setLoading]=useState(true);



useEffect(()=>{

if(id){

fetchPlayer();

}

},[id]);





const fetchPlayer=async()=>{


const {data,error}=await supabase

.from("players")

.select("*")

.eq("id",id)

.single();



console.log("PLAYER:",data);
console.log("ERROR:",error);



if(!error){

setPlayer(data);

}


setLoading(false);


};






if(loading){

return(

<div className="loading">

LOADING PLAYER...

</div>

)

}





if(!player){

return(

<div className="loading">

PLAYER NOT FOUND

</div>

)

}





return(

<main className="profile-page">


<div className="profile-card">



<div className="header">


<div className="image-box">

<img

src={player.profile_image || player.avatar_url || "/default.png"}

alt="player"

/>

</div>




<div>

<h1>

{player.ign || player.full_name}

</h1>


<h3>

{player.primary_role || player.position || "PLAYER"}

</h3>


<p>

TEAM : {player.team_name || "NO TEAM"}

</p>


</div>


</div>






<div className="stats">


<div>

<span>MATCHES</span>

<strong>

{player.matches_played || 0}

</strong>

</div>



<div>

<span>WINS</span>

<strong>

{player.wins || 0}

</strong>

</div>


<div>

<span>STATUS</span>

<strong className={player.status}>

{player.status}

</strong>

</div>



</div>







<div className="section">


<h2>

PLAYER INFORMATION

</h2>


<p>
NAME : {player.full_name}
</p>


<p>
FREE FIRE UID : {player.freefire_uid}
</p>


<p>
EMAIL : {player.email}
</p>


<p>
PHONE : {player.phone}
</p>


<p>
COUNTRY : {player.country}
</p>


<p>
AGE : {player.age}
</p>


<p>
EXPERIENCE : {player.experience}
</p>



</div>







<div className="section">


<h2>

GAME DETAILS

</h2>


<p>
PRIMARY ROLE : {player.primary_role}
</p>


<p>
SECONDARY ROLE : {player.secondary_role}
</p>


<p>
DEVICE : {player.device}
</p>


<p>
INTERNET : {player.internet_connection}
</p>


<p>
PRACTICE TIME : {player.practice_time}
</p>


<p>
GAME EXPERIENCE : {player.game_experience}
</p>


<p>
TOURNAMENT EXPERIENCE : {player.tournament_experience}
</p>


<p>
BR KD : {player.average_br_kd_rate}
</p>


<p>
EXPERT WEAPON : {player.expert_weapon}
</p>



</div>







<div className="section">


<h2>

TEAM HISTORY

</h2>


<p>

PREVIOUS TEAM : {player.previous_team}

</p>


<p>

JOINING DATE : {player.joining_date}

</p>


</div>







<div className="social">


<h2>

SOCIAL LINKS

</h2>


<a href={player.facebook_link}>
Facebook
</a>


<a href={player.instagram_link}>
Instagram
</a>


<a href={player.youtube_link}>
Youtube
</a>


<a href={player.tiktok_link}>
TikTok
</a>



</div>





</div>






<style jsx>{`

.profile-page{

min-height:100vh;

background:#050505;

color:white;

padding:50px;

}



.profile-card{

max-width:900px;

margin:auto;

background:
linear-gradient(
145deg,
rgba(255,0,60,.15),
black
);


border:1px solid #ff1744;

border-radius:30px;

padding:40px;

box-shadow:
0 0 40px rgba(255,0,70,.4);

}



.header{

display:flex;

gap:30px;

align-items:center;

}



.image-box img{

width:150px;

height:150px;

border-radius:20px;

object-fit:cover;

border:2px solid #ff1744;

}



h1{

color:#ff1744;

font-size:40px;

}



h2{

color:#ff1744;

letter-spacing:2px;

}



.stats{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

margin:40px 0;

}



.stats div{

padding:20px;

text-align:center;

border:1px solid #333;

border-radius:15px;

}



.stats span{

display:block;

color:#888;

}



.stats strong{

font-size:25px;

}



.approved{

color:#00ff88;

}



.pending{

color:#ffc400;

}



.section{

margin-top:30px;

padding:25px;

border:1px solid rgba(255,23,68,.4);

border-radius:20px;

}



.section p{

color:#00ff88;

}



.social{

margin-top:30px;

}



.social a{

display:inline-block;

margin-right:15px;

color:#ff1744;

}



.loading{

height:100vh;

display:flex;

align-items:center;

justify-content:center;

background:#050505;

color:#ff1744;

font-size:30px;

}



@media(max-width:700px){

.header{

flex-direction:column;

}


.stats{

grid-template-columns:1fr;

}

}


`}</style>


</main>


)

}
