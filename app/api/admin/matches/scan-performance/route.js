import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });

function normalizeIgn(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\u115F\u1160\u200B-\u200D\u3164\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

// Free Fire names often use decorative characters, while OCR can confuse
// visually similar Latin letters and digits. Keep the original normalizer
// for exact matching, then use this conservative second pass.
function normalizeIgnForOcr(value) {
  return normalizeIgn(value)
    .replace(/ø/g, "o")
    .replace(/[0o]/g, "o")
    .replace(/[1il]/g, "i")
    .replace(/[5s]/g, "s")
    .replace(/[8b]/g, "b")
    .replace(/[2z]/g, "z");
}

function editDistance(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  return 1 - editDistance(a, b) / Math.max(a.length, b.length, 1);
}

function rosterMatchScore(recognizedIgn, player) {
  const target = normalizeIgn(recognizedIgn);
  const ocrTarget = normalizeIgnForOcr(recognizedIgn);
  const alias = normalizeIgn(player.ign);
  const ocrAlias = normalizeIgnForOcr(player.ign);
  if (!target || !alias) return 0;
  if (target === alias) return 1;
  if (ocrTarget === ocrAlias) return 0.97;
  if (alias.length >= 6 && (target.includes(alias) || ocrTarget.includes(ocrAlias))) return 0.95;
  const recognizedTokens = String(recognizedIgn || "").split(/\s+/).map(normalizeIgn).filter(Boolean);
  const playerTokens = String(player.ign || "").split(/\s+/).map(normalizeIgn).filter(Boolean);
  if (playerTokens.length > 1 && playerTokens.length <= recognizedTokens.length) {
    for (let index = 0; index <= recognizedTokens.length - playerTokens.length; index += 1) {
      const window = recognizedTokens.slice(index, index + playerTokens.length).join("");
      if (window === alias) return 0.96;
      if (normalizeIgnForOcr(window) === ocrAlias) return 0.94;
    }
  }
  return Math.max(similarity(target, alias), similarity(ocrTarget, ocrAlias));
}

function findRosterPlayer(recognizedIgn, candidates) {
  const target = normalizeIgn(recognizedIgn);
  if (!target) return null;
  const ranked = candidates
    .map((player) => ({ player, score: rosterMatchScore(recognizedIgn, player) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const second = ranked[1];
  if (best?.score === 1) {
    return ranked.filter((item) => item.score === 1).length === 1 ? { ...best, method: "exact" } : null;
  }
  if (best?.score >= 0.94 && (!second || best.score - second.score >= 0.03)) {
    return { ...best, method: "ocr-normalized" };
  }
  if (best?.score >= 0.84 && (!second || best.score - second.score >= 0.08)) {
    return { ...best, method: "fuzzy" };
  }
  return null;
}

function suggestRosterPlayer(recognizedIgn, candidates) {
  const ranked = candidates
    .map((player) => ({ player, score: rosterMatchScore(recognizedIgn, player) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const second = ranked[1];
  if (!best || best.score < 0.45 || (second && best.score - second.score < 0.08)) return null;
  return { ign: best.player.ign, score: Math.round(best.score * 100) };
}
function parseCount(value) {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[,_\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  const number = Number(cleaned);
  return Number.isSafeInteger(number) && number >= 0 && number <= 100000 ? number : null;
}

function normalizeHeader(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function wordCenter(word, axis) {
  const box = word?.bbox || {};
  const start = axis === "x" ? Number(box.x0) : Number(box.y0);
  const end = axis === "x" ? Number(box.x1) : Number(box.y1);
  return ((Number.isFinite(start) ? start : 0) + (Number.isFinite(end) ? end : 0)) / 2;
}

function nearestNumber(words, x, maxDistance) {
  if (x === null || x === undefined) return null;
  const candidates = words
    .map((word) => ({
      value: parseOcrNumber(word.text),
      distance: Math.abs(wordCenter(word, "x") - x),
      confidence: Number(word.confidence) || 0,
    }))
    .filter((item) => item.value !== null && item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance || b.confidence - a.confidence);
  return candidates[0]?.value ?? null;
}

function collectOcrLines(ocrData) {
  if (Array.isArray(ocrData?.lines) && ocrData.lines.length) return ocrData.lines;
  const collected = [];
  for (const block of ocrData?.blocks || []) {
    for (const paragraph of block?.paragraphs || []) {
      for (const line of paragraph?.lines || []) collected.push(line);
    }
  }
  return collected;
}

function groupWordsByY(lines) {
  const words = lines.flatMap((line) => Array.isArray(line?.words) ? line.words : [])
    .filter((word) => String(word?.text || "").trim());
  if (!words.length) return [];

  const heights = words.map((word) => Math.abs(Number(word?.bbox?.y1) - Number(word?.bbox?.y0)))
    .filter((height) => Number.isFinite(height) && height > 0)
    .sort((a, b) => a - b);
  const medianHeight = heights.length ? heights[Math.floor(heights.length / 2)] : 10;
  const rowTolerance = Math.max(7, Math.min(36, medianHeight * 1.6));
  const sorted = [...words].sort((a, b) => wordCenter(a, "y") - wordCenter(b, "y"));
  const groups = [];

  for (const word of sorted) {
    const y = wordCenter(word, "y");
    let group = groups[groups.length - 1];
    if (!group || y - group.anchorY > rowTolerance) {
      groups.push({ anchorY: y, words: [word] });
    } else {
      group.words.push(word);
    }
  }

  return groups.map((group) => {
    const centers = group.words.map((word) => wordCenter(word, "y"));
    return {
      words: group.words.sort((a, b) => wordCenter(a, "x") - wordCenter(b, "x")),
      centerY: centers.reduce((sum, value) => sum + value, 0) / centers.length,
    };
  });
}

function extractScoreboard(ocrData) {
  const lines = collectOcrLines(ocrData);
  const bands = groupWordsByY(lines);
  const killHeaders = new Set(["K", "KILL", "KILLS", "ELIM", "ELIMS", "ELIMINATION", "ELIMINATIONS"]);
  const assistHeaders = new Set(["A", "AST", "ASSIST", "ASSISTS"]);
  const damageHeaders = new Set(["DMG", "DAMAGE", "DAMG"]);

  const headerCandidates = bands.map((band) => {
    const findHeader = (aliases) => band.words.find((word) => aliases.has(normalizeHeader(word.text))) || null;
    const kills = findHeader(killHeaders);
    const assists = findHeader(assistHeaders);
    const damage = findHeader(damageHeaders);
    return { band, kills, assists, damage, score: (kills ? 2 : 0) + (assists ? 1 : 0) + (damage ? 2 : 0) };
  }).filter((item) => item.kills && item.damage)
    .sort((a, b) => b.score - a.score);

  const header = headerCandidates[0];
  if (!header) {
    return { scoreboard_detected: false, columns_detected: [], rows: [], header_score: 0, notes: "Could not identify the Kills and Damage column headings clearly." };
  }

  const killX = wordCenter(header.kills, "x");
  const assistX = header.assists ? wordCenter(header.assists, "x") : null;
  const damageX = wordCenter(header.damage, "x");
  const sortedColumns = [killX, ...(assistX === null ? [] : [assistX]), damageX].sort((a, b) => a - b);
  const columnGaps = sortedColumns.slice(1).map((value, index) => value - sortedColumns[index]).filter((value) => value > 10);
  const maxDistance = Math.max(35, Math.min(100, columnGaps.length ? Math.min(...columnGaps) * 0.58 : 70));
  const headerY = header.band.centerY;

  const rows = [];
  for (const band of bands) {
    if (band === header.band || band.centerY <= headerY) continue;
    const words = band.words.filter((word) => (Number(word.confidence) || 0) >= 18);
    if (!words.length) continue;

    const ignCutoff = killX - maxDistance;
    const ignWords = words.filter((word) => wordCenter(word, "x") < ignCutoff)
      .sort((a, b) => wordCenter(a, "x") - wordCenter(b, "x"));
    const recognizedIgn = ignWords.map((word) => String(word.text || "").trim()).filter(Boolean).join(" ").trim();
    if (recognizedIgn.replace(/\s/g, "").length < 2) continue;

    const stats = {
      kills: nearestNumber(words, killX, maxDistance),
      assists: assistX === null ? null : nearestNumber(words, assistX, maxDistance),
      damage: nearestNumber(words, damageX, maxDistance),
    };
    if (stats.kills === null && stats.assists === null && stats.damage === null) continue;

    const confidenceWords = [
      ...ignWords,
      ...words.filter((word) => {
        const x = wordCenter(word, "x");
        return Math.abs(x - killX) <= maxDistance ||
          (assistX !== null && Math.abs(x - assistX) <= maxDistance) ||
          Math.abs(x - damageX) <= maxDistance;
      }),
    ];
    const ocrConfidence = confidenceWords.length
      ? confidenceWords.reduce((sum, word) => sum + (Number(word.confidence) || 0), 0) / confidenceWords.length
      : 0;

    rows.push({
      recognized_ign: recognizedIgn,
      match_confidence: Math.max(0, Math.min(1, ocrConfidence / 100)),
      ...stats,
      mvp: null,
    });
  }

  return {
    scoreboard_detected: rows.length > 0,
    columns_detected: [
      "NAME",
      String(header.kills.text || "K").toUpperCase(),
      ...(header.assists ? [String(header.assists.text || "A").toUpperCase()] : []),
      String(header.damage.text || "DMG").toUpperCase(),
    ],
    rows: rows.slice(0, 24),
    header_score: header.score,
    notes: "Free OCR scan completed. Check the recognized names and values before saving.",
  };
}

function matchParsedRows(parsed, candidates) {
  const matched = [];
  const unmatched = [];
  const usedPlayerIds = new Set();

  for (const row of parsed.rows.slice(0, 24)) {
    const recognizedIgn = String(row?.recognized_ign || "").trim().slice(0, 100);
    const match = findRosterPlayer(recognizedIgn, candidates);
    if (!match) {
      const suggestion = suggestRosterPlayer(recognizedIgn, candidates);
      unmatched.push({
        recognized_ign: recognizedIgn || "Unreadable IGN",
        reason: "Could not safely match this IGN to the selected squad.",
        ...(suggestion ? { suggested_ign: suggestion.ign, suggestion_score: suggestion.score } : {}),
      });
      continue;
    }
    if (usedPlayerIds.has(match.player.id)) {
      unmatched.push({ recognized_ign: recognizedIgn, reason: "More than one screenshot row matched this player; please check the screenshot." });
      continue;
    }
    if (matched.length >= 4) {
      unmatched.push({ recognized_ign: recognizedIgn, reason: "Four squad players have already been matched for this match." });
      continue;
    }

    const values = {
      kills: parseCount(row?.kills),
      assists: parseCount(row?.assists),
      damage: parseCount(row?.damage),
    };
    if (values.kills === null && values.assists === null && values.damage === null) {
      unmatched.push({ recognized_ign: recognizedIgn, reason: "The player was recognized, but no performance numbers were readable." });
      continue;
    }

    usedPlayerIds.add(match.player.id);
    matched.push({
      player_id: match.player.id,
      ign: match.player.ign,
      recognized_ign: recognizedIgn,
      kills: values.kills,
      assists: values.assists,
      damage: values.damage,
      mvp: null,
      confidence: Math.max(Number(row.match_confidence) || 0, match.score),
      match_method: match.method,
    });
  }

  return { matched, unmatched };
}

function chooseBestScoreboardPasses(ocrData, incomingPasses, candidates) {
  const parsedPasses = incomingPasses.map((pass, index) => {
    const parsed = extractScoreboard({ lines: pass.lines });
    const matchResult = parsed.scoreboard_detected ? matchParsedRows(parsed, candidates) : { matched: [], unmatched: [] };
    const averageConfidence = parsed.rows.length
      ? parsed.rows.reduce((sum, row) => sum + (Number(row.match_confidence) || 0), 0) / parsed.rows.length
      : 0;
    const score = matchResult.matched.length * 10000 + parsed.rows.length * 100 + averageConfidence * 10 + (Number(parsed.header_score) || 0);
    return { name: String(pass.name || `pass-${index + 1}`).slice(0, 48), parsed, ...matchResult, score };
  });
  return parsedPasses.sort((a, b) => b.score - a.score)[0] || null;
}
async function authorize(request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return { error: json({ message: "Sign in to use the performance scanner." }, 401) };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { error: json({ message: "Match scanner authentication is not configured." }, 503) };
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user?.id) {
    return { error: json({ message: "Your session has expired. Sign in again." }, 401) };
  }

  const db = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: "Bearer " + token } },
  });

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { error: json({ message: "Unable to verify Match Center access." }, 503) };
  }

  if (String(profile?.role || "").toLowerCase() !== "admin") {
    const [createAccess, approveAccess] = await Promise.all([
      db.rpc("moderator_access_check", { p_section: "matches", p_action: "create" }),
      db.rpc("moderator_access_check", { p_section: "matches", p_action: "approve" }),
    ]);
    if (createAccess.error || approveAccess.error) {
      return { error: json({ message: "Match Create and Results Approval permissions are required to scan screenshots." }, 403) };
    }
  }

  return { db, user };
}

export async function POST(request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 2 * 1024 * 1024) {
      return json({ message: "OCR result is too large. Please retry with a clearer, smaller screenshot." }, 413);
    }

    const access = await authorize(request);
    if (access.error) return access.error;

    const payload = await request.json().catch(() => null);
    const teamId = String(payload?.team_id || "");
    const ocrData = payload?.ocr_data;
    if (!UUID.test(teamId)) return json({ message: "Select a valid squad first." }, 400);
    const incomingPasses = Array.isArray(ocrData?.passes) && ocrData.passes.length
      ? ocrData.passes.slice(0, 4)
      : [{ name: "full-screen", lines: ocrData?.lines }];
    const totalOcrLines = incomingPasses.reduce((sum, pass) => sum + (Array.isArray(pass?.lines) ? pass.lines.length : 0), 0);
    if (!ocrData || !incomingPasses.length || incomingPasses.some((pass) => !Array.isArray(pass?.lines) || pass.lines.length > 120) || totalOcrLines > 480) {
      return json({ message: "The on-device OCR result was incomplete. Please scan the screenshot again." }, 400);
    }

    // Load the active, approved roster for the selected team. The screenshot,
    // not a manually checked player list, determines who is selected for this match.
    const { data: roster, error: rosterError } = await access.db
      .from("players")
      .select("id, ign, full_name, team_id")
      .eq("team_id", teamId)
      .eq("is_active", true)
      .in("status", ["approved", "active"])
      .limit(80);

    if (rosterError) return json({ message: "Unable to load the selected team's active roster." }, 503);
    if (!roster || roster.length < 4) {
      return json({ message: "The selected team needs at least four active, approved players before screenshot scanning." }, 400);
    }

    const candidates = roster
      .map((player) => {
        const ign = String(player.ign || player.full_name || "").trim();
        const fullName = String(player.full_name || "").trim();
        return {
          id: player.id,
          ign,
          full_name: fullName,
          aliases: [...new Set([ign, fullName].filter(Boolean))],
        };
      })
      .filter((player) => player.ign);

    if (candidates.length < 4) {
      return json({ message: "At least four active squad players need an in-game name before scanning." }, 400);
    }

    const bestPass = chooseBestScoreboardPasses(ocrData, incomingPasses, candidates);
    if (!bestPass?.parsed?.scoreboard_detected) {
      return json({
        code: "OCR_SCOREBOARD_NOT_DETECTED",
        message: "The free OCR scanner could not clearly read the scoreboard headings or player rows. Upload the full result screen in a sharper resolution, or enter the stats manually.",
        ocr_passes_checked: incomingPasses.length,
      }, 422);
    }

    const { parsed, matched, unmatched, name: ocrPassUsed } = bestPass;
    if (!matched.length) {
      return json({
        message: "The scoreboard text was read, but no player names could be safely matched to this squad. Review the OCR-read names against the selected squad IGN list, then check the in-game names or enter unclear rows manually.",
        matched_count: 0,
        selected_count: 4,
        columns_detected: parsed.columns_detected,
        ocr_pass_used: ocrPassUsed,
        recognized_rows: parsed.rows.map((row) => ({
          recognized_ign: String(row.recognized_ign || "").slice(0, 100),
          kills: parseCount(row.kills),
          assists: parseCount(row.assists),
          damage: parseCount(row.damage),
          confidence: Math.max(0, Math.min(1, Number(row.match_confidence) || 0)),
        })),
        unmatched_rows: unmatched,
      }, 422);
    }

    return json({
      success: true,
      game: "Free Fire",
      columns_detected: parsed.columns_detected,
      matched_count: matched.length,
      selected_count: 4,
      rows: matched,
      unmatched_rows: unmatched,
      ocr_pass_used: ocrPassUsed,
      notes: parsed.notes,
      image_stored: false,
      scanner: "tesseract.js-browser",
    });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return json({ message: "Screenshot scanning took too long. Please try again with a smaller screenshot." }, 504);
    }
    console.error("Match performance OCR matching failed:", error?.message || "Unknown error");
    return json({ message: "Unable to match the on-device OCR result. Please retry the screenshot or enter the stats manually." }, 500);
  }
}
