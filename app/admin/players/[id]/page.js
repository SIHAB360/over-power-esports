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


if(!error){

setPlayer(data);

}

setLoading(false);

};




if(loading){

return <div className="loading">LOADING PLAYER...</div>;

}



if(!player){

return <div className="loading">PLAYER NOT FOUND</div>;

}




return(

<main className="page">


<div className="profile-card">



<header className="profile-header">


<img

src={player.profile_image || player.avatar_url || "/default.png"}

className="player-image"

/>



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


</header>





<div className="stats">


<div>
<span>MATCHES</span>
<strong>{player.matches_played || 0}</strong>
</div>


<div>
<span>WINS</span>
<strong>{player.wins || 0}</strong>
</div>


<div>
<span>STATUS</span>

<strong className={player.status}>
{player.status}
</strong>

</div>


</div>






<Section title="PLAYER INFORMATION">

<Row label="NAME" value={player.full_name}/>
<Row label="FREE FIRE UID" value={player.freefire_uid}/>
<Row label="EMAIL" value={player.email}/>
<Row label="PHONE" value={player.phone}/>
<Row label="COUNTRY" value={player.country}/>
<Row label="AGE" value={player.age}/>
<Row label="EXPERIENCE" value={player.experience}/>

</Section>







<Section title="GAME DETAILS">

<Row label="PRIMARY ROLE" value={player.primary_role}/>
<Row label="SECONDARY ROLE" value={player.secondary_role}/>
<Row label="DEVICE" value={player.device}/>
<Row label="INTERNET" value={player.internet_connection}/>
<Row label="PRACTICE TIME" value={player.practice_time}/>
<Row label="GAME EXPERIENCE" value={player.game_experience}/>
<Row label="TOURNAMENT EXPERIENCE" value={player.tournament_experience}/>
<Row label="BR KD" value={player.average_br_kd_rate}/>
<Row label="EXPERT WEAPON" value={player.expert_weapon}/>

</Section>







<Section title="TEAM HISTORY">

<Row label="PREVIOUS TEAM" value={player.previous_team}/>
<Row label="JOINING DATE" value={player.joining_date}/>

</Section>







<section className="section">

<h2>SOCIAL LINKS</h2>


<div className="links">

{player.facebook_link &&
<a href={player.facebook_link}>Facebook</a>
}


{player.instagram_link &&
<a href={player.instagram_link}>Instagram</a>
}


{player.youtube_link &&
<a href={player.youtube_link}>Youtube</a>
}


{player.tiktok_link &&
<a href={player.tiktok_link}>TikTok</a>
}


</div>


</section>





</div>





<style jsx>{`

.page{

min-height:100vh;

background:#050505;

padding:50px 20px;

color:white;

}



.profile-card{

max-width:900px;

margin:auto;

background:
linear-gradient(
145deg,
rgba(255,0,60,.15),
#050505
);

border:1px solid #ff1744;

border-radius:30px;

padding:40px;

box-shadow:
0 0 50px rgba(255,0,70,.35);

}



.profile-header{

display:flex;

align-items:center;

gap:30px;

}



.player-image{

width:140px;

height:140px;

object-fit:cover;

border-radius:20px;

border:2px solid #ff1744;

box-shadow:0 0 25px #ff1744;

}



h1{

font-size:40px;

color:#ff1744;

margin:0;

}



h3{

color:white;

}



.profile-header p{

color:#00ff88;

}




.stats{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

margin:40px 0;

}



.stats div{

border:1px solid #333;

padding:20px;

border-radius:15px;

text-align:center;

}



.stats span{

display:block;

color:#888;

font-size:12px;

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



.section h2{

color:#ff1744;

font-size:22px;

}



.row{

display:flex;

justify-content:space-between;

padding:10px 0;

border-bottom:1px solid #222;

}



.label{

color:#888;

}



.value{

color:#00ff88;

text-align:right;

}



.links a{

color:#ff1744;

margin-right:20px;

}



.loading{

height:100vh;

display:flex;

justify-content:center;

align-items:center;

background:#050505;

color:#ff1744;

font-size:30px;

}



@media(max-width:700px){

.profile-header{

flex-direction:column;

text-align:center;

}


.stats{

grid-template-columns:1fr;

}


.row{

flex-direction:column;

gap:5px;

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

<span className="label">
{label}
</span>


<span className="value">
{value || "N/A"}
</span>


</div>

)

}
