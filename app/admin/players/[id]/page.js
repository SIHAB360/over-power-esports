"use client";

import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


export default function PlayerProfilePage(){

const {id}=useParams();

const [player,setPlayer]=useState(null);
const [loading,setLoading]=useState(true);



useEffect(()=>{

if(id){
getPlayer();
}

},[id]);



const getPlayer=async()=>{

const {data,error}=await supabase
.from("players")
.select("*")
.eq("id",id)
.single();


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

);

}





if(!player){

return(

<div className="loading">

PLAYER NOT FOUND

</div>

);

}




return(

<main className="page">


<div className="profile">



<section className="hero">


<div className="image-box">

<img

src={
player.profile_image ||
player.avatar_url ||
"/default.png"
}

/>

</div>



<div className="hero-info">

<p className="brand">
OVER POWER ESPORTS
</p>


<h1>

{player.ign || player.full_name}

</h1>


<h3>

{player.primary_role || player.position || "PLAYER"}

</h3>


<p className="team">

{player.team_name || "NO TEAM"}

</p>



<span className="status">

{player.status || "pending"}

</span>


</div>


</section>






<section className="stats">


<Stat
title="MATCHES"
value={player.matches_played || 0}
/>


<Stat
title="WINS"
value={player.wins || 0}
/>


<Stat
title="KILLS"
value={player.total_kills || 0}
/>


</section>






<Section title="PLAYER INFORMATION">


<Row label="FULL NAME" value={player.full_name}/>

<Row label="IGN" value={player.ign}/>

<Row label="FREE FIRE UID" value={player.freefire_uid}/>

<Row label="EMAIL" value={player.email}/>

<Row label="PHONE" value={player.phone}/>

<Row label="COUNTRY" value={player.country}/>

<Row label="AGE" value={player.age}/>


</Section>
// CONTINUATION


<Section title="GAME DETAILS">


<Row label="PRIMARY ROLE" value={player.primary_role}/>

<Row label="SECONDARY ROLE" value={player.secondary_role}/>

<Row label="DEVICE" value={player.device}/>

<Row label="INTERNET" value={player.internet_connection}/>

<Row label="PRACTICE TIME" value={player.practice_time}/>

<Row label="GAME EXPERIENCE" value={player.game_experience}/>

<Row label="TOURNAMENT EXPERIENCE" value={player.tournament_experience}/>

<Row label="BR K/D RATE" value={player.average_br_kd_rate}/>

<Row label="EXPERT WEAPON" value={player.expert_weapon}/>


</Section>





<Section title="TEAM HISTORY">


<Row label="PREVIOUS TEAM" value={player.previous_team}/>

<Row label="JOINING DATE" value={player.joining_date}/>


</Section>






<section className="section">

<h2>
SOCIAL LINKS
</h2>


<div className="social">


{player.facebook_link &&
<a href={player.facebook_link}>FACEBOOK</a>
}


{player.instagram_link &&
<a href={player.instagram_link}>INSTAGRAM</a>
}


{player.youtube_link &&
<a href={player.youtube_link}>YOUTUBE</a>
}


{player.tiktok_link &&
<a href={player.tiktok_link}>TIKTOK</a>
}


</div>


</section>



</div>





<style jsx>{`

.page{

min-height:100vh;

background:
radial-gradient(circle,#30000c,#050505 70%);

padding:40px 20px;

color:white;

}



.profile{

max-width:950px;

margin:auto;

}



.hero{

display:flex;

align-items:center;

gap:35px;

padding:35px;

border-radius:25px;

background:
linear-gradient(
145deg,
rgba(255,0,60,.2),
#050505
);

border:1px solid #ff1744;

box-shadow:
0 0 40px rgba(255,0,70,.4);

}



.image-box img{

width:170px;

height:170px;

object-fit:cover;

border-radius:25px;

border:2px solid #ff1744;

box-shadow:
0 0 30px #ff1744;

}



.brand{

color:#888;

font-size:11px;

letter-spacing:4px;

}



.hero h1{

font-size:45px;

margin:10px 0;

color:#ff1744;

text-shadow:
0 0 20px #ff1744;

}



.hero h3{

letter-spacing:3px;

}



.team{

color:#00ff88;

font-size:18px;

}



.status{

display:inline-block;

margin-top:15px;

padding:8px 20px;

border-radius:20px;

background:rgba(0,255,136,.1);

color:#00ff88;

border:1px solid #00ff88;

}





.stats{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

margin:30px 0;

}



.stat{

padding:25px;

text-align:center;

background:#100007;

border:1px solid #ff1744;

border-radius:20px;

box-shadow:
0 0 25px rgba(255,0,70,.3);

}



.stat span{

display:block;

color:#888;

font-size:12px;

letter-spacing:2px;

}



.stat strong{

font-size:30px;

color:#00ff88;

}




.section{

margin-top:25px;

padding:25px;

background:#080008;

border:1px solid rgba(255,23,68,.5);

border-radius:20px;

}



.section h2{

color:#ff1744;

letter-spacing:2px;

}



.row{

display:flex;

justify-content:space-between;

padding:14px 0;

border-bottom:1px solid #222;

}



.row span{

color:#888;

}



.row strong{

color:#00ff88;

}



.social a{

display:inline-block;

margin:5px;

padding:10px 20px;

border-radius:20px;

border:1px solid #ff1744;

color:#ff1744;

text-decoration:none;

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

.hero{

flex-direction:column;

text-align:center;

}



.stats{

grid-template-columns:1fr;

}



.row{

flex-direction:column;

gap:8px;

}

}


`}</style>


</main>

)

}





function Section({title,children}){

return(

<section className="section">

<h2>{title}</h2>

{children}

</section>

)

}




function Row({label,value}){

return(

<div className="row">

<span>
{label}
</span>


<strong>
{value || "N/A"}
</strong>


</div>

)

}




function Stat({title,value}){

return(

<div className="stat">

<span>
{title}
</span>


<strong>
{value}
</strong>


</div>

)

}
