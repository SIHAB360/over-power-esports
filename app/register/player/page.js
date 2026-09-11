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


const [profileImage,setProfileImage] = useState(null);
const [gameScreenshot,setGameScreenshot] = useState(null);

const [message,setMessage]=useState("");



function handleChange(e){

setForm({
...form,
[e.target.name]:e.target.value
});

}



function handleWeapon(e){

setForm({
...form,
expert_weapon:e.target.value
});

}



async function submit(e){

e.preventDefault();


const formData = new FormData();



Object.keys(form).forEach((key)=>{

formData.append(key,form[key]);

});



if(profileImage){

formData.append(
"profile_image",
profileImage
);

}



if(gameScreenshot){

formData.append(
"game_id_screenshot",
gameScreenshot
);

}



const res = await fetch("/api/register-player",{

method:"POST",

body:formData

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



<label>
Birth Date
</label>

<input 
type="date"
name="birth_date"
onChange={handleChange}
/>




<h3>Primary Role</h3>


<label>
<input type="radio" name="primary_role" value="1st Rusher" onChange={handleChange}/>
1st Rusher
</label>


<label>
<input type="radio" name="primary_role" value="2nd Rusher" onChange={handleChange}/>
2nd Rusher
</label>


<label>
<input type="radio" name="primary_role" value="Supporter" onChange={handleChange}/>
Supporter
</label>


<label>
<input type="radio" name="primary_role" value="All Rounder" onChange={handleChange}/>
All Rounder
</label>


<label>
<input type="radio" name="primary_role" value="Sniper" onChange={handleChange}/>
Sniper
</label>





<h3>Secondary Role</h3>


<label>
<input type="radio" name="secondary_role" value="1st Rusher" onChange={handleChange}/>
1st Rusher
</label>


<label>
<input type="radio" name="secondary_role" value="Supporter" onChange={handleChange}/>
Supporter
</label>


<label>
<input type="radio" name="secondary_role" value="Boomber" onChange={handleChange}/>
Boomber
</label>


<label>
<input type="radio" name="secondary_role" value="Sniper" onChange={handleChange}/>
Sniper
</label>





<input name="device" placeholder="Device" onChange={handleChange}/>


<input name="internet_connection" placeholder="Internet Connection" onChange={handleChange}/>


<input name="practice_time" placeholder="Practice Time" onChange={handleChange}/>


<input name="game_experience" placeholder="Game Experience" onChange={handleChange}/>


<input name="tournament_experience" placeholder="Tournament Experience" onChange={handleChange}/>



<label>
Joining Date
</label>

<input 
type="date"
name="joining_date"
onChange={handleChange}
/>




<input name="average_br_kd_rate" placeholder="Average BR K/D Rate" onChange={handleChange}/>




<h3>Expert Weapon</h3>


<label>
<input type="checkbox" value="M590" onChange={handleWeapon}/>
M590
</label>


<label>
<input type="checkbox" value="Woodpecker" onChange={handleWeapon}/>
Woodpecker
</label>


<label>
<input type="checkbox" value="MAG7" onChange={handleWeapon}/>
MAG7
</label>


<label>
<input type="checkbox" value="AWM" onChange={handleWeapon}/>
AWM
</label>




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



<h3>Profile Image</h3>

<input
type="file"
accept="image/*"
onChange={(e)=>setProfileImage(e.target.files[0])}
/>



<h3>Game ID Screenshot</h3>

<input
type="file"
onChange={(e)=>setGameScreenshot(e.target.files[0])}
/>




<button>
Submit
</button>



</form>



<p>
{message}
</p>



</main>

);

}
