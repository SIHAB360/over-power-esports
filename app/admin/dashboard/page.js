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

padding:45px;

position:relative;

overflow:hidden;


background:

radial-gradient(circle at 15% 10%,rgba(255,32,32,.25),transparent 30%),

radial-gradient(circle at 85% 90%,rgba(255,32,32,.18),transparent 30%),

linear-gradient(
135deg,
#050505,
#120000
);


color:white;

}



/* cinematic light */

.admin-page::before{

content:"";

position:absolute;

width:700px;

height:700px;


background:#ff2020;


filter:blur(220px);


top:-350px;

left:-300px;


opacity:.15;


}



.admin-page::after{

content:"";

position:absolute;

width:500px;

height:500px;


background:#ff2020;


filter:blur(200px);


bottom:-300px;

right:-200px;


opacity:.12;


}





header{

position:relative;

z-index:2;


display:flex;

justify-content:space-between;

align-items:center;


margin-bottom:70px;


}



.brand h1{


font-size:52px;


font-weight:900;


letter-spacing:8px;


margin:0;



text-shadow:

0 0 25px rgba(255,255,255,.25);



}



.brand h1 span{


display:block;


margin-top:5px;


font-size:45px;


color:#ff2020;


letter-spacing:10px;



text-shadow:

0 0 30px #ff2020;


}




.brand p{


margin-top:18px;


font-size:14px;


letter-spacing:8px;


color:#888;


}





.admin-info{


display:flex;


flex-direction:column;


align-items:flex-end;


gap:20px;


}



.email{


padding:12px 20px;


border-radius:20px;


background:rgba(255,255,255,.05);


border:1px solid rgba(255,255,255,.1);



color:#aaa;


font-size:13px;


backdrop-filter:blur(20px);


}




.admin-info button{


width:180px;


height:50px;


border-radius:30px;


background:

linear-gradient(
135deg,
#ff2020,
#8b0000
);



border:none;


color:white;


font-weight:900;


letter-spacing:3px;


cursor:pointer;



box-shadow:

0 0 30px rgba(255,32,32,.6);



transition:.3s;



}



.admin-info button:hover{


transform:scale(1.08);


box-shadow:

0 0 55px rgba(255,32,32,1);


}





.dashboard-grid{


position:relative;


z-index:2;


display:grid;


grid-template-columns:repeat(3,1fr);


gap:35px;


}




.card{


padding:38px;


height:230px;


border-radius:30px;



background:

linear-gradient(

145deg,

rgba(255,255,255,.10),

rgba(0,0,0,.75)

);



border:

1px solid rgba(255,32,32,.35);



backdrop-filter:blur(25px);




box-shadow:


inset 0 0 40px rgba(255,255,255,.04),


0 20px 50px rgba(0,0,0,.7),


0 0 25px rgba(255,32,32,.15);



transition:.4s;



}




.card:hover{


transform:

translateY(-15px);



border-color:#ff2020;



box-shadow:


0 0 60px rgba(255,32,32,.5),


inset 0 0 30px rgba(255,32,32,.15);



}





.card h2{


font-size:27px;


letter-spacing:3px;


color:#fff;



text-shadow:


0 0 15px rgba(255,255,255,.4);



}




.card p{


margin-top:18px;


color:#999;


font-size:15px;


}





.card button{


margin-top:35px;


height:48px;


width:100%;



border-radius:25px;



background:

rgba(255,32,32,.08);



border:

1px solid rgba(255,32,32,.6);



color:white;



font-weight:900;


letter-spacing:2px;



cursor:pointer;


transition:.3s;



}



.card button:hover{


background:#ff2020;


box-shadow:

0 0 35px #ff2020;



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


width:70px;


height:70px;


border-radius:50%;


border:6px solid #222;


border-top-color:#ff2020;


animation:spin 1s linear infinite;



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


align-items:center;


}



.dashboard-grid{


grid-template-columns:1fr;


}



.brand h1{


font-size:35px;


}



}



`}</style>


</main>

);

}
