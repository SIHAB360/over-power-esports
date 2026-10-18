import { withdrawalClient, withdrawalError, authenticationFailure, sendWithdrawalResponse, withdrawalAmount } from "../../../lib/withdrawal-server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let session;
  try { session = await withdrawalClient(request); }
  catch (error) { return authenticationFailure(error); }

  const body = await request.json().catch(() => null);
  if (!body || !["bkash", "nagad"].includes(body.provider)) {
    return sendWithdrawalResponse({ message: "Choose bKash or Nagad." }, 400);
  }
  const amount = withdrawalAmount(body.amount);
  if (amount === null) {
    return sendWithdrawalResponse({ message: "Enter a valid withdrawal amount (up to two decimals)." }, 400);
  }
  const phone = String(body.receiverNumber || "").replace(/\s+/g, "");
  if (!/^01[3-9][0-9]{8}$/.test(phone)) {
    return sendWithdrawalResponse({ message: "Enter an 11-digit Bangladesh wallet number." }, 400);
  }

  const { data, error } = await session.client.rpc("request_player_withdrawal_v2", {
    p_amount: amount,
    p_provider: body.provider,
    p_receiver_number: phone,
  });
  if (error) return withdrawalError(error, "Unable to create withdrawal request.");
  return sendWithdrawalResponse({ requestId: data, status: "pending" }, 201);
}
