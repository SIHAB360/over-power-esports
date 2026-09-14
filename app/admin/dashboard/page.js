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



if(profile?.role?.toLowerCase() !== "admin"){

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


<header>


<div className="brand">

<h1>

OVER POWER

<span>
ADMIN
</span>

</h1>


<p>
CONTROL CENTER
</p>


</div>



<div className="admin-info">


<div className="email">

{adminEmail}

</div>


<button onClick={logout}>

LOGOUT

</button>


</div>


</header>





<section className="dashboard-grid">



<div className="card">

<h2>PLAYERS</h2>

<p>
Manage player accounts
</p>

<button>
OPEN
</button>

</div>




<div className="card">

<h2>MATCHES</h2>

<p>
Create & control matches
</p>

<button>
OPEN
</button>

</div>




<div className="card">

<h2>TOURNAMENTS</h2>

<p>
Tournament management
</p>

<button>
OPEN
</button>

</div>




<div className="card">

<h2>PROFIT</h2>

<p>
Income calculation
</p>

<button>
OPEN
</button>

</div>




<div className="card">

<h2>SALARY</h2>

<p>
Player salary control
</p>

<button>
OPEN
</button>

</div>




<div className="card">

<h2>VERIFICATION</h2>

<p>
Generate access codes
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

radial-gradient(circle at top,#ff202033,transparent 35%),

#050505;


color:white;

position:relative;

overflow:hidden;

}



.admin-page::before{

content:"";

position:absolute;

width:600px;

height:600px;

background:#ff2020;

filter:blur(180px);

top:-250px;

left:-200px;

opacity:.18;

}



.admin-page::after{

content:"";

position:absolute;

width:500px;

height:500px;

background:#ff2020;

filter:blur(200px);

bottom:-250px;

right:-150px;

opacity:.15;

}





header{

position:relative;

z-index:2;

display:flex;

justify-content:space-between;

align-items:flex-start;

margin-bottom:60px;

}



.brand h1{

font-size:44px;

font-weight:900;

letter-spacing:5px;

margin:0;


}



.brand h1 span{

display:block;

color:#ff2020;

text-shadow:

0 0 20px #ff2020;


}



.brand p{

margin-top:12px;

color:#999;

letter-spacing:6px;

font-size:13px;

}





.admin-info{

display:flex;

flex-direction:column;

align-items:flex-end;

gap:18px;

}



.email{

font-size:13px;

color:#aaa;

}





.admin-info button{


width:160px;

height:45px;


border-radius:30px;


border:1px solid rgba(255,32,32,.7);


background:

rgba(255,32,32,.12);


color:white;


font-weight:800;


letter-spacing:2px;


cursor:pointer;



box-shadow:

0 0 20px rgba(255,32,32,.35);


transition:.3s;


}



.admin-info button:hover{


background:#ff2020;


box-shadow:

0 0 40px #ff2020;


}





.dashboard-grid{

position:relative;

z-index:2;


display:grid;

grid-template-columns:repeat(3,1fr);

gap:30px;


}





.card{


padding:35px;


min-height:220px;


border-radius:25px;


background:

linear-gradient(

145deg,

rgba(255,255,255,.08),

rgba(0,0,0,.65)

);



border:

1px solid rgba(255,32,32,.35);



backdrop-filter:blur(20px);



box-shadow:


inset 0 0 30px rgba(255,255,255,.03),


0 0 35px rgba(255,32,32,.15);



transition:.35s;


}





.card:hover{


transform:

translateY(-10px);


border-color:#ff2020;



box-shadow:


0 0 45px rgba(255,32,32,.5);



}





.card h2{


font-size:25px;


letter-spacing:2px;


color:white;



text-shadow:

0 0 10px rgba(255,255,255,.3);



}




.card p{


color:#999;


margin-top:15px;


font-size:15px;


}




.card button{


margin-top:35px;


width:100%;


height:45px;



border-radius:25px;



border:1px solid rgba(255,32,32,.6);



background:

rgba(255,32,32,.1);



color:white;



font-weight:700;



cursor:pointer;



transition:.3s;



}



.card button:hover{


background:#ff2020;


box-shadow:

0 0 30px #ff2020;


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


width:65px;


height:65px;


border-radius:50%;


border:

5px solid #222;


border-top-color:#ff2020;


animation:

spin 1s linear infinite;


}



@keyframes spin{


100%{

transform:rotate(360deg);

}


}





@media(max-width:900px){


header{


flex-direction:column;


gap:30px;


}



.admin-info{


align-items:flex-start;


}



.dashboard-grid{


grid-template-columns:1fr;


}



.brand h1{


font-size:32px;


}



}



`}</style>
</style>

</main>

);

}
