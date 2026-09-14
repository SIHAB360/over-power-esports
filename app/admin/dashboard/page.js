"use client";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";


export default function AdminDashboard(){


const [loading,setLoading]=useState(true);



useEffect(()=>{

checkAdmin();

},[]);



const checkAdmin = async()=>{


const {data:{user}} = await supabase.auth.getUser();



if(!user){

window.location.href="/login";

return;

}



const {data:profile} = await supabase

.from("profiles")

.select("role")

.eq("id",user.id)

.single();



if(profile?.role !== "admin"){

window.location.href="/login";

return;

}



setLoading(false);


};




const logout = async()=>{


await supabase.auth.signOut();

window.location.href="/login";


};




if(loading){


return(

<main className="loading">

LOADING ADMIN PANEL...

</main>

);


}



return(


<main className="admin-page">



<header>


<div>

<h1>
OVER POWER
<span> ADMIN PANEL</span>
</h1>

<p>
CONTROL CENTER
</p>

</div>



<button onClick={logout}>
LOGOUT
</button>


</header>




<section className="dashboard-grid">



<div className="card">

<h2>
👥 PLAYERS
</h2>

<p>
Manage Players
</p>

</div>



<div className="card">

<h2>
🎮 MATCHES
</h2>

<p>
Create & Control Matches
</p>

</div>



<div className="card">

<h2>
🏆 TOURNAMENTS
</h2>

<p>
Tournament Management
</p>

</div>



<div className="card">

<h2>
💰 PROFIT
</h2>

<p>
Income & Profit Control
</p>

</div>



<div className="card">

<h2>
💳 SALARY
</h2>

<p>
Player Salary System
</p>

</div>



<div className="card">

<h2>
🔐 CODES
</h2>

<p>
Verification Code Control
</p>

</div>



</section>





<style jsx>{`

.admin-page{


min-height:100vh;


padding:40px;


background:

radial-gradient(circle at top,#700000,#050505 70%);


color:white;


}



.loading{


height:100vh;

display:flex;

justify-content:center;

align-items:center;

background:#050505;

color:white;

font-size:25px;

}



header{


display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:50px;


}



h1{


font-size:38px;

letter-spacing:3px;


}



h1 span{


color:#ff1744;

}



header p{


color:#aaa;

letter-spacing:5px;


}



button{


background:

linear-gradient(
135deg,
#ff1744,
#990000
);


border:none;


padding:14px 30px;


border-radius:30px;


color:white;


font-weight:800;


cursor:pointer;


box-shadow:

0 0 25px rgba(255,0,60,.5);


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

1px solid rgba(255,0,60,.35);


backdrop-filter:blur(20px);


box-shadow:

0 0 30px rgba(255,0,60,.15);


transition:.3s;


}



.card:hover{


transform:translateY(-8px);


box-shadow:

0 0 40px rgba(255,0,60,.5);


}



.card h2{


color:#ff1744;


}




@media(max-width:800px){


.dashboard-grid{


grid-template-columns:1fr;


}



header{


flex-direction:column;

gap:20px;


}



}



`}</style>



</main>


);


}
