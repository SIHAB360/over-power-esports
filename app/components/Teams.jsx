"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {FaFacebookF,FaInstagram,FaYoutube,FaTiktok} from "react-icons/fa";

export default function Teams(){
 const [teams,setTeams]=useState([]);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  let alive=true;
  const load=async()=>{
   try{
    const result=await fetch('/api/public/squads',{cache:'no-store'});
    if(!result.ok)throw Error('Public squads temporarily unavailable');
    const data=await result.json();
    if(alive)setTeams((data.teams||[]).map(team=>({
     ...team,slogan:'আমাদের (অরা) একটু বেশি'
    })));
   }catch(e){console.warn('Squad display refresh unavailable',e.message)}
   finally{if(alive)setLoading(false)}
  };
  load();
  const refresh=()=>{if(document.visibilityState==='visible')void load()};
  const timer=setInterval(refresh,30000);
  window.addEventListener('focus',refresh);
  return()=>{alive=false;clearInterval(timer);window.removeEventListener('focus',refresh)};
 },[]);

  return (

<section className="teams">


<div className="teams-title">

<h2>
OUR TEAMS
</h2>


<div className="title-line"></div>


<p>
আমাদের (অরা) একটু বেশি
</p>


</div>
  {loading && <p role="status" style={{textAlign:"center",color:"#bfeafa"}}>Loading squad roster…</p>}
  {
  teams.map(
    (team,index)=>(

      <div
        className="team-block"
        key={`${team.name}-${index}`}
      >

        <h3 className={team.name.includes("ELITE") ? "team-name team-name-elite" : "team-name team-name-main"}>
          {team.name}
        </h3>


        <p>
          {team.slogan}
        </p>



        <div className="team-players">


        {
          team.players.map(
            (player,i)=>(


              <div
                className="player-card"
                key={
                  player.id ||
                  `${player.name}-${i}`
                }
              >



                <div className="player-image">

                  <img
                    src={player.image}
                    alt={player.name}
                  />

                </div>



                <h4>
                  {player.name}
                </h4>



                <span>
                  {player.role}
                </span>




                <div className="social-links">


                {
                  player.social.facebook && (

                    <a
                      href={player.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="facebook"
                    >

                      <FaFacebookF />

                    </a>

                  )
                }




                {
                  player.social.instagram && (

                    <a
                      href={player.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="instagram"
                    >

                      <FaInstagram />

                    </a>

                  )
                }




                {
                  player.social.youtube && (

                    <a
                      href={player.social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="youtube"
                    >

                      <FaYoutube />

                    </a>

                  )
                }




                {
                  player.social.tiktok && (

                    <a
                      href={player.social.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tiktok"
                    >

                      <FaTiktok />

                    </a>

                  )
                }


                </div>





                <Link
                  href={`/players/${player.id}`}
                  className="profile-btn"
                >

                  VIEW PROFILE

                </Link>



              </div>


            )

          )

        }


        </div>



      </div>

    )

  )

}



</section>


  );

}
