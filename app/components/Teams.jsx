"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";



/* =========================================================
   HELPERS
========================================================= */


function resolveTeamName(teamName) {

  const value =
    String(teamName || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");


  if (!value) {
    return "OVER POWER ESPORTS";
  }


  if (value.includes("elite")) {
    return "OVER POWER ELITE";
  }


  if (
    value.includes("main") ||
    value === "overpower"
  ) {
    return "OVER POWER MAIN TEAM";
  }


  return String(teamName)
    .trim()
    .toUpperCase();

}



function canShowPublicly(player) {

  const status =
    String(player.status || "")
      .toLowerCase()
      .trim();


  if (
    status === "pending" ||
    status === "rejected" ||
    status === "inactive" ||
    status === "suspended"
  ) {

    return false;

  }


  return true;

}




/* =========================================================
   COMPONENT
========================================================= */


export default function Teams() {


  const [teams, setTeams] =
    useState([]);


  const [management, setManagement] =
    useState([]);



  useEffect(() => {

    loadRegisteredPlayers();

    loadManagement();

  }, []);





  async function loadRegisteredPlayers() {


    const {
      data,
      error
    } = await supabase
      .from("players")
      .select(`
        id,
        full_name,
        ign,
        profile_image,
        avatar_url,
        primary_role,
        team_name,
        facebook_link,
        instagram_link,
        youtube_link,
        tiktok_link,
        status
      `)
      .order(
        "created_at",
        {
          ascending:true,
        }
      );



    if(error){

      console.error(
        "PLAYER LOAD ERROR:",
        error
      );

      return;

    }




    const groupedTeams = {};



    (data || [])
      .filter(canShowPublicly)
      .forEach((player)=>{


        const teamName =
          resolveTeamName(
            player.team_name
          );



        if(!groupedTeams[teamName]){

          groupedTeams[teamName] = {

            name: teamName,

            slogan:
              "POWER • UNITY • DOMINATION",

            players: [],

          };

        }




        groupedTeams[teamName]
          .players
          .push({

            id:
              player.id,


            name:
              player.ign ||
              player.full_name ||
              "PLAYER",


            role:
              player.primary_role ||
              "PLAYER",


            image:
              player.profile_image ||
              player.avatar_url ||
              "/players/default.png",


            social: {

              facebook:
                player.facebook_link || "",

              instagram:
                player.instagram_link || "",

              youtube:
                player.youtube_link || "",

              tiktok:
                player.tiktok_link || "",

            },

          });


      });



    setTeams(
      Object.values(groupedTeams)
    );


  }






  async function loadManagement() {


    const {
      data,
      error
    } = await supabase
      .from("team_management")
      .select("*")
      .order(
        "created_at",
        {
          ascending:true,
        }
      );



    if(error){

      console.error(
        "MANAGEMENT LOAD ERROR:",
        error
      );

      return;

    }



    setManagement(
      data || []
    );


  }
    return (

    <section className="teams">


      <div className="teams-title">

        <h2>
          OUR TEAMS
        </h2>

        <div className="title-line"></div>

        <p>
          POWER • UNITY • DOMINATION
        </p>

      </div>





      {
        teams.map(
          (team,index)=>(

          <div
            className="team-block"
            key={`${team.name}-${index}`}
          >


            <h3>
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
                        src={
                          player.image
                        }
                        alt={
                          player.name
                        }
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
                          href={
                            player.social.facebook
                          }
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
                          href={
                            player.social.instagram
                          }
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
                          href={
                            player.social.youtube
                          }
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
                          href={
                            player.social.tiktok
                          }
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





      {
        management.length > 0 && (

        <div className="team-block management-section">


          <h3>
            TEAM MANAGEMENT
          </h3>


          <p>
            POWER • UNITY • LEADERSHIP
          </p>




          <div className="team-players">


          {
            management.map(
              (person)=>(


              <div
                className="player-card"
                key={person.id}
              >


                <div className="player-image">


                  <img
                    src={
                      person.image ||
                      "/players/default.png"
                    }
                    alt={
                      person.name
                    }
                  />


                </div>




                <h4>
                  {person.name}
                </h4>




                <span>
                  {person.role}
                </span>





                <div className="social-links">


                  {
                    person.facebook_link && (

                    <a
                      href={
                        person.facebook_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="facebook"
                    >

                      <FaFacebookF />

                    </a>

                    )
                  }





                  {
                    person.instagram_link && (

                    <a
                      href={
                        person.instagram_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="instagram"
                    >

                      <FaInstagram />

                    </a>

                    )
                  }




                  {
                    person.youtube_link && (

                    <a
                      href={
                        person.youtube_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="youtube"
                    >

                      <FaYoutube />

                    </a>

                    )
                  }




                  {
                    person.tiktok_link && (

                    <a
                      href={
                        person.tiktok_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tiktok"
                    >

                      <FaTiktok />

                    </a>

                    )
                  }



                </div>



              </div>


              )

            )

          }


          </div>


        </div>

        )
      }




    </section>

  );


}
