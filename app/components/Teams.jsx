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
   CURRENT MANUAL PLAYERS

   এগুলো এখন যেমন আছে তেমনই থাকবে।
   ভবিষ্যতের Supabase player-গুলো automatic add হবে।
========================================================= */

const DEFAULT_TEAMS = [
  {
    name: "OVER POWER MAIN TEAM",
    slogan: "Born To Dominate",

    players: [
      {
        name: "APPELO",
        role: "PRIMARY",
        image: "/players/appelo.png",
        position: "center 35%",

        social: {
          facebook:
            "https://www.facebook.com/share/19XKoR58cb/",
          instagram:
            "https://www.instagram.com/_appelo_ff",
          youtube:
            "https://youtube.com/@appelo_ff",
          tiktok:
            "https://www.tiktok.com/@appelo_offical_",
        },
      },

      {
        name: "OGGY",
        role: "SECONDARY",
        image: "/players/oggy.png",
        position: "center 30%",

        social: {
          facebook:
            "https://www.facebook.com/share/1JEkiAK2J6/",
          instagram:
            "https://www.instagram.com/being_ogggyy",
          youtube:
            "https://youtube.com/@being_ogggyy",
          tiktok:
            "https://www.tiktok.com/@being_ogggyy",
        },
      },

      {
        name: "ITACHIx",
        role: "BOMBER",
        image: "/players/itachix.png",
        position: "center 35%",

        social: {
          facebook:
            "https://www.facebook.com/profile.php?id=61590102347309",
          instagram: "",
          youtube:
            "https://youtube.com/@itachiontop-r2p",
          tiktok:
            "https://www.tiktok.com/@itachix074",
        },
      },

      {
        name: "REJWAN",
        role: "IGL+SUPPORTER",
        image: "/players/rejwan.png",
        position: "center 35%",

        social: {
          facebook:
            "https://www.facebook.com/rejwan.ahammed11",
          instagram:
            "https://www.instagram.com/rahammed_",
          youtube:
            "https://youtube.com/@rejwan-ff6711",
          tiktok:
            "https://www.tiktok.com/@rejwanahammed",
        },
      },

      {
        name: "FixFIRE",
        role: "SNIPER",
        image: "/players/fixfire.png",
        position: "center 25%",

        social: {
          facebook:
            "https://www.facebook.com/share/1DYEWmWzRr/",
          instagram:
            "https://www.instagram.com/xr_jisan09",
          youtube:
            "https://www.youtube.com/@fixfire09",
          tiktok:
            "https://tiktok.com/@fixfire09",
        },
      },
    ],
  },

  {
    name: "OVER POWER ELITE",
    slogan: "Victory Is Our Language",

    players: [
      {
        name: "FOYSAL",
        role: "PRIMARY",
        image: "/players/rfntc.png",
        position: "center top",

        social: {
          facebook: "",
          instagram: "",
          youtube: "",
          tiktok: "",
        },
      },

      {
        name: "JELLAL",
        role: "SECONDARY",
        image: "/players/jellal.png",
        position: "center 15%",

        social: {
          facebook:
            "https://www.facebook.com/ew.r.sawon.739315",
          instagram:
            "https://www.instagram.com/sgr100m?stkn=NjFqMDVyamx3OGth",
          youtube:
            "https://youtube.com/@sgr100m?si=dPon0FOtSGuXmpbo",
          tiktok: "",
        },
      },

      {
        name: "SOJIB",
        role: "BOMBER",
        image: "/players/sojib.png",
        position: "center top",

        social: {
          facebook: "",
          instagram: "",
          youtube: "",
          tiktok: "",
        },
      },

      {
        name: "NAFIZ",
        role: "SUPPORTER",
        image: "/players/nafiz.jpeg",
        position: "center 20%",

        social: {
          facebook:
            "https://www.facebook.com/share/1FrtytpbHg/",
          instagram:
            "https://www.instagram.com/nxe_nafiz_00?stkn=MWVpNHd3OTg5bGZ1Yg==",
          youtube:
            "https://www.youtube.com/@MdBijoy-t7m",
          tiktok:
            "https://www.tiktok.com/@md.bijoy4059?_r=1&_t=ZS-99aN1LHLXrc",
        },
      },

      {
        name: "BAYMAX",
        role: "SNIPER",
        image: "/players/baymax.png",
        position: "center top",

        social: {
          facebook:
            "https://www.facebook.com/share/18E6u8Mo18/",
          instagram:
            "https://www.instagram.com/_mhs_1037?stkn=eTRybnAyb2c1Zmxn",
          youtube:
            "https://youtube.com/@mhsgaming211?si=3JJBWuI_a_a5KRpt",
          tiktok: "",
        },
      },
    ],
  },
];


/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}


function resolveTeamName(teamName) {
  const value = normalize(teamName);

  if (!value) {
    return "";
  }

  if (value.includes("elite")) {
    return "OVER POWER ELITE";
  }

  if (
    value === "overpower" ||
    value.includes("main")
  ) {
    return "OVER POWER MAIN TEAM";
  }

  return String(teamName).trim().toUpperCase();
}


