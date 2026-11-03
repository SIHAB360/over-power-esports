import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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
      "Pragma": "no-cache",
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

function findRosterPlayer(recognizedIgn, candidates, hintedId, confidence) {
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

  const hinted = candidates.find((player) => player.id === hintedId);
  const hintedScore = hinted ? similarity(target, normalizeIgn(hinted.ign)) : 0;
  if (hinted && Number(confidence) >= 0.92 && hintedScore >= 0.62) {
    return { player: hinted, score: Math.min(0.99, Number(confidence)), method: "vision-assisted" };
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

function parseModelJson(value) {
  const text = String(value || "").trim()
    .replace(/^\uFEFF/, "")
    .replace(/^\u0060\u0060\u0060(?:json)?\s*/i, "")
    .replace(/\s*\u0060\u0060\u0060$/, "");
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first < 0 || last <= first) throw new Error("The AI scanner returned an unreadable result.");
  return JSON.parse(text.slice(first, last + 1));
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
    global: { headers: { Authorization: `Bearer ${token}` } },
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

    const gatewayKey = process.env.AI_GATEWAY_API_KEY;
    if (!gatewayKey) {
      return json({ message: "AI screenshot scanning is not configured on this deployment." }, 503);
    }

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
    const dataUrl = `data:${image.type};base64,${bytes.toString("base64")}`;
    const rosterText = candidates.map((player) => ({
      player_id: player.id,
      ign: player.ign,
      real_name_reference_only: player.full_name,
    }));

    const prompt = [
      "Read this Free Fire / Free Fire MAX match result or scoreboard screenshot, including the Battle Royale post-match result table.",
      "Extract only visible scoreboard facts. Never guess, invent, calculate, or fill a number that is not visibly present.",
      "This scoreboard layout may use the column headers NAME, K, A, DMG, REVIVAL, and SURVIVAL TIME. Map K to kills, A to assists, and DMG to damage exactly. These are the only performance statistics this website currently stores.",
      "Ignore REVIVAL, SURVIVAL TIME, rank badges, row placement numbers, Booyah placement such as #1/10, icons, likes, and all other columns. Never put those values into kills, assists, or damage.",
      "The selected team's active player roster is:",
      JSON.stringify(rosterText),
      "The admin has NOT manually selected players yet. Identify up to four unique players from this roster who actually appear in the scoreboard. Only match a player when the visible IGN is sufficiently clear. Ignore opponents and unrelated players. Read each row horizontally so that each K, A, and DMG number stays with the correct IGN.",
      "Match the visible IGN carefully against the supplied roster. Preserve the recognized IGN exactly as displayed, including underscores, hyphens, digits, and special characters. Return candidate_player_id only when one roster entry is clearly the same player; otherwise use null.",
      "For every selected player row you can read, return the exact visible K, A, and DMG values as kills, assists, and damage.",
      "If a K, A, or DMG column is not present or a value cannot be read clearly, return null for that field. Do not assume assists are zero when the screenshot has no A column.",
      "Return match_confidence from 0 to 1 for the IGN-to-roster match. Do not mark a row as matched just because it looks similar.",
      "Do not infer MVP from a highlighted row, thumbs-up icon, badge, or placement. Return mvp true/false only if the screenshot explicitly labels MVP; otherwise null.",
      "If this is not a match scoreboard, set scoreboard_detected to false.",
      "Return ONLY one valid JSON object in this exact shape:",
      '{"scoreboard_detected":true,"game":"Free Fire","columns_detected":["NAME","K","A","DMG"],"rows":[{"recognized_ign":"visible IGN","candidate_player_id":"one supplied player_id or null","match_confidence":0.95,"kills":3,"assists":2,"damage":1250,"mvp":null}],"notes":""}',
    ].join("\n");

    const gatewayResponse = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${gatewayKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        temperature: 0,
        max_tokens: 1200,
        providerOptions: {
          gateway: {
            disallowPromptTraining: true,
          },
        },
        messages: [
          { role: "system", content: "You are a careful esports scoreboard OCR and extraction engine. Accuracy is more important than returning every row." },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(50000),
    });

    if (!gatewayResponse.ok) {
      // Do not log or return the screenshot, prompt payload, or secret gateway response.
      return json({ message: "The AI scanner could not process this screenshot right now. Please try again." }, 502);
    }

    const gatewayResult = await gatewayResponse.json();
    const content = gatewayResult?.choices?.[0]?.message?.content;
    const modelText = Array.isArray(content)
      ? content.map((part) => part?.text || "").join("\n")
      : content;
    const parsed = parseModelJson(modelText);

    if (parsed?.scoreboard_detected === false) {
      return json({ message: "This image does not look like a readable match scoreboard. Upload the full result screen." }, 422);
    }

    const rawRows = Array.isArray(parsed?.rows) ? parsed.rows : [];
    if (!rawRows.length) {
      return json({ message: "No readable player rows were found. Try a clearer full-screen screenshot." }, 422);
    }

    const matched = [];
    const unmatched = [];
    const usedPlayerIds = new Set();

    for (const row of rawRows.slice(0, 24)) {
      const recognizedIgn = String(row?.recognized_ign || row?.ign || row?.player_name || "").trim().slice(0, 100);
      const confidence = Math.max(0, Math.min(1, Number(row?.match_confidence ?? row?.confidence ?? 0) || 0));
      const match = findRosterPlayer(recognizedIgn, candidates, row?.candidate_player_id, confidence);

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
        mvp: row?.mvp === true || row?.mvp === false ? row.mvp : null,
        confidence: Math.max(confidence, match.score),
        match_method: match.method,
      });
    }

    if (!matched.length) {
      return json({
        message: "No selected squad players could be matched confidently. Check the IGN spelling and upload a sharper scoreboard.",
        matched_count: 0,
        selected_count: 4,
        unmatched_rows: unmatched,
      }, 422);
    }

    return json({
      success: true,
      game: String(parsed?.game || "Free Fire").slice(0, 40),
      columns_detected: Array.isArray(parsed?.columns_detected) ? parsed.columns_detected.slice(0, 12) : [],
      matched_count: matched.length,
      selected_count: 4,
      rows: matched,
      unmatched_rows: unmatched,
      notes: String(parsed?.notes || "").slice(0, 300),
      image_stored: false,
    });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return json({ message: "Screenshot scanning took too long. Please try again with a smaller image." }, 504);
    }
    console.error("Match performance scanner failed:", error?.message || "Unknown error");
    return json({ message: "Unable to scan this screenshot. Please try again." }, 500);
  }
}
