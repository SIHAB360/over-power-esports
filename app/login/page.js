"use client";

import { supabase } from "../lib/supabase";
import { useState } from "react";


export default function LoginPage() {


const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [loading,setLoading]=useState(false);



const handleLogin = async()=>{


if(!email || !password){

alert("Enter email and password");
return;

}


setLoading(true);



const {data,error}=await supabase.auth.signInWithPassword({

email:email.trim(),

password,

});



if(error){

alert(error.message);

setLoading(false);

return;

}




const {data:profile,error:profileError}=await supabase

.from("profiles")

.select("role")

.eq("id",data.user.id)

.single();



if(profileError){

alert("Profile not found");

setLoading(false);

return;

}



if(profile.role==="admin"){

window.location.href="/admin/dashboard";

}

else if(profile.role==="player"){

window.location.href="/player/dashboard";

}

else{

alert("Invalid Role");

}



};





return (

<main className="login-page">


<div className="login-card">


<div className="logo">

OVER POWER

<span>
ESPORTS
</span>

</div>



<h1>
LOGIN
</h1>


<p>
Enter your account credentials
</p>



<input

type="email"

placeholder="Email Address"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>



<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>



<button onClick={handleLogin}>

{loading ? "VERIFYING..." : "LOGIN"}

</button>



<div className="footer">

OVER POWER ESPORTS

<br/>

PLAY WITH DISCIPLINE

</div>



</div>





<style jsx>{`

.login-page{

min-height:100vh;

display:flex;

justify-content:center;

align-items:center;


background:

radial-gradient(circle at top,#700000,#050505 70%);


padding:20px;

}



.login-card{


width:420px;


padding:45px;


border-radius:25px;



background:

rgba(255,255,255,.08);



backdrop-filter:blur(25px);



border:

1px solid rgba(255,0,60,.4);



box-shadow:


0 0 50px rgba(255,0,60,.25);


text-align:center;



}



.logo{


font-size:30px;

font-weight:900;

letter-spacing:3px;

color:white;


}



.logo span{


display:block;

color:#ff1744;


text-shadow:

0 0 20px #ff1744;


}



h1{


margin-top:35px;

font-size:38px;

color:white;


}



p{


color:#aaa;

margin-bottom:30px;


}



input{


width:100%;

height:55px;

margin-bottom:18px;


padding:0 20px;


border-radius:15px;


border:

1px solid rgba(255,255,255,.2);



background:

rgba(0,0,0,.45);



color:white;


font-size:16px;



outline:none;


}



input:focus{


border-color:#ff1744;


box-shadow:

0 0 15px rgba(255,23,68,.5);


}



button{


width:100%;


height:55px;


border:none;


border-radius:30px;



background:

linear-gradient(
135deg,
#ff1744,
#990000
);



color:white;


font-size:18px;


font-weight:800;


cursor:pointer;



box-shadow:

0 0 25px rgba(255,0,60,.5);



transition:.3s;


}



button:hover{


transform:scale(1.05);


box-shadow:

0 0 40px rgba(255,0,60,.8);


}



.footer{


margin-top:35px;


font-size:11px;


letter-spacing:3px;


color:#777;


}




@media(max-width:600px){


.login-card{


width:100%;

padding:35px 25px;


}



.logo{

font-size:24px;

}


h1{

font-size:32px;

}


}



`}</style>


</main>


);


}
