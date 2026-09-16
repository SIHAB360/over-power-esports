"use client";

import { supabase } from "../../../lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


export default function PlayerProfilePage(){

const params = useParams();

const id = params.id;


const [player,setPlayer] = useState(null);
const [loading,setLoading] = useState(true);



useEffect(()=>{

if(id){
fetchPlayer();
}

},[id]);




const fetchPlayer = async()=>{

const {data,error}=await supabase
.from("players")
.select("*")
.eq("id",id)
.single();


console.log("PLAYER DATA:",data);
console.log("PLAYER ERROR:",error);


if(!error){

setPlayer(data);

}


setLoading(false);

};





if(loading){

return(

<div className="loading">

LOADING PLAYER...

</div>

)

}




if(!player){

return(

<div className="loading">

PLAYER NOT FOUND

</div>

)

}




return(

<main className="page">


<div className="profile-container">



<section className="hero">



<div className="image-box">

<img

src={
player.profile_image ||
player.avatar_url ||
"/default.png"
}

/>

</div>





<div className="hero-info">


<h1>

{player.ign || player.full_name}

</h1>


<h3>

{player.primary_role || player.position || "PLAYER"}

</h3>


<p>

TEAM : {player.team_name || "NO TEAM"}

</p>



</div>


</section>






<section className="stats">


<Stat
title="MATCHES"
value={player.matches_played || 0}
/>


<Stat
title="WINS"
value={player.wins || 0}
/>


<Stat
title="STATUS"
value={player.status || "pending"}
className={player.status}
/>



</section>






<InfoSection title="PLAYER INFORMATION">


<Row title="NAME" value={player.full_name}/>

<Row title="FREE FIRE UID" value={player.freefire_uid}/>

<Row title="EMAIL" value={player.email}/>

<Row title="PHONE" value={player.phone}/>

<Row title="COUNTRY" value={player.country}/>

<Row title="AGE" value={player.age}/>

<Row title="EXPERIENCE" value={player.experience}/>


</InfoSection>







<InfoSection title="GAME DETAILS">


<Row title="PRIMARY ROLE" value={player.primary_role}/>

<Row title="SECONDARY ROLE" value={player.secondary_role}/>

<Row title="DEVICE" value={player.device}/>

<Row title="INTERNET" value={player.internet_connection}/>

<Row title="PRACTICE TIME" value={player.practice_time}/>

<Row title="GAME EXPERIENCE" value={player.game_experience}/>

<Row title="TOURNAMENT EXPERIENCE" value={player.tournament_experience}/>

<Row title="BR KD RATE" value={player.average_br_kd_rate}/>

<Row title="EXPERT WEAPON" value={player.expert_weapon}/>


</InfoSection>






<InfoSection title="TEAM HISTORY">


<Row title="PREVIOUS TEAM" value={player.previous_team}/>

<Row title="JOINING DATE" value={player.joining_date}/>


</InfoSection>






<section className="social">


<h2>
SOCIAL LINKS
</h2>


<div>


{player.facebook_link &&
<a href={player.facebook_link}>
FACEBOOK
</a>
}



{player.instagram_link &&
<a href={player.instagram_link}>
INSTAGRAM
</a>
}



{player.youtube_link &&
<a href={player.youtube_link}>
YOUTUBE
</a>
}



{player.tiktok_link &&
<a href={player.tiktok_link}>
TIKTOK
</a>
}



</div>


</section>





</div>
</main>

)

}





function InfoSection({title,children}){

return(

<section className="info-section">

<h2>
{title}
</h2>

<div className="rows">

{children}

</div>

</section>

)

}





function Row({title,value}){

return(

<div className="row">

<span>
{title}
</span>


<strong>
{value || "N/A"}
</strong>


</div>

)

}





function Stat({title,value,className=""}){

return(

<div className="stat-card">

<span>
{title}
</span>

<strong className={className}>
{value}
</strong>

</div>

)

}
