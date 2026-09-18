"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


export default function TeamsPage() {


const [teams,setTeams]=useState([]);
const [loading,setLoading]=useState(true);
const [saving,setSaving]=useState(false);



const [form,setForm]=useState({

team_name:"",
logo:"",
description:"",
coach_name:"",
manager_name:"",
country:"Bangladesh",
founded_year:"",
status:"active",

});



useEffect(()=>{

loadTeams();

},[]);




async function loadTeams(){


const {data,error}=await supabase
.from("teams")
.select("*")
.order("created_at",{ascending:false});



if(error){

console.log(error);
return;

}


setTeams(data || []);

setLoading(false);


}





function handleChange(e){


const {name,value}=e.target;


setForm(prev=>({

...prev,

[name]:value

}));


}





async function createTeam(e){


e.preventDefault();



if(!form.team_name){

alert("Team name required");
return;

}



setSaving(true);



const {error}=await supabase
.from("teams")
.insert([

{

...form,

total_winnings:0

}

]);



if(error){

alert(error.message);
setSaving(false);
return;

}



alert("Team Created Successfully");



setForm({

team_name:"",
logo:"",
description:"",
coach_name:"",
manager_name:"",
country:"Bangladesh",
founded_year:"",
status:"active",

});



loadTeams();


setSaving(false);



}





return (

<main className="page">


<div className="glow glow-one"></div>

<div className="glow glow-two"></div>

<div className="glow glow-three"></div>



<div className="container">



<header className="page-header">

<span>
OVER POWER ESPORTS
</span>


<h1>
TEAM MANAGEMENT
</h1>


<p>
Create and manage your esports teams
</p>


</header>





<section className="panel">


<h2>
CREATE NEW TEAM
</h2>



<form onSubmit={createTeam}>


<div className="grid">


<input
name="team_name"
placeholder="Team Name"
value={form.team_name}
onChange={handleChange}
/>



<input
name="logo"
placeholder="Logo URL"
value={form.logo}
onChange={handleChange}
/>



<input
name="coach_name"
placeholder="Coach Name"
value={form.coach_name}
onChange={handleChange}
/>



<input
name="manager_name"
placeholder="Manager Name"
value={form.manager_name}
onChange={handleChange}
/>



<input
name="country"
placeholder="Country"
value={form.country}
onChange={handleChange}
/>



<input
name="founded_year"
placeholder="Founded Year"
type="number"
value={form.founded_year}
onChange={handleChange}
/>



<select
name="status"
value={form.status}
onChange={handleChange}
>


<option value="active">
Active
</option>


<option value="pending">
Pending
</option>


<option value="inactive">
Inactive
</option>


</select>


</div>





<textarea

name="description"

placeholder="Team Description"

value={form.description}

onChange={handleChange}

/>





<button className="create-btn">


{

saving ?

"CREATING..."

:

"CREATE TEAM →"

}


</button>




</form>


</section>
<section className="panel">

<h2>
YOUR TEAMS
</h2>


{
loading ?

<p className="loading">
Loading...
</p>


:

teams.length===0 ?

<p className="empty">
No team created yet.
</p>


:


<div className="team-list">


{

teams.map((team)=>(


<div className="team-card" key={team.id}>


<div className="team-left">


<div className="team-logo">


{

team.logo ?

<img src={team.logo} alt={team.team_name}/>

:

<span>
OP
</span>

}


</div>




<div className="team-info">


<h3>
{team.team_name}
</h3>



<div>
Coach:
<span>
{team.coach_name || "N/A"}
</span>
</div>



<div>
Manager:
<span>
{team.manager_name || "N/A"}
</span>
</div>



</div>



</div>





<div className="team-status">

● {team.status}

</div>





<button
className="manage-btn"

onClick={()=>{

window.location.href=
`/admin/teams/${team.id}`;

}}

>

MANAGE PLAYERS →

</button>



</div>


))

}


</div>


}


</section>



</div>


</main>
