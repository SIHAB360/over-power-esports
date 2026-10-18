import { withdrawalAdmin, authenticationFailure, withdrawalError, sendWithdrawalResponse } from "../../../../lib/withdrawal-server";

export const dynamic = "force-dynamic";

// Admin-only: returns all player access states, treating missing rows as
// locked. Never exposes wallet receivers or login credentials.
export async function GET(request) {
  let session;
  try { session = await withdrawalAdmin(request); }
  catch (error) { return authenticationFailure(error); }
  try {
    const { client } = session;
    const [players, access, audit] = await Promise.all([
      client.from("players").select("id,ign,full_name,status").order("ign", { ascending: true }),
      client.from("player_withdrawal_access")
        .select("player_id,enabled,updated_by,updated_at,reason"),
      client.from("player_withdrawal_access_events")
        .select("player_id,actor_user_id,previous_enabled,enabled,reason,created_at")
        .order("created_at", { ascending: false }).limit(25),
    ]);
    if (players.error) throw players.error;
    if (access.error) throw access.error;
    if (audit.error) throw audit.error;
    const map = new Map((access.data || []).map(row => [row.player_id,row]));
    return sendWithdrawalResponse({
      players:(players.data || []).map(row => ({
        playerId:row.id,
        name:row.ign || row.full_name || "Player",
        playerStatus:row.status,
        enabled:map.get(row.id)?.enabled === true,
        updatedAt:map.get(row.id)?.updated_at || null,
        updatedBy:map.get(row.id)?.updated_by || null,
        reason:map.get(row.id)?.reason || null,
      })),
      audit:audit.data || [],
    });
  } catch (error) {
    return withdrawalError(error, "Unable to load withdrawal access controls.");
  }
}

// Only an authenticated admin may invoke this route. The database RPC
// independently checks the real admin identity and holds a per-player row lock.
export async function POST(request) {
  let session;
  try { session = await withdrawalAdmin(request); }
  catch (error) { return authenticationFailure(error); }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.playerId !== "string" ||
      !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(body.playerId) ||
      typeof body.enabled !== "boolean" ||
      (body.reason != null && (typeof body.reason !== "string" || body.reason.length > 250))) {
    return sendWithdrawalResponse({ message: "Invalid player, access state or reason." },400);
  }
  const { data,error } = await session.client.rpc("admin_set_player_withdrawal_access",{
    p_player_id:body.playerId,
    p_enabled:body.enabled,
    p_reason:body.reason?.trim() || null,
  });
  if (error) return withdrawalError(error,"Unable to change withdrawal access.");
  return sendWithdrawalResponse(data);
}
