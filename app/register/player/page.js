"use client";

import { useState } from "react";

export default function PlayerRegister(){

  const [form,setForm] = useState({

    full_name:"",
    ign:"",
    freefire_uid:"",
    email:"",
    phone:"",
    age:"",
    birth_date:"",
    primary_role:"",
    secondary_role:"",
    device:"",
    internet_connection:"",
    practice_time:"",
    game_experience:"",
    tournament_experience:"",
    joining_date:"",
    average_br_kd_rate:"",
    expert_weapon:"",
    previous_team:"",
    social_media_link:"",
    full_address:"",
    team_name:""

  });


  const [message,setMessage]=useState("");



  function handleChange(e){

    setForm({

      ...form,
      [e.target.name]:e.target.value

    });

  }



  async function submit(e){

    e.preventDefault();


    const res = await fetch("/api/register-player",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify(form)

    });


    const data = await res.json();


    if(data.success){

      setMessage("Registration Successful");

    }
    else{

      setMessage(data.message);

    }

  }



return (

<main>


<h1>
PLAYER REGISTRATION
</h1>


<form onSubmit={submit}>


<input name="full_name" placeholder="Player Name" onChange={handleChange}/>

<input name="ign" placeholder="In Game Name (IGN)" onChange={handleChange}/>

<input name="freefire_uid" placeholder="Free Fire UID" onChange={handleChange}/>

<input name="email" placeholder="Email Address" onChange={handleChange}/>

<input name="phone" placeholder="Phone Number" onChange={handleChange}/>

<input name="age" placeholder="Age" onChange={handleChange}/>


<label>Birth Date</label>
<input type="date" name="birth_date" onChange={handleChange}/>



<h3>Primary Role</h3>

<select name="primary_role" onChange={handleChange}>

<option value="">Select</option>
<option>1st Rusher</option>
<option>2nd Rusher</option>
<option>Supporter</option>
<option>Supporter + Boomber</option>
<option>All Rounder</option>
<option>Sniper</option>
<option>Coach</option>

</select>



<h3>Secondary Role</h3>

<select name="secondary_role" onChange={handleChange}>

<option value="">Select</option>
<option>1st Rusher</option>
<option>2nd Rusher</option>
<option>Supporter</option>
<option>Boomber</option>
<option>Sniper</option>

</select>



<input name="device" placeholder="Device" onChange={handleChange}/>


<input name="internet_connection" placeholder="Internet Connection" onChange={handleChange}/>


<input name="practice_time" placeholder="Practice Time" onChange={handleChange}/>


<input name="game_experience" placeholder="Game Experience" onChange={handleChange}/>


<input name="tournament_experience" placeholder="Tournament Experience" onChange={handleChange}/>


<label>Joining Date</label>

<input type="date" name="joining_date" onChange={handleChange}/>



<input name="average_br_kd_rate" placeholder="Average BR K/D Rate" onChange={handleChange}/>


<input name="expert_weapon" placeholder="Expert Weapon" onChange={handleChange}/>


<input name="previous_team" placeholder="Previous Team" onChange={handleChange}/>


<textarea
name="full_address"
placeholder="Full Address"
onChange={handleChange}
/>



<input
name="social_media_link"
placeholder="Social Media Link"
onChange={handleChange}
/>



<input
name="team_name"
placeholder="Team Name"
onChange={handleChange}
/>



<button>
Submit
</button>


</form>


<p>{message}</p>


</main>

);

}
