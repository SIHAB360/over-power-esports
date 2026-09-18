"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";


export default function PlayerDashboard() {

  const router = useRouter();

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    checkUser();

  }, []);




  const loadPlayer = async (userId) => {

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .single();


    if(error){

      console.log(error);
      return;

    }


    setPlayer(data);
    setLoading(false);

  };





  const checkUser = async () => {


    const {
      data:{user}
    } = await supabase.auth.getUser();



    if(!user){

      router.push("/login");
      return;

    }



    const { data:profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();



    if(profile?.role !== "player"){

      router.push("/");
      return;

    }



    loadPlayer(user.id);


  };





  if(loading){

    return (

      <main className="loading">

        Loading Player Profile...

      </main>

    );

  }





  return (

    <main className="dashboard">


      {/* HERO PROFILE */}

      <section className="hero-card">


        <div className="glow"></div>


        <img

          src={player?.profile_image}

          className="profile-image"

          alt="profile"

        />


        <h1>
          {player?.full_name}
        </h1>


        <p className="ign">
          {player?.ign}
        </p>



        <div className="badges">

          <span>
            {player?.primary_role}
          </span>

          <span>
            {player?.team_name || "Free Agent"}
          </span>

        </div>


      </section>





      {/* BASIC INFO */}

      <section className="card">


        <h2>
          PLAYER INFORMATION
        </h2>


        <div className="grid">


          <Info 
          title="FREE FIRE UID"
          value={player?.freefire_uid}
          />


          <Info
          title="COUNTRY"
          value={player?.country}
          />


          <Info
          title="AGE"
          value={player?.age}
          />


          <Info
          title="PHONE"
          value={player?.phone}
          />


          <Info
          title="JOINING DATE"
          value={player?.joining_date}
          />


          <Info
          title="PREVIOUS TEAM"
          value={player?.previous_team}
          />


        </div>


      </section>





      {/* STATS */}

      <section className="stats">


        <Stat
        title="MATCHES"
        value={player?.matches_played || 0}
        />


        <Stat
        title="WINS"
        value={player?.wins || 0}
        />


        <Stat
        title="KILLS"
        value={player?.total_kills || 0}
        />


      </section>






      {/* GAMING DETAILS */}

      <section className="card">


        <h2>
          GAMING PROFILE
        </h2>


        <div className="grid">


          <Info
          title="PRIMARY ROLE"
          value={player?.primary_role}
          />


          <Info
          title="SECONDARY ROLE"
          value={player?.secondary_role}
          />


          <Info
          title="DEVICE"
          value={player?.device}
          />


          <Info
          title="INTERNET"
          value={
            Array.isArray(player?.internet_connection)
            ?
            player.internet_connection.join(", ")
            :
            player?.internet_connection
          }
          />


          <Info
          title="PRACTICE TIME"
          value={player?.practice_time}
          />


          <Info
          title="BR KD RATE"
          value={player?.average_br_kd_rate}
          />


        </div>


      </section>






      {/* EXPERIENCE */}


      <section className="card">


        <h2>
          EXPERIENCE
        </h2>


        <p>
          Game Experience:
          <b>{player?.game_experience}</b>
        </p>


        <p>
          Tournament Experience:
          <b>{player?.tournament_experience}</b>
        </p>


      </section>






      {/* WEAPONS */}

      <section className="card">


        <h2>
          EXPERT WEAPONS
        </h2>


        <div className="tags">

          {
            Array.isArray(player?.expert_weapon)
            ?
            player.expert_weapon.map((w,i)=>(

              <span key={i}>
                {w}
              </span>

            ))
            :
            <span>
              {player?.expert_weapon}
            </span>
          }


        </div>


      </section>







      {/* SOCIAL */}

      <section className="card">


        <h2>
          SOCIAL LINKS
        </h2>


        <div className="social">


          {
            player?.facebook_link &&
            <a href={player.facebook_link}>
              Facebook
            </a>
          }


          {
            player?.instagram_link &&
            <a href={player.instagram_link}>
              Instagram
            </a>
          }


          {
            player?.tiktok_link &&
            <a href={player.tiktok_link}>
              TikTok
            </a>
          }


          {
            player?.youtube_link &&
            <a href={player.youtube_link}>
              YouTube
            </a>
          }


        </div>


      </section>






<style jsx>{`


.dashboard{

min-height:100vh;

background:
radial-gradient(circle at top,#240000,#050505 50%);

padding:50px 20px;

color:white;

display:flex;

flex-direction:column;

align-items:center;

gap:30px;

}



.hero-card,
.card,
.stat-card{


background:

rgba(255,255,255,.07);

border:

1px solid rgba(255,0,80,.3);

backdrop-filter:blur(20px);

border-radius:30px;

box-shadow:

0 0 40px rgba(255,0,70,.25);

padding:35px;

width:900px;

max-width:95%;

position:relative;

overflow:hidden;

}




.glow{

position:absolute;

width:250px;

height:250px;

background:red;

filter:blur(120px);

top:-80px;

right:-50px;

}




.profile-image{

width:150px;

height:150px;

border-radius:50%;

object-fit:cover;

border:4px solid #ff1744;

box-shadow:0 0 40px red;

}



.hero-card{

text-align:center;

}



.hero-card h1{

font-size:42px;

}



.ign{

font-size:22px;

color:#00ff99;

}



.badges span,
.tags span{


display:inline-block;

padding:10px 20px;

margin:8px;

border-radius:20px;

background:#ff1744;

font-weight:bold;

}



.grid{


display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

}



.grid div{


background:#0008;

padding:20px;

border-radius:15px;


}



.grid span{

display:block;

color:#aaa;

font-size:12px;

}



.stats{


display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

width:900px;

max-width:95%;

}



.stat-card{

text-align:center;

}



.stat-card h2{

font-size:45px;

color:#00ff99;

}



a{

color:white;

text-decoration:none;

background:#111;

padding:12px 20px;

border-radius:20px;

margin:5px;

display:inline-block;

}



.loading{

height:100vh;

background:#050505;

color:white;

display:flex;

justify-content:center;

align-items:center;

font-size:30px;

}



@media(max-width:700px){

.grid,
.stats{

grid-template-columns:1fr;

}


.hero-card h1{

font-size:30px;

}

}



`}</style>


    </main>

  );

}





function Info({title,value}){

return(

<div>

<span>{title}</span>

<strong>
{value || "N/A"}
</strong>

</div>

);

}





function Stat({title,value}){

return(

<div className="stat-card">

<p>
{title}
</p>

<h2>
{value}
</h2>

</div>

);

}
