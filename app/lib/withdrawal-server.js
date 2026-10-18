import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const sendWithdrawalResponse = (body, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "private, no-store, max-age=0" },
});

export function withdrawalError(error, generic = "Request failed") {
  const text = String(error?.message || "");
  const code = String(error?.code || "");
  if (code === "PGRST202" || code === "42703" || code === "42P01") {
    return sendWithdrawalResponse({
      message: "Withdrawals are not enabled until the verified database migration is applied.",
    }, 503);
  }
  if (/Withdrawal access is locked by admin/i.test(text)) {
    return sendWithdrawalResponse({
      message: "Withdrawal access is disabled by your administrator.",
    }, 423);
  }
  if (code === "42501" || /access denied|admin required|permission|approved player profile/i.test(text)) {
    return sendWithdrawalResponse({ message: "Permission denied." }, 403);
  }
  if (code === "23505") {
    return sendWithdrawalResponse({
      message: "An active withdrawal already exists or this payment reference has been used.",
    }, 409);
  }
  if (code === "22023" || /withdrawal amount|below current minimum|insufficient available|only active|existing withdrawal|receiver|transaction reference/i.test(text)) {
    return sendWithdrawalResponse({ message: text || generic }, 400);
  }
  // Do not leak provider numbers, SQL details, database context, or tokens.
  console.error("Withdrawal backend error:", code || "unknown");
  return sendWithdrawalResponse({ message: generic }, 500);
}

export async function withdrawalClient(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  if (!url || !anon) throw Object.assign(new Error("Withdrawals are not configured."), { status: 503 });
  if (!match) throw Object.assign(new Error("Sign in to continue."), { status: 401 });
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: "Bearer " + match[1] } },
  });
  const { data, error } = await client.auth.getUser(match[1]);
  if (error || !data?.user?.id) throw Object.assign(new Error("Session expired."), { status: 401 });
  return { client, user: data.user };
}

export async function withdrawalAdmin(request) {
  const { client, user } = await withdrawalClient(request);
  const { data, error } = await client.from("profiles")
    .select("role").eq("id", user.id).maybeSingle();
  if (error || String(data?.role || "").toLowerCase() !== "admin") {
    throw Object.assign(new Error("Only administrators may manage withdrawals."), { status: 403 });
  }
  return { client, user };
}

export function authenticationFailure(error) {
  return sendWithdrawalResponse({
    message: error?.status === 503 ? "Withdrawal backend is not configured." :
      error?.status === 403 ? "Only administrators may manage withdrawals." :
      "Authentication required.",
  }, error?.status || 401);
}

export function withdrawalAmount(input) {
  const value = String(input ?? "");
  if (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/.test(value)) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
