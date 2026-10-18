import { withdrawalAdmin, authenticationFailure, sendWithdrawalResponse, withdrawalError } from "../../../../lib/withdrawal-server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let session;
  try { session = await withdrawalAdmin(request); }
  catch (error) { return authenticationFailure(error); }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.requestId !== "string" ||
      !/^[0-9a-fA-F-]{36}$/.test(body.requestId) ||
      !["approved", "rejected"].includes(body.decision)) {
    return sendWithdrawalResponse({ message: "Invalid request or decision." }, 400);
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : null;
  if (body.decision === "rejected" && (!reason || reason.length > 350)) {
    return sendWithdrawalResponse({ message: "A rejection reason of up to 350 characters is required." }, 400);
  }
  const { data, error } = await session.client.rpc("admin_review_player_withdrawal", {
    p_request_id: body.requestId,
    p_decision: body.decision,
    p_rejection_reason: reason,
  });
  if (error) return withdrawalError(error, "Unable to process request.");
  return sendWithdrawalResponse(data);
}