function playerAlreadyExists(players, dbPlayer) {
  const dbIgn = normalize(dbPlayer.ign);
  const dbName = normalize(dbPlayer.full_name);

  return players.some((player) => {
    const currentName = normalize(player.name);

    if (!currentName) {
      return false;
    }

    return (
      currentName === dbIgn ||
      currentName === dbName ||
      dbIgn.includes(currentName) ||
      currentName.includes(dbIgn)
    );
  });
}


function canShowPublicly(player) {
  const status = String(
    player.status || ""
  )
    .toLowerCase()
    .trim();

  /*
    Pending / rejected / inactive players
    homepage-এ show হবে না।
  */

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
    useState(DEFAULT_TEAMS);


  useEffect(() => {
    loadRegisteredPlayers();
  }, []);


  async function loadRegisteredPlayers() {
    const { data, error } = await supabase
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
        status,
        verified
      `)
      .order("created_at", {
        ascending: true,
      });


    if (error) {
      console.error(
        "PUBLIC PLAYERS LOAD ERROR:",
        error
      );

      /*
        Supabase error হলেও manual
        current roster ঠিকভাবে থাকবে।
      */

      return;
    }


    const databasePlayers =
      (data || []).filter(
        canShowPublicly
      );


    setTeams(() => {
      /*
        Manual data clone করা হচ্ছে।
      */

      const updatedTeams =
        DEFAULT_TEAMS.map((team) => ({
          ...team,

          players: team.players.map(
            (player) => ({
              ...player,

              social: {
                ...player.social,
              },
            })
          ),
        }));


      databasePlayers.forEach(
        (dbPlayer) => {
          const resolvedTeam =
            resolveTeamName(
              dbPlayer.team_name
            );


          if (!resolvedTeam) {
            return;
          }


          let team = updatedTeams.find(
            (item) =>
              normalize(item.name) ===
              normalize(resolvedTeam)
          );


          /*
            ভবিষ্যতে নতুন team থাকলেও
            automatic section তৈরি হবে।
          */

          if (!team) {
            team = {
              name: resolvedTeam,

              slogan:
                "OVER POWER ESPORTS",

              players: [],
            };

            updatedTeams.push(team);
          }


          /*
            বর্তমান manual player database-এও
            থাকলে duplicate card তৈরি হবে না।
          */

          if (
            playerAlreadyExists(
              team.players,
              dbPlayer
            )
          ) {
            return;
          }


          team.players.push({
            /*
              New registered player-এর
              public identity Supabase থেকে।
            */

            id: dbPlayer.id,

            name:
              dbPlayer.ign ||
              dbPlayer.full_name ||
              "PLAYER",

            role:
              dbPlayer.primary_role ||
              "PLAYER",

            image:
              dbPlayer.profile_image ||
              dbPlayer.avatar_url ||
              "/players/default.png",

            position: "center",

            dynamic: true,

            social: {
              facebook:
                dbPlayer.facebook_link ||
                "",

              instagram:
                dbPlayer.instagram_link ||
                "",

              youtube:
                dbPlayer.youtube_link ||
                "",

              tiktok:
                dbPlayer.tiktok_link ||
                "",
            },
          });
        }
      );


      return updatedTeams;
    });
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


      {teams.map(
        (team, index) => (
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
              {team.players.map(
                (player, i) => {
                  /*
                    NEW DATABASE PLAYER:
                    /players/UUID

                    CURRENT MANUAL PLAYER:
                    /players/itachix
                    /players/baymax
                    etc.
                  */

                  const profileUrl =
                    player.dynamic &&
                    player.id
                      ? `/players/${player.id}`
                      : `/players/${player.name.toLowerCase()}`;


                  return (
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
                          style={{
                            objectPosition:
                              player.position ||
                              "center",
                          }}
                        />
                      </div>


                      <h4>
                        {player.name}
                      </h4>


                      <span>
                        {player.role}
                      </span>


                      <div className="social-links">
                        {player.social
                          .facebook && (
                          <a
                            href={
                              player.social
                                .facebook
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="facebook"
                            aria-label={`${player.name} Facebook`}
                          >
                            <FaFacebookF />
                          </a>
                        )}


                        {player.social
                          .instagram && (
                          <a
                            href={
                              player.social
                                .instagram
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="instagram"
                            aria-label={`${player.name} Instagram`}
                          >
                            <FaInstagram />
                          </a>
                        )}


                        {player.social
                          .youtube && (
                          <a
                            href={
                              player.social
                                .youtube
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="youtube"
                            aria-label={`${player.name} YouTube`}
                          >
                            <FaYoutube />
                          </a>
                        )}


                        {player.social
                          .tiktok && (
                          <a
                            href={
                              player.social
                                .tiktok
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tiktok"
                            aria-label={`${player.name} TikTok`}
                          >
                            <FaTiktok />
                          </a>
                        )}
                      </div>


                      <Link
                        href={profileUrl}
                        className="profile-btn"
                      >
                        VIEW PROFILE
                      </Link>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )
      )}
    </section>
  );
}
