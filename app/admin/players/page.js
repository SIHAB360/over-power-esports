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





const fetchPlayer = async()=>{


const {data,error}=await supabase
.from("players")
.select("*")
.eq("id",id)
.single();



console.log("PLAYER DATA:",data);
console.log("PLAYER ERROR:",error);



if(!error){

setPlayer(data);

}


setLoading(false);


};





const updateStatus = async(status)=>{


const {error}=await supabase
.from("players")
.update({
status:status
})
.eq("id",id);



if(error){

console.log(error);
return;

}


fetchPlayer();


};





const verifyPlayer = async()=>{


const {error}=await supabase
.from("players")
.update({
verified:true
})
.eq("id",id);



if(error){

console.log(error);
return;

}


fetchPlayer();


};






if(loading){

return(

<div className="loading">
LOADING PROFILE...
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

<main className="profile-page">


<div className="container">


<div className="profile-header">


<img

src={
player.profile_image ||
player.avatar_url ||
"/default-avatar.png"
}

className="profile-image"

/>



<div>

<h1>
{player.full_name || "Unknown Player"}
</h1>


<p>
IGN : {player.ign || "N/A"}
</p>


<p>
UID : {player.freefire_uid || "N/A"}
</p>



<div className="badge">

{
player.verified
?
"VERIFIED PLAYER"
:
"UNVERIFIED"
}

</div>


</div>


</div>





<div className="sections">



<div className="card">


<h2>
PERSONAL INFORMATION
</h2>


<p>Name: {player.full_name}</p>

<p>Email: {player.email}</p>

<p>Phone: {player.phone}</p>

<p>Country: {player.country}</p>

<p>Age: {player.age}</p>

<p>Birth Date: {player.birth_date}</p>

<p>Address: {player.full_address}</p>


</div>






<div className="card">


<h2>
GAMING INFORMATION
</h2>


<p>Team: {player.team_name}</p>

<p>Primary Role: {player.primary_role}</p>

<p>Secondary Role: {player.secondary_role}</p>

<p>Game Experience: {player.game_experience}</p>

<p>Tournament Experience: {player.tournament_experience}</p>

<p>BR/KD Rate: {player.average_br_kd_rate}</p>

<p>Expert Weapon: {player.expert_weapon}</p>

<p>Previous Team: {player.previous_team}</p>


</div>






<div className="card">


<h2>
DEVICE & CONNECTION
</h2>


<p>Device: {player.device}</p>

<p>Internet: {player.internet_connection}</p>

<p>Practice Time: {player.practice_time}</p>


</div>







<div className="card">


<h2>
PERFORMANCE
</h2>


<p>Matches: {player.matches_played}</p>

<p>Wins: {player.wins}</p>

<p>Total Kills: {player.total_kills}</p>


</div>






<div className="card">


<h2>
SOCIAL LINKS
</h2>


<p>
Facebook: {player.facebook_link}
</p>


<p>
Instagram: {player.instagram_link}
</p>


<p>
TikTok: {player.tiktok_link}
</p>


<p>
Youtube: {player.youtube_link}
</p>


</div>



</div>






<div className="admin-panel">


<h2>
ADMIN CONTROL
</h2>



<div className="buttons">


<button
onClick={()=>updateStatus("approved")}
>
APPROVE
</button>



<button
onClick={()=>updateStatus("rejected")}
>
REJECT
</button>




<button
onClick={verifyPlayer}
>
VERIFY PLAYER
</button>



<button
onClick={()=>updateStatus("suspended")}
>
SUSPEND
</button>


</div>



<p>
CURRENT STATUS:
<span>
{player.status}
</span>
</p>


</div>





</div>





<style jsx>{`

.profile-page{

min-height:100vh;

background:#050505;

color:white;

padding:50px;

}



.container{

max-width:1200px;

margin:auto;

}



.profile-header{

display:flex;

align-items:center;

gap:30px;

padding:30px;

background:
linear-gradient(
145deg,
rgba(255,0,70,.2),
rgba(0,0,0,.9)
);

border:1px solid rgba(255,0,70,.5);

border-radius:25px;

}



.profile-image{

width:150px;

height:150px;

border-radius:50%;

object-fit:cover;

border:3px solid #ff1744;

}



h1{

color:#ff1744;

font-size:40px;

}



.badge{

margin-top:15px;

color:#00ff88;

font-weight:bold;

}



.sections{

display:grid;

grid-template-columns:repeat(2,1fr);

gap:25px;

margin-top:40px;

}



.card{

padding:25px;

border-radius:20px;

background:

linear-gradient(
145deg,
rgba(255,20,60,.15),
rgba(0,0,0,.9)
);

border:1px solid rgba(255,20,70,.4);

}



.card h2{

color:#ff1744;

font-size:20px;

}



.admin-panel{

margin-top:40px;

padding:30px;

border-radius:20px;

border:1px solid #ff1744;

}



.buttons{

display:flex;

gap:15px;

flex-wrap:wrap;

}



.buttons button{

padding:14px 25px;

border:none;

border-radius:12px;

background:#ff1744;

color:white;

font-weight:bold;

cursor:pointer;

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

.sections{

grid-template-columns:1fr;

}


.profile-header{

flex-direction:column;

text-align:center;

}


}


`}</style>


</main>

);

}setLoading(false);

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



