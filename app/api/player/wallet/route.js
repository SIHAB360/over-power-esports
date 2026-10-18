import { withdrawalClient, authenticationFailure, sendWithdrawalResponse, withdrawalError } from "../../../lib/withdrawal-server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  let session;
  try { session = await withdrawalClient(request); }
  catch (error) { return authenticationFailure(error); }

  try {
    const { client, user } = session;
    const { data: player, error: playerError } = await client.from("players")
      .select("id").eq("user_id", user.id).eq("status", "approved").maybeSingle();
    if (playerError) throw playerError;
    if (!player?.id) return sendWithdrawalResponse({ message: "Approved player profile required." }, 403);

    const [balance, history] = await Promise.all([
      client.rpc("get_player_wallet_balance", { p_player_id: player.id }),
      client.from("withdrawal_requests")
        .select("id,amount,status,provider,receiver_number,transfer_fee,net_payout,transaction_reference,created_at,updated_at,paid_at,rejection_reason")
        .eq("player_id", player.id)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);
    if (balance.error) throw balance.error;
    if (history.error) throw history.error;
    return sendWithdrawalResponse({
      wallet: balance.data?.[0] || null,
      withdrawals: history.data || [],
    });
  } catch (error) {
    return withdrawalError(error, "Unable to load wallet.");
  }
}
