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


<span className="label">
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
icon="👥"
title="PLAYERS"
text="Manage player accounts"
/>


<Card
number="02"
icon="⚔"
title="MATCHES"
text="Create and control matches"
/>


<Card
number="03"
icon="🏆"
title="TOURNAMENTS"
text="Tournament management"
/>


<Card
number="04"
icon="💰"
title="PROFIT"
text="Income calculation"
/>


<Card
number="05"
icon="💳"
title="SALARY"
text="Player salary control"
/>


<Card
number="06"
icon="🔐"
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
circle at top left,
rgba(255,20,60,.30),
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
#130003
);


color:white;

position:relative;

overflow:hidden;

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

margin-bottom:90px;

}





.brand{

text-align:center;

}





.label{

font-size:12px;

letter-spacing:12px;

color:#ff1744;

text-shadow:

0 0 20px #ff1744;

}




.brand h1{

font-size:72px;

letter-spacing:18px;

margin:20px 0 5px;

font-weight:900;

}



.brand h2{

font-size:48px;

letter-spacing:14px;

margin:0;

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


0 0 40px rgba(255,20,60,.3);



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


}





.dashboard-grid{


display:grid;


grid-template-columns:repeat(3,1fr);


gap:35px;


}





.card{


height:280px;


padding:35px;



border-radius:35px;



background:


linear-gradient(
145deg,
rgba(255,255,255,.10),
rgba(0,0,0,.80)
);



border:

1px solid rgba(255,20,60,.45);



backdrop-filter:blur(25px);



display:flex;


flex-direction:column;


justify-content:center;



position:relative;


overflow:hidden;



box-shadow:


0 30px 70px rgba(0,0,0,.8),


inset 0 0 40px rgba(255,20,60,.10);



transition:.4s;


}





.card:hover{


transform:translateY(-15px);



box-shadow:


0 0 70px rgba(255,20,60,.55);



border-color:#ff1744;



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

font-size:28px;

letter-spacing:4px;

margin:15px 0 0;

color:white;

text-shadow:

0 0 15px rgba(255,255,255,.3);

}



.card p{

margin-top:15px;

color:#999;

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

}


}



`}</style>


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
