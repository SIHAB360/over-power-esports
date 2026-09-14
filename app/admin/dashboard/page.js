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

console.log("PROFILE ERROR:", error);

window.location.href="/login";

return;

}



const role = profile?.role?.trim().toLowerCase();



if(role !== "admin"){

console.log("CURRENT ROLE:", role);

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

<button>
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

<button>
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

<button>
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

<button>
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

<button>
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

<button>
OPEN
</button>

</div>



</section>





<style jsx>{`

.admin-page{


min-height:100vh;

padding:40px;

background:

radial-gradient(circle at top,#8b0020,#050505 60%);


color:white;


}



.loading{


height:100vh;

display:flex;

align-items:center;

justify-content:center;

background:#050505;

color:white;


}



.loader{


width:60px;

height:60px;

border:5px solid #333;

border-top:5px solid #ff1744;

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


display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:50px;


}



h1{


font-size:42px;

letter-spacing:4px;


}



h1 span{


color:#ff1744;

text-shadow:0 0 20px red;


}



header p{


color:#aaa;

letter-spacing:5px;


}



.right{


display:flex;

align-items:center;

gap:20px;


}



.right span{


font-size:13px;

color:#aaa;


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

padding:12px 25px;

border-radius:30px;

cursor:pointer;

font-weight:800;


box-shadow:

0 0 25px rgba(255,0,80,.5);


}



.dashboard-grid{


display:grid;

grid-template-columns:repeat(3,1fr);

gap:25px;


}



.card{


padding:35px;

border-radius:25px;


background:

rgba(255,255,255,.08);


border:

1px solid rgba(255,0,80,.4);


backdrop-filter:blur(20px);


box-shadow:

0 0 35px rgba(255,0,80,.2);


}



.card h2{


color:#ff1744;


}



.card p{


color:#bbb;


}



.card button{


margin-top:20px;

width:100%;


}



.card:hover{


transform:translateY(-8px);


transition:.3s;


box-shadow:

0 0 50px rgba(255,0,80,.5);


}




@media(max-width:800px){


.dashboard-grid{

grid-template-columns:1fr;

}


header{

flex-direction:column;

gap:20px;

}


.right{

flex-direction:column;

}


}



`}</style>



</main>


);


}
