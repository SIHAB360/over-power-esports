import { withdrawalAdmin, authenticationFailure, sendWithdrawalResponse, withdrawalError, withdrawalAmount } from "../../../../lib/withdrawal-server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let session;
  try { session = await withdrawalAdmin(request); }
  catch (error) { return authenticationFailure(error); }
  const body = await request.json().catch(() => null);
  const fee = String(body?.transferFee ?? "");
  // A zero fee is allowed; positive transfer fees must use 2 decimal precision.
  const validFee = fee === "0" || withdrawalAmount(fee) !== null;
  if (!body || typeof body.requestId !== "string" ||
      !/^[0-9a-fA-F-]{36}$/.test(body.requestId) || !validFee) {
    return sendWithdrawalResponse({ message: "Invalid payment request or fee." }, 400);
  }
  const reference = String(body.transactionReference || "").trim();
  if (reference.length < 5 || reference.length > 100) {
    return sendWithdrawalResponse({ message: "A real transaction reference is required." }, 400);
  }
  const note = typeof body.note === "string" ? body.note.trim() : null;
  if (note && note.length > 500) return sendWithdrawalResponse({ message: "Payment note is too long." }, 400);
  // An admin attests the transfer has already been sent via PERSONAL bKash/Nagad.
  // This endpoint does not call payment providers or move money automatically.
  const { data, error } = await session.client.rpc("admin_confirm_manual_withdrawal", {
    p_request_id: body.requestId,
    p_transfer_fee: Number(fee),
    p_transaction_reference: reference,
    p_payment_note: note,
  });
  if (error) return withdrawalError(error, "Unable to confirm manual payment.");
  return sendWithdrawalResponse(data);
}
