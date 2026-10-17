import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function send(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private, max-age=0" },
  });
}

export async function POST(request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey || !serviceRole) {
      return send({ message: "Match delete service is not configured." }, 503);
    }

    const token = (request.headers.get("authorization") || "")
      .match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return send({ message: "Admin authentication is required." }, 401);

    const input = await request.json().catch(() => null);
    const matchId = input?.matchId;
    if (
      (typeof matchId !== "string" && typeof matchId !== "number") ||
      !/^[A-Za-z0-9-]{1,100}$/.test(String(matchId))
    ) {
      return send({ message: "A valid match ID is required." }, 400);
    }

    const server = createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: identity, error: authError } = await server.auth.getUser(token);
    if (authError || !identity?.user?.id) {
      return send({ message: "Session expired. Please sign in again." }, 401);
    }

    const { data: profile, error: roleError } = await server
      .from("profiles")
      .select("role")
      .eq("id", identity.user.id)
      .maybeSingle();
    if (roleError) {
      console.error("Match deletion admin role check failed", roleError.message);
      return send({ message: "Unable to verify administrator permission." }, 503);
    }
    if (String(profile?.role || "").toLowerCase() !== "admin") {
      return send({ message: "Only administrators can delete match records." }, 403);
    }

    // Authenticated user context is required for the database SECURITY DEFINER
    // function's auth.uid() check. The service-role key is never sent to clients.
    const caller = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // The RPC MUST perform all related deletions in ONE PostgreSQL transaction.
    // Do NOT use individual PostgREST .delete() calls here: partial deletes would
    // corrupt the match finance and player earnings shown on other pages.
    const { data, error } = await caller.rpc("delete_esports_match", {
      p_match_id: String(matchId),
    });

    if (error) {
      console.error("Atomic match deletion RPC failed", error.code, error.message);
      if (error.code === "PGRST202" || /could not find the function/i.test(error.message || "")) {
        return send({ message: "Secure match deletion is not enabled in Supabase yet. No records were removed." }, 503);
      }
      return send({ message: "Match deletion failed. No deletion has been confirmed. Check Supabase configuration and try again." }, 500);
    }

    if (data?.deleted !== true) {
      return send({ message: "Supabase did not confirm complete match deletion. Please verify the match before retrying." }, 500);
    }

    return send({ deleted: true, matchId: String(matchId) });
  } catch (error) {
    console.error("Match deletion endpoint failed", error?.message || error);
    return send({ message: "Unable to process match deletion." }, 500);
  }
}
