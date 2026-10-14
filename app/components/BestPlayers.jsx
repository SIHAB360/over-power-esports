"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";


export default function BestPlayers(){

  const [bestPlayers,setBestPlayers] = useState([]);
  const [loading,setLoading] = useState(true);



  useEffect(()=>{

    loadBestPlayers();

  },[]);



  async function loadBestPlayers(){


    try{


      /*
        1. GET ALL ACTIVE TEAMS
      */


      const {
        data:teams,
        error:teamError

      } = await supabase

      .from("teams")

      .select(`
        id,
        team_name,
        logo
      `)

      .eq(
        "status",
        "active"
      );



      if(teamError)
      throw teamError;



      const result=[];



      /*
        LOOP EACH TEAM
      */


      for(const team of teams){



        /*
          2. GET TEAM PLAYERS
        */


        const {

          data:players,
          error:playerError


        } = await supabase


        .from("players")


        .select(`

          id,
          ign,
          full_name,
          profile_image,
          avatar_url,
          primary_role

        `)


        .eq(

          "team_id",

          team.id

        )

        .eq(

          "status",

          "approved"

        );



        if(playerError)
        continue;




        let ranking=[];




        /*
          3. GET PLAYER PERFORMANCE
        */


        for(const player of players){



          const {

            data:stats


          } = await supabase


          .from("match_player_stats")


          .select(`

            kills,
            damage,
            assists,
            mvp,
            placement

          `)


          .eq(

            "player_id",

            player.id

          );




          let kills=0;

          let damage=0;

          let assists=0;

          let mvp=0;

          let wins=0;




          (stats || [])

          .forEach(item=>{


            kills += Number(item.kills || 0);

            damage += Number(item.damage || 0);

            assists += Number(item.assists || 0);

            mvp += Number(item.mvp || 0);


            if(

              Number(item.placement) === 1

            ){

              wins++;

            }


          });






          /*
            PERFORMANCE SCORE
          */


          const score =

          (

            kills * 0.40

          )

          +

          (

            damage * 0.0025

          )

          +

          (

            assists * 0.10

          )

          +

          (

            mvp * 5

          )

          +

          (

            wins * 3

          );






          ranking.push({


            player:{


              id:player.id,


              ign:

              player.ign ||

              player.full_name ||


              "PLAYER",



              image:

              player.profile_image ||

              player.avatar_url ||


              "/players/default.png",



              role:

              player.primary_role ||


              "PLAYER",


            },


            stats:{


              kills,

              damage,

              assists,

              mvp,

              wins,


            },


            score:

            Number(score.toFixed(2))


          });



        }





        /*
          4. SORT TOP PLAYER
        */


        ranking.sort(

          (a,b)=>

          b.score-a.score

        );





        if(ranking.length){


          result.push({


            team:{


              id:team.id,


              name:

              team.team_name,


              logo:

              team.logo,


            },


            bestPlayer:

            ranking[0]


          });



        }




      }





      setBestPlayers(result);



    }


    catch(error){


      console.log(

        "BEST PLAYER ERROR",

        error

      );


    }


    finally{


      setLoading(false);


    }


  }




  if(loading){

    return null;

  }



  return null;


}
