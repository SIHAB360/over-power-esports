"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import BestPlayerCard from "./BestPlayerCard";

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

          // Win Rate (%)
          const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

          /*
            ================================
            BEST PLAYER SCORE FORMULA
            ================================
            (Kills × 40%)
            + (Damage × 25%)
            + (Win Rate × 20%)
            + (Assist × 10%)
            + (MVP Count × 5%)
          */
          const rawScore =
            kills * 0.4 +
            damage * 0.25 +
            winRate * 0.2 +
            assists * 0.1 +
            mvp * 0.05;

          // Score cap 0-100
          const score = Math.min(100, Number(rawScore.toFixed(1)));

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
              winRate: Number(winRate.toFixed(1)),
              matches: totalMatches,
            },
            score: Number(score.toFixed(1)),
          });
        }

        // 4. SORT TOP PLAYER
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
    <section className="best-players">
      <div className="section-title">
        <div className="trophy">🏆</div>
        <h2>THE ELITE LEGENDS</h2>
        <h3>
          BEST PLAYERS OF
          <br />
          OVER POWER ESPORTS
        </h3>
        <p>আমাদের (অরা) একটু বেশি</p>
      </div>

      <div className="best-grid">
        {bestPlayers.map((item, index) => (
          <BestPlayerCard key={item.team.id || index} data={item} />
        ))}
      </div>

      <style jsx>{`
        .best-players {
          padding: 100px 30px;
          background: radial-gradient(
            circle at top,
            rgba(255, 215, 74, 0.12),
            transparent 35%
          );
        }

        .section-title {
          text-align: center;
          margin-bottom: 80px;
        }

        .trophy {
          font-size: 55px;
          filter: drop-shadow(0 0 25px #ffd54a);
          animation: float 3s infinite ease-in-out;
        }

        .section-title h2 {
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 4px;
          background: linear-gradient(90deg, #ffd54a, #ff1744, #ffd54a);
          -webkit-background-clip: text;
          color: transparent;
          text-shadow: 0 0 40px rgba(255, 215, 74, 0.4);
        }

        .section-title h3 {
          font-size: 22px;
          color: white;
          letter-spacing: 4px;
          margin-top: 15px;
        }

        .section-title p {
          color: #00f5ff;
          letter-spacing: 3px;
        }

        @keyframes float {
          50% {
            transform: translateY(-10px);
          }
        }

        .best-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: auto;
        }

        @media (max-width: 600px) {
          .section-title h2 {
            font-size: 32px;
          }
          .best-players {
            padding: 60px 20px;
          }
        }
      `}</style>
    </section>
  );
}
