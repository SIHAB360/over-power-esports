"use client";

import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PlayerProfilePage(){

const params = useParams();
const id = params.id;

const [player,setPlayer] = useState(null);
const [loading,setLoading] = useState(true);



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


console.log(data);
console.log(error);


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


<div className="avatar">

{player.full_name?.charAt(0) || "P"}

</div>


<div>

<h1>
{player.full_name || "Unknown Player"}
</h1>


<p>
IGN : {player.ign || "N/A"}
</p>


<p>
FREE FIRE UID : {player.freefire_uid || "N/A"}
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







<div className="grid">



<div className="card">

<h2>
PERSONAL INFORMATION
</h2>

<p>Name : {player.full_name}</p>

<p>Email : {player.email}</p>

<p>Phone : {player.phone}</p>

<p>Country : {player.country}</p>

<p>Age : {player.age}</p>

<p>Birth Date : {player.birth_date}</p>

<p>Address : {player.full_address}</p>


</div>





<div className="card">

<h2>
GAMING INFORMATION
</h2>


<p>Team : {player.team_name}</p>

<p>Primary Role : {player.primary_role}</p>

<p>Secondary Role : {player.secondary_role}</p>

<p>Experience : {player.game_experience}</p>

<p>Tournament : {player.tournament_experience}</p>

<p>K/D Rate : {player.average_br_kd_rate}</p>

<p>Weapon : {player.expert_weapon}</p>

<p>Previous Team : {player.previous_team}</p>


</div>







<div className="card">

<h2>
DEVICE INFORMATION
</h2>


<p>Device : {player.device}</p>

<p>Internet : {player.internet_connection}</p>

<p>Practice Time : {player.practice_time}</p>


</div>







<div className="card">

<h2>
PERFORMANCE
</h2>


<p>Matches : {player.matches_played}</p>

<p>Wins : {player.wins}</p>

<p>Total Kills : {player.total_kills}</p>


</div>







<div className="card">

<h2>
SOCIAL LINKS
</h2>


<p>Facebook : {player.facebook_link}</p>

<p>Instagram : {player.instagram_link}</p>

<p>Tiktok : {player.tiktok_link}</p>

<p>Youtube : {player.youtube_link}</p>


</div>




</div>








<div className="admin">


<h2>
ADMIN CONTROL
</h2>



<div className="buttons">


<button onClick={()=>updateStatus("approved")}>
APPROVE
</button>


<button onClick={()=>updateStatus("rejected")}>
REJECT
</button>


<button onClick={verifyPlayer}>
VERIFY PLAYER
</button>


<button onClick={()=>updateStatus("suspended")}>
SUSPEND
</button>


</div>



<h3>
CURRENT STATUS:
<span>
{player.status}
</span>
</h3>


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
gap:30px;
align-items:center;

padding:30px;

background:
linear-gradient(
145deg,
rgba(255,20,60,.2),
black
);

border:1px solid #ff1744;

border-radius:25px;

}



.avatar{

width:100px;
height:100px;

border-radius:50%;

display:flex;
align-items:center;
justify-content:center;

font-size:45px;
font-weight:bold;

background:#ff1744;

box-shadow:
0 0 30px #ff1744;

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




.grid{

display:grid;

grid-template-columns:repeat(2,1fr);

gap:25px;

margin-top:40px;

}




.card{

background:

linear-gradient(
145deg,
rgba(255,20,60,.15),
black
);


border:1px solid rgba(255,20,60,.5);

border-radius:20px;

padding:25px;

}



.card h2{

color:#ff1744;

}




.admin{

margin-top:40px;

padding:30px;

border:1px solid #ff1744;

border-radius:20px;

}



.buttons{

display:flex;

gap:15px;

flex-wrap:wrap;

}



button{

padding:14px 25px;

border:none;

border-radius:10px;

background:#ff1744;

color:white;

font-weight:bold;

cursor:pointer;

}



.admin span{

color:#00ff88;

margin-left:10px;

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

.grid{

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

}
