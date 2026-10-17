import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function respond(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

// Only the backend can use the service-role key. Never ship this key to the browser.
export async function GET(request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return respond({ message: "Verification service is not configured." }, 503);
    }

    const authorization = request.headers.get("authorization") || "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      return respond({ message: "Sign in as an administrator to continue." }, 401);
    }

    const db = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Validate the user's actual JWT on the server, then check the database role.
    const { data: identity, error: userError } = await db.auth.getUser(token);
    if (userError || !identity?.user?.id) {
      return respond({ message: "Your admin session has expired. Sign in again." }, 401);
    }

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("role")
      .eq("id", identity.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Admin verification role lookup failed:", profileError.message);
      return respond({ message: "Unable to verify administrator access." }, 503);
    }

    if (String(profile?.role || "").toLowerCase() !== "admin") {
      return respond({ message: "Only administrators can view registration codes." }, 403);
    }

    // Read the SAME codes that /api/verify-code validates. No changes to
    // registration flow, code generation, expiry or existing records.
    let result = await db.from("registration_codes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    // Some installations of the original table do not include created_at.
    if (result.error && /created_at/i.test(result.error.message || "")) {
      result = await db.from("registration_codes").select("*").limit(200);
    }

    if (result.error) {
      console.error("Admin registration code query failed:", result.error.message);
      return respond({ message: "Could not read registration codes from Supabase." }, 503);
    }

    const codes = (result.data || [])
      .filter((item) => typeof item.code === "string" && item.code.trim())
      .map((item) => ({
        id: String(item.id ?? item.code),
        code: item.code,
        createdAt: item.created_at ?? null,
        expiresAt: item.expires_at ?? null,
      }))
      .sort((a, b) => {
        const aTime = Date.parse(a.createdAt || a.expiresAt || "") || 0;
        const bTime = Date.parse(b.createdAt || b.expiresAt || "") || 0;
        return bTime - aTime;
      });

    return respond({ codes, checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Admin verification service failed:", error?.message || error);
    return respond({ message: "Unable to load registration codes right now." }, 500);
  }
}
