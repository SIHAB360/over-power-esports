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

radial-gradient(circle at top left,#ff202044,transparent 35%),

radial-gradient(circle at bottom right,#ff202033,transparent 40%),

linear-gradient(
135deg,
#050505,
#160000
);


color:white;

}




.dashboard-wrapper{

max-width:1400px;

margin:auto;

}





header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:70px;

}





.brand h1{

font-size:58px;

letter-spacing:8px;

margin:0;

font-weight:900;

}





.brand h2{

font-size:42px;

margin:5px 0;

color:#ff2020;

letter-spacing:10px;

text-shadow:

0 0 25px #ff2020;


}





.brand p{

color:#888;

letter-spacing:8px;

font-size:14px;

}





.profile-box{

display:flex;

align-items:center;

gap:25px;

padding:18px 25px;


border-radius:25px;


background:

rgba(255,255,255,.05);



border:

1px solid rgba(255,32,32,.35);



backdrop-filter:blur(20px);


}




.profile-box span{

color:#aaa;

font-size:13px;

}





button{


background:

linear-gradient(
135deg,
#ff2020,
#900000
);



border:none;


padding:14px 35px;


border-radius:30px;


color:white;


font-weight:900;


letter-spacing:2px;


cursor:pointer;



box-shadow:

0 0 25px rgba(255,32,32,.5);



transition:.3s;



}



button:hover{

transform:scale(1.05);

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

rgba(255,255,255,.12),

rgba(10,0,0,.85)

);



border:

1px solid rgba(255,32,32,.35);



display:flex;


flex-direction:column;


justify-content:center;


align-items:flex-start;




box-shadow:


0 25px 60px rgba(0,0,0,.7),


inset 0 0 40px rgba(255,32,32,.08);



transition:.4s;



}





.card:hover{


transform:translateY(-12px);



box-shadow:


0 0 60px rgba(255,32,32,.5);



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


color:#999;


font-size:15px;


}




.card button{


margin-top:35px;


width:150px;


height:45px;


padding:0;



background:

transparent;


border:

1px solid #ff2020;


}



.card button:hover{


background:#ff2020;


box-shadow:

0 0 30px #ff2020;


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


border-top-color:#ff2020;


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

gap:30px;

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
