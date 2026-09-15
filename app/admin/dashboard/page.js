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
}=await supabase.auth.getUser();



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
ESPORTS MANAGEMENT SYSTEM
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
icon="👥"
title="PLAYER MANAGEMENT"
text="Manage player accounts and profiles"
/>



<Card
number="02"
icon="⚔"
title="MATCH CENTER"
text="Create and control matches"
/>



<Card
number="03"
icon="🏆"
title="TOURNAMENT HUB"
text="Tournament operations"
/>



<Card
number="04"
icon="💰"
title="FINANCE CONTROL"
text="Income and profit tracking"
/>



<Card
number="05"
icon="💳"
title="SALARY SYSTEM"
text="Player salary management"
/>



<Card
number="06"
icon="🔐"
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
circle at top left,
rgba(255,20,60,.35),
transparent 35%
),

radial-gradient(
circle at bottom right,
rgba(255,20,60,.18),
transparent 40%
),

linear-gradient(
180deg,
#030303,
#120003
);

color:white;

position:relative;

overflow:hidden;

}




.admin-page::before{

content:"";

position:absolute;

width:700px;

height:700px;

background:#ff1744;

filter:blur(220px);

opacity:.12;

top:-350px;

left:-250px;

}



.admin-page::after{

content:"";

position:absolute;

width:600px;

height:600px;

background:#ff1744;

filter:blur(240px);

opacity:.10;

right:-250px;

bottom:-250px;

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

0 0 20px #ff1744;

}




.brand h1{

font-size:72px;

letter-spacing:18px;

margin:15px 0 0;

font-weight:900;


text-shadow:

0 0 35px rgba(255,255,255,.4);

}




.brand h2{

font-size:48px;

letter-spacing:14px;

margin:8px 0;


color:#ff1744;


text-shadow:

0 0 45px #ff1744;

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


0 0 50px rgba(255,20,60,.35);



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

height:46px;


padding:0 45px;


border-radius:30px;


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


0 0 35px rgba(255,20,60,.6);



}






.dashboard-grid{


display:grid;


grid-template-columns:repeat(3,1fr);


gap:35px;


}




.card{


height:300px;


padding:35px;


border-radius:35px;



background:


linear-gradient(
145deg,
rgba(255,255,255,.10),
rgba(0,0,0,.75)
);



border:


1px solid rgba(255,20,60,.45);



backdrop-filter:blur(25px);



position:relative;


overflow:hidden;



display:flex;


flex-direction:column;


justify-content:center;



box-shadow:


0 30px 80px rgba(0,0,0,.8),


inset 0 0 50px rgba(255,20,60,.08);



transition:.4s;


}





.card:hover{

transform:translateY(-15px);


border-color:#ff1744;



box-shadow:


0 0 80px rgba(255,20,60,.55);


}





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





.card-icon{

font-size:45px;

margin-bottom:20px;

}




.card-number{

font-size:12px;

letter-spacing:6px;

color:#ff1744;

}




.card h3{

font-size:25px;

letter-spacing:3px;

margin:12px 0;


}




.card p{

color:#aaa;

font-size:15px;

}



.card button{

margin-top:30px;

height:45px;


border-radius:25px;


background:

rgba(255,20,60,.12);



border:

1px solid #ff1744;



color:white;


font-weight:900;


cursor:pointer;


}



.card button:hover{

background:#ff1744;


box-shadow:

0 0 40px #ff1744;

}

`}
</style>
  </style>


</div>


</main>


);

}





function Card({number,icon,title,text}){


return(

<div className="card">


<div className="card-icon">

{icon}

</div>


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


</div>
