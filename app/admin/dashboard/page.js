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


<span className="top-label">
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


<span>
{adminEmail}
</span>


<button 
className="logout-btn"
onClick={logout}
>

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
<style jsx>{`

.admin-page{

min-height:100vh;

padding:70px 50px;


background:

radial-gradient(
circle at top,
rgba(255,20,60,.25),
transparent 35%
),


radial-gradient(
circle at bottom right,
rgba(255,20,60,.15),
transparent 40%
),


linear-gradient(
180deg,
#050505,
#120003
);


color:white;

overflow:hidden;

position:relative;

}




.admin-page::before{

content:"";

position:absolute;

width:600px;

height:600px;

background:#ff1744;

filter:blur(220px);

opacity:.12;

top:-300px;

left:-250px;

}



.admin-page::after{

content:"";

position:absolute;

width:500px;

height:500px;

background:#ff1744;

filter:blur(220px);

opacity:.10;

right:-200px;

bottom:-200px;

}




.dashboard-wrapper{

max-width:1400px;

margin:auto;

position:relative;

z-index:2;

}





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

0 0 15px #ff1744;

}




.brand h1{

font-size:70px;

letter-spacing:16px;

margin:20px 0 0;

font-weight:900;


text-shadow:

0 0 35px rgba(255,255,255,.35);

}




.brand h2{

font-size:46px;

letter-spacing:14px;

margin:10px 0;


color:#ff1744;


text-shadow:

0 0 40px #ff1744;

}





.brand p{

font-size:13px;

letter-spacing:10px;

color:#888;

}





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

1px solid rgba(255,20,60,.55);



backdrop-filter:blur(25px);



box-shadow:

0 0 40px rgba(255,20,60,.25);


display:flex;

flex-direction:column;

align-items:center;

gap:15px;

}




.profile-box span{

font-size:12px;

color:#aaa;

}





.logout-btn{

height:45px;

padding:0 40px;

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


letter-spacing:3px;


cursor:pointer;



box-shadow:

0 0 30px rgba(255,20,60,.5);



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

height:250px;

padding:35px;


border-radius:30px;



background:

linear-gradient(
145deg,
rgba(255,255,255,.10),
rgba(0,0,0,.80)
);



border:

1px solid rgba(255,20,60,.45);



backdrop-filter:blur(20px);



position:relative;


overflow:hidden;



display:flex;

flex-direction:column;

justify-content:center;



box-shadow:

0 25px 70px rgba(0,0,0,.8),

inset 0 0 40px rgba(255,20,60,.10);



transition:.4s;

}




.card:hover{

transform:translateY(-12px);


border-color:#ff1744;


box-shadow:

0 0 60px rgba(255,20,60,.55);

}




.card::before{

content:"";

position:absolute;

top:0;

left:20%;

width:60%;

height:2px;


background:#ff1744;


box-shadow:

0 0 25px #ff1744;

}




.card-number{

font-size:13px;

color:#ff1744;

letter-spacing:6px;

margin-bottom:18px;

}




.card h3{

font-size:30px;

letter-spacing:5px;

margin:0;


color:white;

}




.card p{

color:#aaa;

font-size:15px;

margin-top:15px;

}





.card button{

margin-top:35px;


height:45px;


border-radius:25px;



background:

rgba(255,20,60,.10);



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



`}</style>
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

letter-spacing:8px;

}



.brand h2{

font-size:28px;

letter-spacing:6px;

}



}



`}</style>


</div>

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
