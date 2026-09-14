"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";


export default function AdminDashboard(){

const [loading,setLoading]=useState(true);
const [adminEmail,setAdminEmail]=useState("");



useEffect(()=>{

checkAdmin();

},[]);



const checkAdmin = async()=>{

const {data:{user}} = await supabase.auth.getUser();


if(!user){

window.location.href="/login";
return;

}


const {data:profile,error} = await supabase

.from("profiles")

.select("role,email")

.eq("id",user.id)

.single();



if(error || profile?.role?.toLowerCase() !== "admin"){

window.location.href="/login";
return;

}


setAdminEmail(profile.email);

setLoading(false);


};





const logout = async()=>{

await supabase.auth.signOut();

window.location.href="/login";

};





if(loading){

return(

<main className="loading">

<div className="loader"></div>

</main>

);

}





return(

<main className="admin-page">


<div className="dashboard-wrapper">


<header>


<div className="brand">

<h1>
OVER POWER
</h1>


<h2>
ADMIN PANEL
</h2>


<p>
ESPORTS COMMAND CENTER
</p>


</div>



<div className="profile-box">

<span>
{adminEmail}
</span>


<button onClick={logout}>
LOGOUT
</button>


</div>



</header>





<section className="dashboard-grid">


<Card title="PLAYERS" text="Manage player accounts"/>

<Card title="MATCHES" text="Create & control matches"/>

<Card title="TOURNAMENTS" text="Tournament management"/>

<Card title="PROFIT" text="Income calculation"/>

<Card title="SALARY" text="Player salary control"/>

<Card title="VERIFICATION" text="Generate access codes"/>


</section>



</div>






<style jsx>{`

.admin-page{

min-height:100vh;

padding:50px;


background:

radial-gradient(circle at top,#ff003344,transparent 35%),

radial-gradient(circle at bottom right,#ff003322,transparent 35%),


linear-gradient(
180deg,
#050505,
#160005
);


color:white;

}




.dashboard-wrapper{

max-width:1400px;

margin:auto;

}





header{

display:flex;

justify-content:center;

align-items:center;

position:relative;

margin-bottom:70px;

}





.brand{

text-align:center;

}



.brand h1{

font-size:60px;

letter-spacing:10px;

margin:0;

font-weight:900;


text-shadow:

0 0 25px rgba(255,255,255,.25);


}



.brand h2{

font-size:42px;

margin:8px 0;


color:#ff1744;


letter-spacing:10px;


text-shadow:

0 0 25px #ff1744;


}




.brand p{

font-size:13px;

letter-spacing:8px;

color:#888;


}





.profile-box{


position:absolute;

right:20px;

top:20px;



padding:20px 25px;


border-radius:25px;



background:

linear-gradient(

145deg,

rgba(255,0,60,.15),

rgba(0,0,0,.75)

);



border:

1px solid rgba(255,30,70,.7);



backdrop-filter:blur(20px);



box-shadow:


0 0 35px rgba(255,0,60,.25);



display:flex;

flex-direction:column;

align-items:center;

gap:15px;


}





.profile-box span{

font-size:12px;

color:#aaa;

}





button{


height:45px;


padding:0 35px;


border-radius:12px;


background:

linear-gradient(

135deg,

#ff1744,

#990022

);



border:none;


color:white;


font-weight:900;


letter-spacing:2px;


cursor:pointer;


box-shadow:

0 0 25px rgba(255,0,60,.5);


}






.dashboard-grid{


display:grid;


grid-template-columns:repeat(3,1fr);


gap:30px;


}





.card{


height:250px;


padding:35px;


border-radius:25px;



background:

linear-gradient(

145deg,

rgba(255,0,60,.15),

rgba(5,5,5,.85)

);



border:

1px solid rgba(255,30,70,.65);



display:flex;


flex-direction:column;


justify-content:center;



box-shadow:


0 20px 60px rgba(0,0,0,.8),


inset 0 0 40px rgba(255,0,60,.08);



position:relative;

overflow:hidden;



transition:.4s;


}





.card::before{


content:"";


position:absolute;


top:0;


left:25%;


width:50%;


height:2px;


background:#ff1744;


box-shadow:

0 0 20px #ff1744;


}




.card:hover{


transform:translateY(-10px);



box-shadow:


0 0 60px rgba(255,0,60,.6);



}




.card h3{


font-size:28px;


letter-spacing:3px;


margin:0;


color:white;


text-shadow:

0 0 15px rgba(255,255,255,.3);


}




.card p{


margin-top:18px;


color:#aaa;


font-size:15px;


}





.card button{


margin-top:35px;


width:100%;


background:

rgba(255,0,60,.08);



border:

1px solid #ff1744;


border-radius:12px;


}



.card button:hover{


background:#ff1744;


box-shadow:

0 0 30px #ff1744;


}





.loading{


height:100vh;


background:#050505;


display:flex;


justify-content:center;


align-items:center;


}





.loader{


width:70px;


height:70px;


border-radius:50%;


border:6px solid #222;


border-top-color:#ff1744;


animation:spin 1s linear infinite;


}




@keyframes spin{


to{

transform:rotate(360deg);

}

}





@media(max-width:900px){


header{

flex-direction:column;

}



.profile-box{

position:static;

margin-top:30px;

}



.dashboard-grid{

grid-template-columns:1fr;

}



}



`}</style>
</main>

);

}




function Card({title,text}){

return(

<div className="card">


<h3>
{title}
</h3>


<p>
{text}
</p>


<button>
OPEN
</button>


</div>

);

}
