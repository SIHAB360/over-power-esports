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

padding:60px;

background:

linear-gradient(
180deg,
#050505,
#160003
);

color:white;

}



.dashboard-wrapper{

max-width:1200px;

margin:auto;

}



header{

display:flex;

justify-content:center;

position:relative;

margin-bottom:80px;

}



.brand{

text-align:center;

}



.brand span{

color:#ff1744;

letter-spacing:8px;

font-size:12px;

}



.brand h1{

font-size:70px;

letter-spacing:15px;

margin:15px 0;

}



.brand h2{

color:#ff1744;

font-size:45px;

letter-spacing:10px;

margin:0;

}



.brand p{

letter-spacing:8px;

color:#888;

}



.profile-box{

position:absolute;

right:0;

top:20px;

padding:20px;

border-radius:25px;

border:1px solid #ff1744;

background:#111;

}



.profile-box p{

font-size:12px;

color:#aaa;

}



button{

background:#ff1744;

border:none;

padding:12px 30px;

border-radius:25px;

color:white;

font-weight:bold;

cursor:pointer;

}



.dashboard-grid{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:30px;

}



.card{

padding:35px;

height:230px;

border-radius:25px;

background:

linear-gradient(
145deg,
#1a0508,
#050505
);


border:1px solid rgba(255,23,68,.5);

display:flex;

flex-direction:column;

justify-content:center;


}



.card-number{

color:#ff1744;

font-size:12px;

letter-spacing:5px;

}



.card h3{

font-size:28px;

letter-spacing:3px;

margin:15px 0;

}



.card p{

color:#999;

}



.card button{

margin-top:25px;

}



.loading{

height:100vh;

display:flex;

justify-content:center;

align-items:center;

background:#050505;

}



.loader{

width:60px;

height:60px;

border-radius:50%;

border:5px solid #333;

border-top-color:#ff1744;

animation:spin 1s linear infinite;

}



@keyframes spin{

to{

transform:rotate(360deg);

}

}



@media(max-width:900px){

.dashboard-grid{

grid-template-columns:1fr;

}


.profile-box{

position:static;

margin-top:20px;

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
