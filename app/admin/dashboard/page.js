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

radial-gradient(circle at top,#ff202033,transparent 35%),

linear-gradient(
180deg,
#050505,
#100000
);


color:white;

}




.dashboard-wrapper{

max-width:1300px;

margin:auto;

}





header{

display:flex;

justify-content:center;

align-items:center;

position:relative;

margin-bottom:80px;

}




.brand{

text-align:center;

}



.brand h1{

font-size:58px;

letter-spacing:10px;

margin:0;

font-weight:900;

}




.brand h2{

font-size:42px;

margin:10px 0;


color:#ff2020;


letter-spacing:12px;


text-shadow:

0 0 30px #ff2020;


}





.brand p{

font-size:13px;

letter-spacing:8px;

color:#888;


}






.profile-box{


position:absolute;

right:0;

top:10px;



padding:18px 25px;


border-radius:25px;



background:

rgba(255,255,255,.06);



border:

1px solid rgba(255,32,32,.4);



backdrop-filter:blur(20px);



display:flex;

flex-direction:column;

gap:15px;

align-items:center;



}





.profile-box span{

font-size:12px;

color:#aaa;

}




button{


height:45px;


padding:0 35px;



border-radius:30px;


border:none;


background:

linear-gradient(
135deg,
#ff2020,
#990000
);



color:white;


font-weight:900;


letter-spacing:2px;


cursor:pointer;



box-shadow:

0 0 25px rgba(255,32,32,.5);


}





.dashboard-grid{

display:grid;


grid-template-columns:repeat(3,1fr);


gap:35px;


}





.card{


height:240px;


padding:35px;


border-radius:30px;



background:


linear-gradient(
145deg,
rgba(255,255,255,.12),
rgba(0,0,0,.8)
);



border:

1px solid rgba(255,32,32,.35);



display:flex;

flex-direction:column;

justify-content:center;



box-shadow:


0 20px 50px rgba(0,0,0,.7),


inset 0 0 30px rgba(255,32,32,.08);



transition:.3s;


}




.card:hover{


transform:translateY(-10px);



box-shadow:


0 0 50px rgba(255,32,32,.5);


}




.card h3{


font-size:28px;


letter-spacing:4px;


margin:0;


color:white;


}




.card p{


margin-top:15px;


color:#999;


}



.card button{


margin-top:30px;


width:150px;



background:transparent;



border:

1px solid #ff2020;


}




.card button:hover{


background:#ff2020;


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


border-top-color:#ff2020;


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
