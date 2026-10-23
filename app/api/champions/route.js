import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const WEIGHTS = Object.freeze({ kills: 0.5, assists: 0.3, damage: 0.2 });
const PAGE_SIZE = 1000;

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, no-store",
    },
  });
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function normalized(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Legacy registrations sometimes have a team_name but no team_id.
// Resolve only the site's two official rosters; never infer a squad from a
// player's name or include pending/suspended players.
function fallbackTeamId(player, teams) {
  if (player.team_id && teams.some((team) => team.id === player.team_id)) {
    return player.team_id;
  }
  if (player.team_id) return null;
  const label = normalized(player.team_name);
  if (!label) return null;
  const main = teams.find((team) => normalized(team.team_name).includes("main"));
  const elite = teams.find((team) => normalized(team.team_name).includes("elite"));
  if (label.includes("elite")) return elite?.id || null;
  if (label === "overpower" || label.includes("main")) return main?.id || null;
  const exact = teams.find((team) => normalized(team.team_name) === label);
  return exact?.id || null;
}

async function fetchAll(createQuery) {
  const rows = [];
  for (let offset = 0; offset < 100000; offset += PAGE_SIZE) {
    const { data, error } = await createQuery().range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
  throw new Error("Champion source exceeded safe read limit; ranking was not truncated.");
}

function buildRanking(team, players, totals) {
  const eligible = players
    .filter((player) => player.resolvedTeamId === team.id)
    .map((player) => {
      const stats = totals.get(team.id + ':' + player.id) || {
        kills: 0, assists: 0, damage: 0, mvp: 0, matches: 0,
      };
      return { player, stats };
    })
    // Nobody can become a champion without recorded match performance.
    .filter(({ stats }) => stats.matches > 0 && (
      stats.kills > 0 || stats.assists > 0 || stats.damage > 0
    ));

  if (!eligible.length) {
    return {
      team: { id: team.id, name: team.team_name, logo: team.logo },
      bestPlayer: null,
      eligiblePlayers: 0,
    };
  }

  const max = {
    kills: Math.max(1, ...eligible.map((item) => item.stats.kills)),
    assists: Math.max(1, ...eligible.map((item) => item.stats.assists)),
    damage: Math.max(1, ...eligible.map((item) => item.stats.damage)),
  };

  const ranked = eligible.map(({ player, stats }) => {
    // A percentage per metric makes 175,000 damage unable to overwhelm
    // the kills and assists that the user explicitly prioritizes.
    const rating =
      (stats.kills / max.kills) * WEIGHTS.kills * 100 +
      (stats.assists / max.assists) * WEIGHTS.assists * 100 +
      (stats.damage / max.damage) * WEIGHTS.damage * 100;
    return {
      player: {
        id: player.id,
        ign: player.ign || player.full_name || "PLAYER",
        image: player.profile_image || player.avatar_url || "/players/default.png",
        role: player.primary_role || "PLAYER",
      },
      stats,
      rating,
      score: Number(rating.toFixed(1)),
    };
  });

  // Deterministic tiebreaks: higher kills, then assists, then damage.
  ranked.sort((a, b) =>
    b.rating - a.rating ||
    b.stats.kills - a.stats.kills ||
    b.stats.assists - a.stats.assists ||
    b.stats.damage - a.stats.damage ||
    b.stats.matches - a.stats.matches ||
    a.player.id.localeCompare(b.player.id)
  );

  const [{ rating, ...bestPlayer }] = ranked;
  return {
    team: { id: team.id, name: team.team_name, logo: team.logo },
    bestPlayer,
    eligiblePlayers: ranked.length,
  };
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return json({ message: "Champion data source is not configured." }, 503);
    }

    // Server-only key bypasses overly restrictive public team RLS. The
    // endpoint publishes ONLY the deliberately selected public player fields.
    const db = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [teams, players, matchStats] = await Promise.all([
      fetchAll(() => db.from("teams")
        .select("id,team_name,logo,status")
        .in("status", ["active", "approved"])
        .order("team_name", { ascending: true })),
      fetchAll(() => db.from("players")
        .select("id,user_id,team_id,team_name,ign,full_name,profile_image,avatar_url,primary_role")
        .eq("status", "approved")
        .not("user_id", "is", null)),
      fetchAll(() => db.from("match_player_stats")
        .select("id,player_id,team_id_at_match,kills,assists,damage,mvp,match_id,matches!inner(status)")
        .eq("matches.status", "completed")
        .order("id", { ascending: true })),
    ]);

    const officialTeams = teams
      .filter((team) => {
        const name = normalized(team.team_name);
        return name.includes("overpower") && (name.includes("main") || name.includes("elite"));
      })
      .sort((a, b) => {
        const rank = (team) => normalized(team.team_name).includes("main") ? 0 : 1;
        return rank(a) - rank(b) || a.team_name.localeCompare(b.team_name);
      })
      .slice(0, 2);

    const eligiblePlayers = players.map((player) => ({
      ...player,
      resolvedTeamId: fallbackTeamId(player, officialTeams),
    }));
    const registeredIds = new Set(eligiblePlayers.map((player) => player.id));
    const totals = new Map();

    for (const row of matchStats) {
      if (!registeredIds.has(row.player_id) || !row.team_id_at_match) continue;
      const key = row.team_id_at_match + ':' + row.player_id;
      const current = totals.get(key) || {
        kills: 0, assists: 0, damage: 0, mvp: 0, matches: 0,
      };
      current.kills += positiveNumber(row.kills);
      current.assists += positiveNumber(row.assists);
      current.damage += positiveNumber(row.damage);
      current.mvp += row.mvp ? 1 : 0;
      current.matches += 1;
      totals.set(key, current);
    }

    return json({
      champions: officialTeams.map((team) => buildRanking(team, eligiblePlayers, totals)),
      weights: { kills: 50, assists: 30, damage: 20 },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Champion leaderboard calculation failed", error?.message || error);
    return json({ message: "Unable to update champion rankings right now." }, 500);
  }
}
