"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";


export default function AdminDashboard(){

const [loading,setLoading] = useState(true);
const [adminEmail,setAdminEmail] = useState("");



useEffect(()=>{

checkAdmin();

},[]);



const checkAdmin = async()=>{

const {
data:{
user
}
}= await supabase.auth.getUser();



if(!user){

window.location.href="/login";

return;

}



const {data:profile,error}=await supabase

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

<div className="loading">

<div className="loader"></div>

</div>

);

}



return(

<main className="admin-page">


<div className="dashboard-wrapper">


<header>


<div className="brand">

<span>
ADMIN CONTROL CENTER
</span>


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

<p>
{adminEmail}
</p>


<button onClick={logout}>
LOGOUT
</button>


</div>


</header>




<section className="dashboard-grid">


<Card
number="01"
title="PLAYERS"
text="Manage player accounts"
/>



<Card
number="02"
title="MATCHES"
text="Create & control matches"
/>



<Card
number="03"
title="TOURNAMENTS"
text="Tournament management"
/>



<Card
number="04"
title="PROFIT"
text="Income calculation"
/>



<Card
number="05"
title="SALARY"
text="Player salary control"
/>



<Card
number="06"
title="VERIFICATION"
text="Generate access codes"
/>



</section>



</div>



<style jsx>{`

.admin-page{

min-height:100vh;

padding:70px 50px;

background:

radial-gradient(
circle at 15% 10%,
rgba(255,0,60,.35),
transparent 35%
),

radial-gradient(
circle at 85% 90%,
rgba(255,0,60,.20),
transparent 40%
),

linear-gradient(
180deg,
#050505,
#110003
);

color:white;

position:relative;

overflow:hidden;

}


/* background lighting */

.admin-page::before{

content:"";

position:absolute;

width:600px;

height:600px;

background:#ff1744;

filter:blur(220px);

opacity:.15;

top:-250px;

left:-200px;

}


.admin-page::after{

content:"";

position:absolute;

width:500px;

height:500px;

background:#ff1744;

filter:blur(220px);

opacity:.12;

right:-200px;

bottom:-200px;

}



.dashboard-wrapper{

max-width:1400px;

margin:auto;

position:relative;

z-index:2;

}



/* HEADER */

header{

display:flex;

justify-content:center;

align-items:center;

position:relative;

margin-bottom:100px;

}



.brand{

text-align:center;

}



.top-label{

font-size:12px;

letter-spacing:12px;

color:#ff1744;

text-shadow:

0 0 20px #ff1744;

}



.brand h1{

font-size:72px;

letter-spacing:18px;

margin:20px 0 5px;

font-weight:900;

color:#fff;

text-shadow:

0 0 30px rgba(255,255,255,.4);

}



.brand h2{

font-size:48px;

letter-spacing:15px;

margin:5px 0;

color:#ff1744;

text-shadow:

0 0 45px #ff1744;

}



.brand p{

font-size:13px;

letter-spacing:12px;

color:#aaa;

}



/* PROFILE */


.profile-box{

position:absolute;

right:0;

top:20px;

padding:25px 30px;

border-radius:30px;


background:

linear-gradient(
145deg,
rgba(255,255,255,.12),
rgba(0,0,0,.75)
);


border:

1px solid rgba(255,23,68,.6);


backdrop-filter:blur(25px);


box-shadow:

0 0 50px rgba(255,23,68,.3),

inset 0 0 30px rgba(255,23,68,.1);


display:flex;

flex-direction:column;

align-items:center;

gap:15px;


}



.profile-box span{

font-size:12px;

color:#aaa;

}



/* LOGOUT */


.logout-btn{

height:46px;

padding:0 45px;

border-radius:30px;

border:none;


background:

linear-gradient(
135deg,
#ff1744,
#8b001f
);


color:white;

font-weight:900;

letter-spacing:3px;


cursor:pointer;


box-shadow:

0 0 35px rgba(255,23,68,.6);


transition:.3s;

}


.logout-btn:hover{

transform:scale(1.08);

box-shadow:

0 0 60px #ff1744;

}



/* CARDS */


.dashboard-grid{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:35px;

}



.card{

height:280px;

padding:35px;

border-radius:35px;


background:

linear-gradient(
145deg,
rgba(255,255,255,.12),
rgba(0,0,0,.80)
);


border:

1px solid rgba(255,23,68,.45);


backdrop-filter:blur(25px);


position:relative;

overflow:hidden;


display:flex;

flex-direction:column;

justify-content:center;


box-shadow:

0 30px 80px rgba(0,0,0,.8),

inset 0 0 50px rgba(255,23,68,.08);


transition:.4s;


}



/* neon top line */


.card::before{

content:"";

position:absolute;

top:0;

left:15%;

width:70%;

height:2px;


background:#ff1744;


box-shadow:

0 0 25px #ff1744;

}



/* hover */


.card:hover{

transform:translateY(-15px);


border-color:#ff1744;


box-shadow:

0 0 80px rgba(255,23,68,.55);

}



/* number */


.card-number{

font-size:13px;

letter-spacing:7px;

color:#ff1744;

margin-bottom:20px;


text-shadow:

0 0 15px #ff1744;

}




.card h3{

font-size:32px;

letter-spacing:5px;

margin:0;

color:white;


text-shadow:

0 0 20px rgba(255,255,255,.35);

}



.card p{

margin-top:15px;

font-size:15px;

color:#aaa;

}



/* BUTTON */


.card button{

margin-top:35px;

height:48px;

border-radius:25px;


background:

rgba(255,23,68,.12);


border:

1px solid #ff1744;


color:white;


font-weight:900;

letter-spacing:2px;


cursor:pointer;


transition:.3s;

}



.card button:hover{

background:#ff1744;


box-shadow:

0 0 40px #ff1744;

}



/* LOADING */


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



/* MOBILE */


@media(max-width:900px){


.dashboard-grid{

grid-template-columns:1fr;

}


.profile-box{

position:static;

margin-top:30px;

}


header{

flex-direction:column;

}



.brand h1{

font-size:40px;

}



.brand h2{

font-size:28px;

}


}


`}</style>


</main>

);

}





function Card({number,title,text}){

return(

<div className="card">


<div className="card-number">
{number}
</div>


<h3>
{title}
</h3>


<p>
{text}
</p>


<button>
OPEN PANEL →
</button>


</div>

);

}
