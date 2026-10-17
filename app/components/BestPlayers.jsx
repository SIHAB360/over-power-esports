"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import BestPlayerCard from "./BestPlayerCard";
import styles from "./Champions.module.css";

export default function BestPlayers() {
  const [bestPlayers, setBestPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBestPlayers();
  }, []);

  async function loadBestPlayers() {
    try {
      // 1. GET ALL ACTIVE TEAMS
      const { data: teams, error: teamError } = await supabase
        .from("teams")
        .select(`
          id,
          team_name,
          logo
        `)
        .eq("status", "active");

      if (teamError) throw teamError;

      const result = [];

      for (const team of teams) {
        // 2. GET TEAM PLAYERS
        const { data: players, error: playerError } = await supabase
          .from("players")
          .select(`
            id,
            ign,
            full_name,
            profile_image,
            avatar_url,
            primary_role
          `)
          .eq("team_id", team.id)
          .eq("status", "approved");

        if (playerError) continue;

        let ranking = [];

        // 3. GET PLAYER PERFORMANCE
        for (const player of players) {
          const { data: stats } = await supabase
            .from("match_player_stats")
            .select(`
              kills,
              damage,
              assists,
              mvp,
              placement
            `)
            .eq("player_id", player.id);

          let kills = 0;
          let damage = 0;
          let assists = 0;
          let mvp = 0;
          let wins = 0;
          const totalMatches = (stats || []).length;

          (stats || []).forEach((item) => {
            kills += Number(item.kills || 0);
            damage += Number(item.damage || 0);
            assists += Number(item.assists || 0);
            mvp += Number(item.mvp || 0);

            if (Number(item.placement) === 1) {
              wins++;
            }
          });

          // Raw Total Score
          const rawScore = kills + assists + mvp + damage;

          ranking.push({
            player: {
              id: player.id,
              ign: player.ign || player.full_name || "PLAYER",
              image:
                player.profile_image ||
                player.avatar_url ||
                "/players/default.png",
              role: player.primary_role || "PLAYER",
            },
            stats: {
              kills,
              damage,
              assists,
              mvp,
              wins,
              matches: totalMatches,
            },
            rawScore,
          });
        }

        // 4. Find the highest raw score in this team
        const maxRawScore = Math.max(...ranking.map((p) => p.rawScore), 1);

        // 5. Convert to 0-100 scale
        ranking = ranking.map((item) => ({
          ...item,
          score: Number(((item.rawScore / maxRawScore) * 100).toFixed(1)),
        }));

        // 6. Sort by score
        ranking.sort((a, b) => b.score - a.score);

        if (ranking.length) {
          result.push({
            team: {
              id: team.id,
              name: team.team_name,
              logo: team.logo,
            },
            bestPlayer: ranking[0],
          });
        }
      }

      setBestPlayers(result);
    } catch (error) {
      console.log("BEST PLAYER ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }


  return (
    <section className={styles.showcase} aria-labelledby="hall-of-champions-title">
      <div className={styles.heading}>
        <p className={styles.headingEyebrow}>
          <span className={styles.crown} aria-hidden="true">♛</span>
          OVER POWER ESPORTS
        </p>
        <h2 id="hall-of-champions-title" className={styles.title}>
          HALL OF CHAMPIONS
        </h2>
        <p className={styles.description}>Top performers. One standard.</p>
        <div className={styles.divider} aria-hidden="true" />
      </div>

      <div className={styles.grid}>
        {bestPlayers.map((item, index) => (
          <BestPlayerCard
            key={item.team.id || index}
            data={item}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
