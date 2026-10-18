import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// This registration endpoint uses service-role credentials by necessity. Never
// allow caller-provided DB column names or financial/approval status fields.
const ALLOWED_REGISTRATION_FIELDS = [
  "full_name", "ign", "freefire_uid", "email", "phone", "age", "birth_date",
  "primary_role", "secondary_role", "device", "internet_connection",
  "practice_time", "game_experience", "tournament_experience",
  "joining_date", "average_br_kd_rate", "expert_weapon", "previous_team",
  "full_address", "facebook_link", "instagram_link", "tiktok_link",
  "youtube_link", "team_name",
];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_LENGTH = 1200;
const VALID_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Registration service is not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function uploadImage(db, file, bucket) {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Images must be 3 MB or smaller.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Upload a JPEG, PNG or WebP image.");
  }
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  const name = crypto.randomUUID() + "." + ext;
  const { error } = await db.storage.from(bucket).upload(name, file, {
    contentType: file.type, upsert: false,
  });
  if (error) throw new Error("Unable to upload registration image.");
  return db.storage.from(bucket).getPublicUrl(name).data.publicUrl;
}

export async function POST(request) {
  try {
    const db = getSupabase();
    const form = await request.formData();
    const userId = String(form.get("user_id") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    if (!VALID_UUID.test(userId) || !email || email.length > 254) {
      return json({ success: false, message: "A valid signed-up player account is required." }, 400);
    }

    // In the existing registration flow signup may require email confirmation,
    // so a session JWT is not guaranteed yet. Validate the registered Auth
    // identity and forbid impersonation of existing player registrations.
    const { data: authRecord, error: accountError } = await db.auth.admin.getUserById(userId);
    if (accountError || !authRecord?.user || (authRecord.user.email || "").toLowerCase() !== email) {
      return json({ success: false, message: "Player registration identity could not be verified." }, 403);
    }

    const { data: existing, error: existingError } = await db.from("players")
      .select("id").eq("user_id", userId).limit(1);
    if (existingError) throw new Error("Unable to verify player account.");
    if (existing?.length) return json({ success: false, message: "This player is already registered." }, 409);

    const playerData = {};
    for (const field of ALLOWED_REGISTRATION_FIELDS) {
      const value = form.get(field);
      if (typeof value === "string" && value.trim() && value.length <= MAX_LENGTH) {
        playerData[field] = value.trim();
      }
    }
    if (!playerData.full_name || !playerData.ign) {
      return json({ success: false, message: "Player name and in-game name are required." }, 400);
    }
    playerData.user_id = userId;
    playerData.email = email;

    // Important: these fields are SERVER-OWNED and cannot come from multipart
    // inputs. A malicious player must not self-approve or mint earnings.
    playerData.status = "pending";
    playerData.verified = false;
    playerData.earning_percentage = 0;
    playerData.matches_played = 0;
    playerData.wins = 0;
    playerData.total_kills = 0;

    const image = form.get("profile_image");
    const screenshot = form.get("game_id_screenshot");
    const avatar = await uploadImage(db, image, "player-images");
    const proof = await uploadImage(db, screenshot, "game-screenshots");
    if (avatar) {
      playerData.profile_image = avatar;
      playerData.avatar_url = avatar;
    }
    if (proof) playerData.game_id_screenshot = proof;

    const { data, error } = await db.from("players").insert(playerData).select().single();
    if (error) {
      console.error("Registration DB error:", error.code || "unknown");
      return json({ success: false, message: "Player registration could not be completed." }, 400);
    }
    return json({ success: true, message: "Registration Successful", data }, 200);
  } catch (error) {
    console.error("Player registration rejected:", error?.name || "unknown");
    return json({ success: false, message: error?.message || "Registration service unavailable." }, 400);
  }
}
