"use client";

import { supabase } from "../../../lib/supabase";
import { useEffect,useState } from "react";
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





if(loading)

return <div className="loading">
LOADING...
</div>;



if(!player)

return <div className="loading">
PLAYER NOT FOUND
</div>;





return(

<main className="page">


<div className="container">



<section className="hero">


<div className="image">

<img
src={
player.profile_image ||
player.avatar_url ||
"/default.png"
}
/>

</div>



<div className="title">

<h1>
{player.ign || player.full_name}
</h1>


<h3>
{player.primary_role || player.position}
</h3>


<p>
TEAM : {player.team_name}
</p>


</div>


</section>





<div className="stats">


<Card title="MATCHES" value={player.matches_played || 0}/>

<Card title="WINS" value={player.wins || 0}/>


<Card 
title="STATUS" 
value={player.status}
/>


</div>








<Section title="PLAYER INFORMATION">


<Row title="FULL NAME" value={player.full_name}/>

<Row title="FREE FIRE UID" value={player.freefire_uid}/>

<Row title="EMAIL" value={player.email}/>

<Row title="PHONE" value={player.phone}/>

<Row title="COUNTRY" value={player.country}/>

<Row title="AGE" value={player.age}/>


</Section>







<Section title="GAME DETAILS">


<Row title="PRIMARY ROLE" value={player.primary_role}/>

<Row title="SECONDARY ROLE" value={player.secondary_role}/>

<Row title="DEVICE" value={player.device}/>

<Row title="INTERNET" value={player.internet_connection}/>

<Row title="PRACTICE TIME" value={player.practice_time}/>

<Row title="GAME EXPERIENCE" value={player.game_experience}/>

<Row title="TOURNAMENT EXPERIENCE" value={player.tournament_experience}/>

<Row title="BR KD RATE" value={player.average_br_kd_rate}/>

<Row title="EXPERT WEAPON" value={player.expert_weapon}/>


</Section>








<Section title="TEAM HISTORY">


<Row title="PREVIOUS TEAM" value={player.previous_team}/>

<Row title="JOINING DATE" value={player.joining_date}/>


</Section>






<section className="section">


<h2>
SOCIAL LINKS
</h2>


<div className="social">


{player.facebook_link &&
<a href={player.facebook_link}>
FACEBOOK
</a>
}



{player.instagram_link &&
<a href={player.instagram_link}>
INSTAGRAM
</a>
}



{player.youtube_link &&
<a href={player.youtube_link}>
YOUTUBE
</a>
}



{player.tiktok_link &&
<a href={player.tiktok_link}>
TIKTOK
</a>
}



</div>


</section>






</div>





<style jsx>{`

.page{

min-height:100vh;

background:
radial-gradient(circle,#35000d,#050505 70%);

padding:40px 20px;

color:white;

}



.container{

max-width:900px;

margin:auto;

}





.hero{

display:flex;

align-items:center;

gap:40px;

padding:30px;

border:1px solid #ff1744;

border-radius:25px;

background:rgba(255,0,60,.08);

box-shadow:0 0 40px rgba(255,0,70,.4);

}




.image img{

width:180px;

height:180px;

object-fit:cover;

border-radius:20px;

border:2px solid #ff1744;

box-shadow:0 0 30px #ff1744;

}





.title h1{

font-size:45px;

color:#ff1744;

margin:0;

}



.title h3{

color:white;

}



.title p{

color:#00ff88;

}





.stats{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

margin:30px 0;

}



.stat{

background:#120007;

border:1px solid #333;

padding:25px;

border-radius:20px;

text-align:center;

}



.stat span{

color:#888;

display:block;

}



.stat strong{

font-size:28px;

color:#ff1744;

}





.section{

margin-top:25px;

padding:25px;

background:#0b0005;

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

padding:12px 0;

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

padding:10px 20px;

margin:5px;

border:1px solid #ff1744;

border-radius:20px;

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





function Row({title,value}){

return(

<div className="row">

<span>
{title}
</span>


<strong>
{value || "N/A"}
</strong>


</div>

)

}




function Card({title,value}){

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
