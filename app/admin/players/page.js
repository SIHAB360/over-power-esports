"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";


export default function PlayersPage(){

const [players,setPlayers]=useState([]);
const [loading,setLoading]=useState(true);



useEffect(()=>{

fetchPlayers();

},[]);



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




const fetchPlayers = async()=>{


const {data,error}=await supabase
.from("players")
.select("*")
.order("created_at",{ascending:false});



console.log("PLAYERS DATA:",data);
console.log("PLAYERS ERROR:",error);



if(!error){

setPlayers(data || []);

}


setLoading(false);


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

{player.email}

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

margin-top:50px;

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
min-height:420px;

box-shadow:
0 0 25px rgba(255,0,70,.25);

transition:.3s;

overflow:hidden;

}


.player-card:hover{

transform:translateY(-10px);

box-shadow:
0 0 40px rgba(255,0,70,.7);

}




.player-card:hover{


transform:translateY(-8px);


box-shadow:

0 0 35px rgba(255,0,70,.5);


}





.player-header{


display:flex;

align-items:center;

gap:15px;

margin-bottom:25px;


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


box-shadow:

0 0 20px #ff1744;


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

color:white;

word-break:break-word;

}



.info p span,


.status-box span{


font-size:11px;

letter-spacing:2px;

color:#888;


}





.status-box{

margin-top:25px;

padding-top:15px;

border-top:1px solid rgba(255,255,255,.15);

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




.approve-btn{


margin-top:25px;


width:100%;


padding:14px;


border:none;


border-radius:12px;


background:

linear-gradient(
135deg,
#ff1744,
#ff0055
);



color:white;


font-weight:bold;


cursor:pointer;



box-shadow:

0 0 20px rgba(255,0,70,.6);



transition:.3s;


}




.approve-btn:hover{


transform:scale(1.05);


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

justify-content:center;

}


}



`}</style>


</main>

);

}
