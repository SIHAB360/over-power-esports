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


<p className="small-title">
ADMIN CONTROL CENTER
</p>



<h1>
OVER POWER
</h1>



<h2>
ADMIN PANEL
</h2>



<p className="subtitle">
ESPORTS MANAGEMENT SYSTEM
</p>


</div>





<div className="profile-box">


<span>
{adminEmail}
</span>


<button className="logout-btn" onClick={logout}>
LOGOUT
</button>


</div>



</header>






<section className="dashboard-grid">


<Card
title="PLAYERS"
text="Manage player accounts"
/>


<Card
title="MATCHES"
text="Create & control matches"
/>


<Card
title="TOURNAMENTS"
text="Tournament management"
/>


<Card
title="PROFIT"
text="Income calculation"
/>


<Card
title="SALARY"
text="Player salary control"
/>


<Card
title="VERIFICATION"
text="Generate access codes"
/>



</section>
<style jsx>{`

.admin-page{

min-height:100vh;

padding:60px 50px;

background:

radial-gradient(
circle at top left,
rgba(255,0,60,.25),
transparent 35%
),

radial-gradient(
circle at bottom right,
rgba(255,0,60,.18),
transparent 40%
),

linear-gradient(
135deg,
#050505,
#160005
);

color:white;

position:relative;

overflow:hidden;

}



.admin-page::before{

content:"";

position:absolute;

width:500px;

height:500px;

background:#ff1744;

filter:blur(180px);

top:-250px;

left:-200px;

opacity:.18;

}



.admin-page::after{

content:"";

position:absolute;

width:450px;

height:450px;

background:#ff1744;

filter:blur(200px);

bottom:-200px;

right:-150px;

opacity:.12;

}



.dashboard-wrapper{

max-width:1300px;

margin:auto;

position:relative;

z-index:2;

}



header{

display:flex;

justify-content:center;

align-items:center;

position:relative;

margin-bottom:90px;

}



.brand{

text-align:center;

}



.small-title{

font-size:12px;

letter-spacing:10px;

color:#ff1744;

margin-bottom:18px;

}



.brand h1{

font-size:64px;

letter-spacing:14px;

margin:0;

font-weight:900;

text-shadow:

0 0 30px rgba(255,255,255,.35);

}



.brand h2{

font-size:44px;

letter-spacing:12px;

margin:10px 0;

color:#ff1744;

text-shadow:

0 0 35px #ff1744;

}



.subtitle{

font-size:13px;

letter-spacing:9px;

color:#888;

}



.profile-box{

position:absolute;

right:0;

top:20px;

padding:22px 28px;

border-radius:28px;


background:

linear-gradient(
145deg,
rgba(255,255,255,.08),
rgba(0,0,0,.65)
);


border:

1px solid rgba(255,32,68,.45);


backdrop-filter:blur(25px);


box-shadow:

0 0 40px rgba(255,23,68,.25),

inset 0 0 30px rgba(255,255,255,.03);


display:flex;

flex-direction:column;

align-items:center;

gap:16px;


}



.profile-box span{

font-size:12px;

color:#aaa;

}



.logout-btn{

height:45px;

padding:0 38px;

border-radius:25px;

border:none;


background:

linear-gradient(
135deg,
#ff1744,
#990022
);


color:white;

font-weight:900;

letter-spacing:2px;

cursor:pointer;


box-shadow:

0 0 30px rgba(255,23,68,.5);


transition:.3s;

}



.logout-btn:hover{

transform:scale(1.05);

box-shadow:

0 0 50px #ff1744;

}




.dashboard-grid{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:35px;

}



.card{

height:260px;

padding:35px;

border-radius:30px;


background:

linear-gradient(
145deg,
rgba(255,255,255,.10),
rgba(0,0,0,.75)
);


border:

1px solid rgba(255,23,68,.45);


backdrop-filter:blur(20px);


display:flex;

flex-direction:column;

justify-content:center;


position:relative;

overflow:hidden;


box-shadow:


0 25px 70px rgba(0,0,0,.7),


inset 0 0 40px rgba(255,23,68,.08);


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

0 0 25px #ff1744;

}



.card:hover{

transform:translateY(-12px);

border-color:#ff1744;


box-shadow:

0 0 60px rgba(255,23,68,.45);

}




.card h3{

font-size:30px;

letter-spacing:4px;

margin:0;

color:white;


text-shadow:

0 0 15px rgba(255,255,255,.35);


}



.card p{

margin-top:15px;

color:#aaa;

font-size:15px;

}




.card button{

margin-top:35px;

width:100%;

height:45px;

border-radius:25px;


background:

rgba(255,23,68,.10);


border:

1px solid #ff1744;


color:white;

font-weight:800;

cursor:pointer;


transition:.3s;


}



.card button:hover{

background:#ff1744;


box-shadow:

0 0 35px #ff1744;

}




.loading{

height:100vh;

display:flex;

justify-content:center;

align-items:center;

background:#050505;

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

.profile-box{

position:static;

margin-top:30px;

}



header{

flex-direction:column;

}



.dashboard-grid{

grid-template-columns:1fr;

}



.brand h1{

font-size:38px;

}



.brand h2{

font-size:28px;

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
