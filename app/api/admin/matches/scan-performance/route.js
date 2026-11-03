import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
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

function findRosterPlayer(recognizedIgn, candidates) {
  const target = normalizeIgn(recognizedIgn);
  if (!target) return null;

  const exact = candidates.filter((player) => normalizeIgn(player.ign) === target);
  if (exact.length === 1) return { player: exact[0], score: 1, method: "exact" };
  if (exact.length > 1) return null;

  const ranked = candidates
    .map((player) => ({
      player,
      score: similarity(target, normalizeIgn(player.ign)),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];
  if (
    best &&
    best.score >= 0.84 &&
    (!second || best.score - second.score >= 0.08)
  ) {
    return { ...best, method: "fuzzy" };
  }

  return null;
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

function lineCenterY(line) {
  if (line?.bbox) return wordCenter({ bbox: line.bbox }, "y");
  const words = Array.isArray(line?.words) ? line.words : [];
  if (!words.length) return 0;
  return words.reduce((sum, word) => sum + wordCenter(word, "y"), 0) / words.length;
}

function parseOcrNumber(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/[Oo]/g, "0")
    .replace(/[Il|]/g, "1")
    .replace(/[,.]/g, "");
  if (!/^\d{1,6}$/.test(cleaned)) return null;
  return parseCount(cleaned);
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

function extractScoreboard(ocrData) {
  const lines = collectOcrLines(ocrData);
  const killHeaders = new Set(["K", "KILL", "KILLS", "ELIM", "ELIMS", "ELIMINATION", "ELIMINATIONS"]);
  const assistHeaders = new Set(["A", "AST", "ASSIST", "ASSISTS"]);
  const damageHeaders = new Set(["DMG", "DAMAGE", "DAMG"]);

  const headerCandidates = lines
    .map((line) => {
      const words = Array.isArray(line?.words) ? line.words : [];
      const findHeader = (aliases) =>
        words.find((word) => aliases.has(normalizeHeader(word.text))) || null;
      const kills = findHeader(killHeaders);
      const assists = findHeader(assistHeaders);
      const damage = findHeader(damageHeaders);
      return { line, kills, assists, damage, score: (kills ? 2 : 0) + (assists ? 1 : 0) + (damage ? 2 : 0) };
    })
    .filter((item) => item.kills && item.damage)
    .sort((a, b) => b.score - a.score);

  const header = headerCandidates[0];
  if (!header) {
    return {
      scoreboard_detected: false,
      columns_detected: [],
      rows: [],
      notes: "Could not identify the Kills and Damage column headings clearly.",
    };
  }

  const killX = wordCenter(header.kills, "x");
  const assistX = header.assists ? wordCenter(header.assists, "x") : null;
  const damageX = wordCenter(header.damage, "x");
  const sortedColumns = [killX, ...(assistX === null ? [] : [assistX]), damageX].sort((a, b) => a - b);
  const columnGaps = sortedColumns.slice(1).map((value, index) => value - sortedColumns[index]).filter((value) => value > 10);
  const maxDistance = Math.max(35, Math.min(100, columnGaps.length ? Math.min(...columnGaps) * 0.58 : 70));
  const headerY = lineCenterY(header.line);

  const rows = [];
  for (const line of lines) {
    if (line === header.line || lineCenterY(line) <= headerY) continue;
    const words = (Array.isArray(line?.words) ? line.words : [])
      .filter((word) => String(word.text || "").trim() && (Number(word.confidence) || 0) >= 18);
    if (!words.length) continue;

    // IGN text sits to the left of the Kills column. Keep digits and symbols
    // in names; only the aligned numeric columns are parsed as statistics.
    const ignWords = words
      .filter((word) => wordCenter(word, "x") < killX - 4)
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
    notes: "Free OCR scan completed. Check the recognized names and values before saving.",
  };
}

async function recognizeScoreboard(bytes) {
  let worker;
  try {
    worker = await createWorker("eng", 1, { logger: () => {} });
    await worker.setParameters({
      tessedit_pageseg_mode: "6",
      preserve_interword_spaces: "1",
    });
    const result = await worker.recognize(bytes);
    return result?.data || {};
  } finally {
    if (worker) await worker.terminate().catch(() => {});
  }
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
    if (contentLength > MAX_IMAGE_BYTES + 128 * 1024) {
      return json({ message: "Screenshot is too large. Upload a clear image under 4 MB." }, 413);
    }

    const access = await authorize(request);
    if (access.error) return access.error;

    const form = await request.formData();
    const image = form.get("screenshot");
    const teamId = String(form.get("team_id") || "");
    if (!image || typeof image.arrayBuffer !== "function") {
      return json({ message: "Choose a match result screenshot first." }, 400);
    }
    if (!UUID.test(teamId)) return json({ message: "Select a valid squad first." }, 400);
    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      return json({ message: "Use a JPG, PNG or WEBP screenshot." }, 415);
    }
    if (image.size < 1000 || image.size > MAX_IMAGE_BYTES) {
      return json({ message: "Screenshot must be between 1 KB and 4 MB." }, 413);
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
      .map((player) => ({
        id: player.id,
        ign: String(player.ign || player.full_name || "").trim(),
        full_name: String(player.full_name || "").trim(),
      }))
      .filter((player) => player.ign);

    if (candidates.length < 4) {
      return json({ message: "At least four active squad players need an in-game name before scanning." }, 400);
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const ocrData = await recognizeScoreboard(bytes);
    const parsed = extractScoreboard(ocrData);

    if (!parsed.scoreboard_detected) {
      return json({
        code: "OCR_SCOREBOARD_NOT_DETECTED",
        message: "The free OCR scanner could not clearly read the scoreboard headings or player rows. Upload the full result screen in a sharper resolution, or enter the stats manually.",
      }, 422);
    }

    const matched = [];
    const unmatched = [];
    const usedPlayerIds = new Set();

    for (const row of parsed.rows.slice(0, 24)) {
      const recognizedIgn = String(row?.recognized_ign || "").trim().slice(0, 100);
      const match = findRosterPlayer(recognizedIgn, candidates);

      if (!match) {
        unmatched.push({ recognized_ign: recognizedIgn || "Unreadable IGN", reason: "Could not safely match this IGN to the selected squad." });
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

    if (!matched.length) {
      return json({
        message: "The scoreboard text was read, but no player names could be safely matched to this squad. Check the in-game names and enter any unclear rows manually.",
        matched_count: 0,
        selected_count: 4,
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
      notes: parsed.notes,
      image_stored: false,
      scanner: "tesseract-ocr",
    });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return json({ message: "Screenshot scanning took too long. Please try again with a smaller screenshot." }, 504);
    }
    console.error("Match performance OCR scanner failed:", error?.message || "Unknown error");
    return json({ message: "Unable to read this screenshot with the free OCR scanner. Please try a clearer image or enter the stats manually." }, 500);
  }
}
