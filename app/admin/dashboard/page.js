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
