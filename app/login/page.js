"use client";

import { supabase } from "../lib/supabase";
import { useState } from "react";


export default function LoginPage() {


  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);



  const handleLogin = async()=>{


    if(!email || !password){

      alert("Enter email and password");
      return;

    }


    setLoading(true);



    const {data,error} = await supabase.auth.signInWithPassword({

      email: email.trim(),

      password,

    });



    if(error){

      alert(error.message);

      setLoading(false);

      return;

    }



    const {data:profile,error:profileError} = await supabase

    .from("profiles")

    .select("role")

    .eq("id",data.user.id)

    .single();

    
console.log("LOGIN USER ID:", data.user.id);
console.log("PROFILE DATA:", profile);
console.log("PROFILE ERROR:", profileError);

    

    if(profileError){

      alert("Profile not found");

      setLoading(false);

      return;

    }



if(profile.role?.toLowerCase()==="admin"){

      window.location.href="/admin/dashboard";

    }


else if(profile.role?.toLowerCase()==="player"){

      window.location.href="/player/dashboard";

    }


    else{

      alert("Invalid Role");

    }


  };




return (

<main className="login-page">


<div className="light one"></div>
<div className="light two"></div>
<div className="light three"></div>



<div className="login-card">


<div className="brand">

OVER POWER

<span>
ESPORTS
</span>

</div>



<h1>
LOGIN
</h1>


<p>
ENTER YOUR ACCOUNT
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



</div>



<style jsx>{`

.login-page{

min-height:100vh;

display:flex;

justify-content:center;

align-items:center;

overflow:hidden;

position:relative;

background:#030303;

}



.light{

position:absolute;

border-radius:50%;

filter:blur(100px);

}



.one{

width:350px;

height:350px;

background:#ff003c;

top:-100px;

left:-100px;

}



.two{

width:400px;

height:400px;

background:#6a00ff;

right:-150px;

top:100px;

}



.three{

width:300px;

height:300px;

background:#008cff;

bottom:-120px;

left:40%;

}



.login-card{


width:420px;


padding:45px;


border-radius:25px;


background:

rgba(255,255,255,.08);



backdrop-filter:blur(25px);



border:

1px solid rgba(255,255,255,.15);



box-shadow:

0 0 50px rgba(255,0,80,.35);



text-align:center;


z-index:2;


}



.brand{


font-size:30px;

font-weight:900;

letter-spacing:3px;

color:white;


}



.brand span{


display:block;

color:#ff1744;

text-shadow:

0 0 20px red;


}



h1{

color:white;

font-size:40px;

margin:30px 0 10px;


}



p{

color:#aaa;

letter-spacing:3px;

}



input{


width:100%;

height:55px;

margin-top:18px;

padding:0 20px;


background:

rgba(0,0,0,.5);



border:

1px solid rgba(255,255,255,.2);



border-radius:15px;


color:white;

outline:none;


}



input:focus{

border-color:#ff1744;

box-shadow:

0 0 20px rgba(255,0,60,.5);


}



button{


width:100%;

height:55px;

margin-top:25px;


border:none;

border-radius:30px;


background:

linear-gradient(
135deg,
#ff1744,
#7200ff
);



color:white;

font-size:18px;

font-weight:800;


cursor:pointer;


box-shadow:

0 0 30px rgba(255,0,80,.6);


transition:.3s;


}



button:hover{

transform:scale(1.05);

}



@media(max-width:600px){


.login-card{

width:90%;

padding:30px 20px;

}



h1{

font-size:32px;

}


}



`}</style>


</main>


);


}
