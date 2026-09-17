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
fetchPlayer();
}

},[id]);



const fetchPlayer=async()=>{

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

<div className="loader"></div>

LOADING PLAYER PROFILE...

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


<div className="profile-container">



<section className="hero">


<div className="player-image">


<img

src={
player.profile_image ||
player.avatar_url ||
"/default.png"
}

alt="player"

/>


</div>





<div className="hero-info">


<p className="brand">

OVER POWER ESPORTS

</p>



<h1>

{player.ign || player.full_name}

</h1>




<div className="details">

<span>

{player.primary_role || "PLAYER"}

</span>


<span>

•

</span>


<span className="team">

{player.team_name || "NO TEAM"}

</span>


</div>



<div className={
player.status==="approved"
?
"status approved"
:
"status pending"
}>

{player.status || "pending"}

</div>



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






<InfoCard title="PLAYER INFORMATION">


<Row title="FULL NAME" value={player.full_name}/>

<Row title="IGN" value={player.ign}/>

<Row title="FREE FIRE UID" value={player.freefire_uid}/>

<Row title="EMAIL" value={player.email}/>

<Row title="PHONE" value={player.phone}/>

<Row title="COUNTRY" value={player.country}/>

<Row title="AGE" value={player.age}/>

<Row title="BIRTH DATE" value={player.birth_date}/>

<Row title="ADDRESS" value={player.full_address}/>


</InfoCard>






<InfoCard title="GAME DETAILS">


<Row title="PRIMARY ROLE" value={player.primary_role}/>

<Row title="SECONDARY ROLE" value={player.secondary_role}/>

<Row title="DEVICE" value={player.device}/>

<Row title="INTERNET" value={player.internet_connection}/>

<Row title="PRACTICE TIME" value={player.practice_time}/>

<Row title="GAME EXPERIENCE" value={player.game_experience}/>

<Row title="TOURNAMENT EXPERIENCE" value={player.tournament_experience}/>

<Row title="BR K/D RATE" value={player.average_br_kd_rate}/>

<Row title="EXPERT WEAPON" value={player.expert_weapon}/>


</InfoCard>
// CONTINUE FROM PREVIOUS CODE


<InfoCard title="TEAM INFORMATION">


<Row title="TEAM NAME" value={player.team_name}/>

<Row title="PREVIOUS TEAM" value={player.previous_team}/>

<Row title="JOINING DATE" value={player.joining_date}/>


</InfoCard>





<InfoCard title="SOCIAL LINKS">


<div className="socials">


{player.facebook_link &&
<a href={player.facebook_link} target="_blank">
FACEBOOK
</a>
}


{player.instagram_link &&
<a href={player.instagram_link} target="_blank">
INSTAGRAM
</a>
}


{player.youtube_link &&
<a href={player.youtube_link} target="_blank">
YOUTUBE
</a>
}


{player.tiktok_link &&
<a href={player.tiktok_link} target="_blank">
TIKTOK
</a>
}



</div>


</InfoCard>





</div>





<style jsx>{`

.page{

min-height:100vh;

background:
radial-gradient(circle at top,#35000f,#050505 65%);

color:white;

padding:50px 20px;

}



.profile-container{

max-width:950px;

margin:auto;

}



.hero{

display:flex;

align-items:center;

gap:40px;

padding:35px;

border-radius:28px;

background:

linear-gradient(
145deg,
rgba(255,0,60,.18),
rgba(5,5,5,.95)
);

border:1px solid rgba(255,23,68,.7);

box-shadow:

0 0 50px rgba(255,0,70,.35);

}



.player-image img{

width:170px;

height:170px;

object-fit:cover;

border-radius:25px;

border:2px solid #ff1744;

box-shadow:

0 0 35px #ff1744;

}



.brand{

color:#888;

font-size:11px;

letter-spacing:4px;

}



.hero h1{

font-size:48px;

margin:10px 0;

color:#ff1744;

text-shadow:

0 0 25px #ff1744;

}



.details{

display:flex;

gap:12px;

align-items:center;

}



.team{

color:#00ff88;

}



.status{

margin-top:20px;

display:inline-block;

padding:8px 22px;

border-radius:30px;

text-transform:uppercase;

font-weight:bold;

}



.approved{

color:#00ff88;

border:1px solid #00ff88;

background:rgba(0,255,136,.1);

}



.pending{

color:#ffc400;

border:1px solid #ffc400;

background:rgba(255,196,0,.1);

}





.stats{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

margin:30px 0;

}



.stat{

padding:25px;

background:#100007;

border:1px solid rgba(255,23,68,.5);

border-radius:22px;

text-align:center;

box-shadow:

0 0 25px rgba(255,0,70,.2);

}



.stat span{

display:block;

color:#888;

font-size:12px;

letter-spacing:2px;

}



.stat strong{

font-size:32px;

color:#00ff88;

}





.card{

margin-top:25px;

background:

rgba(10,10,10,.9);

border:1px solid rgba(255,23,68,.45);

border-radius:22px;

overflow:hidden;

}



.card h2{

margin:0;

padding:20px;

color:#ff1744;

letter-spacing:3px;

font-size:20px;

background:

rgba(255,0,60,.08);

}



.rows{

padding:10px 25px;

}



.row{

display:flex;

justify-content:space-between;

padding:15px 0;

border-bottom:1px solid rgba(255,255,255,.08);

}



.row:last-child{

border:none;

}



.row span{

color:#888;

}



.row strong{

color:#00ff88;

text-align:right;

}





.socials{

padding:20px;

display:flex;

gap:15px;

flex-wrap:wrap;

}



.socials a{

padding:12px 25px;

border-radius:30px;

border:1px solid #ff1744;

color:#ff1744;

text-decoration:none;

transition:.3s;

}



.socials a:hover{

background:#ff1744;

color:white;

box-shadow:0 0 25px #ff1744;

}





.loading{

height:100vh;

background:#050505;

color:#ff1744;

display:flex;

align-items:center;

justify-content:center;

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



.row strong{

text-align:left;

}


}



`}</style>


</main>

)

}





function InfoCard({title,children}){

return(

<section className="card">

<h2>{title}</h2>

<div className="rows">

{children}

</div>

</section>

)

}





function Row({title,value}){

if(!value) return null;


return(

<div className="row">

<span>{title}</span>

<strong>{value}</strong>

</div>

)

}





function Stat({title,value}){

return(

<div className="stat">

<span>{title}</span>

<strong>{value}</strong>

</div>

)

}