{
players.length===0 ? (

<div className="empty">
NO PLAYERS FOUND
</div>

)

:

(


<div className="players-grid">


{
players.map((player)=>(


<div className="player-card" key={player.id}>


<div className="player-header">


<div className="avatar">

{player.full_name?.charAt(0) || "P"}

</div>



<div>

<h2>
{player.full_name || "Unnamed Player"}
</h2>


<span>
PLAYER ID #{player.id.slice(0,6)}
</span>


</div>


</div>





<div className="info">


<p>
<span>
EMAIL
</span>

{player.email || "No Email"}

</p>



<p>
<span>
TEAM
</span>

{player.team_name || "No Team"}

</p>




<p>
<span>
POSITION
</span>

{player.primary_role || "Not Assigned"}

</p>




<div className="status-box">

<span>
STATUS
</span>


<strong className={
player.status?.toLowerCase()==="approved"
?
"approved"
:
"pending"
}>

{player.status || "Pending"}

</strong>


</div>


</div>





<div className="action-buttons">


<button

className="view-btn"

onClick={()=>window.location.href=`/admin/players/${player.id}`}

>

VIEW PROFILE

</button>





{
player.status?.toLowerCase() !== "approved" && (

<button

className="approve-btn"

onClick={()=>approvePlayer(player.id)}

>

APPROVE PLAYER

</button>

)

}



</div>



</div>


))

}


</div>

)

}



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
letter-spacing:8px;
font-size:42px;
margin-bottom:50px;

text-shadow:
0 0 20px rgba(255,0,70,.8);

}





.players-grid{

display:grid;

grid-template-columns:repeat(3,300px);

gap:40px;

justify-content:center;

}





.player-card{

background:

linear-gradient(
145deg,
rgba(255,20,60,.20),
rgba(0,0,0,.95)
);


border:1px solid rgba(255,20,70,.6);

border-radius:25px;

padding:30px 25px;

width:300px;

min-height:470px;

display:flex;

flex-direction:column;

justify-content:space-between;


box-shadow:

0 0 25px rgba(255,0,70,.25);


transition:.3s;


}



.player-card:hover{

transform:translateY(-10px);

box-shadow:

0 0 40px rgba(255,0,70,.7);

}




.player-header{

display:flex;

align-items:center;

gap:15px;

}



.avatar{

height:55px;

width:55px;

border-radius:50%;

display:flex;

align-items:center;

justify-content:center;

background:#ff1744;

font-size:25px;

font-weight:bold;

box-shadow:0 0 20px #ff1744;

}



.player-header h2{

margin:0;

font-size:20px;

}



.player-header span{

font-size:11px;

color:#999;

}




.info p{

display:flex;

flex-direction:column;

align-items:center;

text-align:center;

margin:22px 0;

}



.info p span,
.status-box span{

font-size:11px;

letter-spacing:2px;

color:#888;

}





.status-box{

border-top:1px solid rgba(255,255,255,.15);

padding-top:15px;

display:flex;

justify-content:space-between;

}



.approved{

color:#00ff88;

text-transform:uppercase;

}



.pending{

color:#ffc400;

text-transform:uppercase;

}




.action-buttons{

display:flex;

flex-direction:column;

gap:12px;

}



.view-btn,
.approve-btn{

width:100%;

padding:14px;

border-radius:12px;

font-weight:bold;

cursor:pointer;

transition:.3s;

}



.view-btn{

background:transparent;

border:1px solid #ff1744;

color:#ff1744;

}



.view-btn:hover{

background:#ff1744;

color:white;

}



.approve-btn{

border:none;

background:

linear-gradient(
135deg,
#ff1744,
#ff0055
);

color:white;

box-shadow:

0 0 20px rgba(255,0,70,.6);

}



.approve-btn:hover,
.view-btn:hover{

transform:scale(1.05);

}



.empty{

text-align:center;

color:#ff1744;

font-size:25px;

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
