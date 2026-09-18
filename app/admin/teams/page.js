"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


export default function TeamsPage() {

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    team_name: "",
    logo: "",
    description: "",
    coach_name: "",
    manager_name: "",
    country: "Bangladesh",
    founded_year: "",
    status: "active",
  });


  useEffect(() => {
    loadTeams();
  }, []);



  async function loadTeams() {

    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if(error){
      console.log(error);
      return;
    }


    setTeams(data || []);
    setLoading(false);

  }



  function handleChange(e){

    const {name,value} = e.target;


    setForm((prev)=>({
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


    const {
      error
    } = await supabase
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


<div className="glow one"></div>
<div className="glow two"></div>



<div className="container">


<header>

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




<section className="card">


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



<button>

{
saving
?
"CREATING..."
:
"CREATE TEAM →"
}

</button>



</form>


</section>






<section className="card">


<h2>
YOUR TEAMS
</h2>



{

loading ?

<p>
Loading...
</p>


:

teams.length===0 ?

<p>
No team created yet.
</p>


:

<div className="team-list">


{

teams.map((team)=>(


<div
className="team"
key={team.id}
>


<div className="logo">

{

team.logo ?

<img src={team.logo}/>

:

"OP"

}

</div>



<div>

<h3>
{team.team_name}
</h3>


<p>
Coach:
{team.coach_name || "N/A"}
</p>


<p>
Manager:
{team.manager_name || "N/A"}
</p>


</div>



<span>
{team.status}
</span>


</div>


))

}


</div>


}


</section>



</div>




<style jsx>{`

.page{

min-height:100vh;
background:#050505;
color:white;
padding:40px 20px;
position:relative;

}



.container{

max-width:1100px;
margin:auto;
position:relative;
z-index:2;

}



header span{

color:#ff174d;
font-size:10px;
letter-spacing:3px;
font-weight:900;

}



header h1{

font-size:42px;
margin:10px 0;

}



header p{

color:#888;

}




.card{

margin-top:25px;
padding:30px;
border-radius:25px;

background:
rgba(255,255,255,.04);

border:
1px solid rgba(255,23,77,.25);

box-shadow:
0 20px 60px rgba(0,0,0,.5);

}



h2{

font-size:18px;
margin-bottom:25px;

}



.grid{

display:grid;
grid-template-columns:
repeat(3,1fr);

gap:15px;

}



input,
select,
textarea{

width:100%;
background:#0b0b0f;
border:1px solid #333;
border-radius:12px;
padding:15px;
color:white;
outline:none;

}



textarea{

margin-top:15px;
min-height:100px;

}



button{

margin-top:20px;
width:100%;
padding:16px;
border:none;
border-radius:30px;

background:
linear-gradient(
135deg,
#ff174d,
#7000ff
);

color:white;
font-weight:900;
cursor:pointer;

}



.team-list{

display:flex;
flex-direction:column;
gap:15px;

}



.team{

display:flex;
align-items:center;
justify-content:space-between;

padding:18px;

border-radius:18px;

background:#0b0b0f;

border:
1px solid #222;

}



.logo{

width:60px;
height:60px;
border-radius:15px;

background:
linear-gradient(
135deg,
#ff174d,
#7000ff
);

display:flex;
align-items:center;
justify-content:center;

font-weight:900;

overflow:hidden;

}



.logo img{

width:100%;
height:100%;
object-fit:cover;

}



.team span{

color:#22ff99;
font-size:12px;

}



.glow{

position:fixed;
width:300px;
height:300px;
filter:blur(120px);
opacity:.3;

}



.one{

background:red;
top:0;
left:0;

}



.two{

background:blue;
right:0;
bottom:0;

}



@media(max-width:700px){

.grid{

grid-template-columns:1fr;

}


header h1{

font-size:30px;

}


}


`}</style>


</main>

);

}
