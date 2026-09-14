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



if(error){

window.location.href="/login";

return;

}



const role = profile?.role?.trim().toLowerCase();



if(role !== "admin"){

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




const openPage=(page)=>{

window.location.href=page;

};





if(loading){


return(

<main className="loading">

<div>

<div className="loader"></div>

<p>
LOADING ADMIN PANEL...
</p>

</div>

</main>

);


}



return(


<main className="admin-page">



<header>


<div>

<h1>
OVER POWER
<span> ADMIN</span>
</h1>


<p>
COMMAND CENTER
</p>


</div>




<div className="right">


<span>
{adminEmail}
</span>



<button onClick={logout}>
LOGOUT
</button>


</div>



</header>





<section className="dashboard-grid">



<div className="card">

<h2>
👥 PLAYERS
</h2>

<p>
Manage player accounts
</p>

<button onClick={()=>openPage("/admin/players")}>
OPEN
</button>

</div>





<div className="card">

<h2>
🎮 MATCHES
</h2>

<p>
Create & control matches
</p>

<button onClick={()=>openPage("/admin/matches")}>
OPEN
</button>

</div>





<div className="card">

<h2>
🏆 TOURNAMENTS
</h2>

<p>
Tournament management
</p>

<button onClick={()=>openPage("/admin/tournaments")}>
OPEN
</button>

</div>





<div className="card">

<h2>
💰 PROFIT
</h2>

<p>
Income calculation
</p>

<button onClick={()=>openPage("/admin/profit")}>
OPEN
</button>

</div>





<div className="card">

<h2>
💳 SALARY
</h2>

<p>
Player salary control
</p>

<button onClick={()=>openPage("/admin/salary")}>
OPEN
</button>

</div>





<div className="card">

<h2>
🔐 VERIFICATION
</h2>

<p>
Generate 24h codes
</p>

<button onClick={()=>openPage("/admin/codes")}>
OPEN
</button>

</div>



</section>







<style jsx>{`

.admin-page{

min-height:100vh;

padding:40px;

position:relative;

overflow:hidden;

background:

radial-gradient(circle at top left,#ff003c55,transparent 35%),
radial-gradient(circle at top right,#7000ff55,transparent 35%),
radial-gradient(circle at bottom,#008cff33,transparent 30%),
#050505;


color:white;

}



.admin-page::before{

content:"";

position:absolute;

width:500px;

height:500px;

background:#ff1744;

filter:blur(180px);

top:-200px;

left:-150px;

opacity:.35;

}



.admin-page::after{

content:"";

position:absolute;

width:450px;

height:450px;

background:#7000ff;

filter:blur(180px);

bottom:-200px;

right:-150px;

opacity:.35;

}



.loading{

height:100vh;

display:flex;

align-items:center;

justify-content:center;

background:#050505;

color:white;

font-size:22px;

}



.loader{

width:70px;

height:70px;

border:6px solid #222;

border-top:6px solid #ff1744;

border-right:6px solid #7000ff;

border-radius:50%;

animation:spin 1s linear infinite;

margin:auto;

}



@keyframes spin{

100%{

transform:rotate(360deg);

}

}





header{

position:relative;

z-index:2;

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:50px;

}




h1{

font-size:45px;

letter-spacing:5px;

text-shadow:

0 0 20px rgba(255,255,255,.3);

}




h1 span{

color:#ff1744;

text-shadow:

0 0 25px #ff1744;

}




header p{

color:#aaa;

letter-spacing:8px;

}




.right{

display:flex;

align-items:center;

gap:25px;

}




.right span{

color:#ddd;

font-size:13px;

}




button{

background:

linear-gradient(
135deg,
#ff1744,
#7000ff
);



border:none;

color:white;

padding:14px 32px;

border-radius:35px;

font-weight:900;

cursor:pointer;


box-shadow:

0 0 25px rgba(255,0,80,.7);


transition:.3s;

}




button:hover{

transform:scale(1.08);


box-shadow:

0 0 45px rgba(255,0,80,1);

}




.dashboard-grid{

position:relative;

z-index:2;

display:grid;

grid-template-columns:repeat(3,1fr);

gap:30px;

}





.card{

padding:40px;

border-radius:30px;


background:

linear-gradient(
145deg,
rgba(255,255,255,.12),
rgba(255,255,255,.04)
);



border:

1px solid rgba(255,0,90,.45);



backdrop-filter:blur(25px);



box-shadow:

inset 0 0 30px rgba(255,255,255,.05),

0 0 35px rgba(255,0,80,.25);



transition:.4s;


}




.card:hover{


transform:

translateY(-12px)
scale(1.03);



border-color:#ff1744;



box-shadow:


0 0 60px rgba(255,0,80,.7),

inset 0 0 30px rgba(255,0,80,.2);


}




.card h2{

font-size:25px;

color:#ff1744;


text-shadow:

0 0 15px #ff1744;

}



.card p{

color:#ccc;

font-size:16px;

}



.card button{

margin-top:25px;

width:100%;

}




@media(max-width:800px){


.dashboard-grid{

grid-template-columns:1fr;

}



header{

flex-direction:column;

gap:25px;

}



.right{

flex-direction:column;

}



}



`}</style>



</main>


);


}
