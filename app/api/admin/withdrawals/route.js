import { withdrawalAdmin, authenticationFailure, sendWithdrawalResponse, withdrawalError } from "../../../lib/withdrawal-server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  let session;
  try { session = await withdrawalAdmin(request); }
  catch (error) { return authenticationFailure(error); }
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const valid = ["pending","approved","paid","rejected"];
    if (status && !valid.includes(status)) return sendWithdrawalResponse({ message: "Invalid status filter." }, 400);
    const page = Number(searchParams.get("page") || 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) {
      return sendWithdrawalResponse({ message: "Invalid page." }, 400);
    }
    const offset = (page - 1) * 25;
    let q = session.client.from("withdrawal_requests")
      .select("id,player_id,amount,status,provider,receiver_number,transfer_fee,net_payout,transaction_reference,created_at,updated_at,reviewed_by,reviewed_at,paid_at,paid_by,rejection_reason,payment_note", { count: "exact" })
      .order("created_at", { ascending: false });
    if (status) q = q.eq("status", status);
    // Count all statuses using head-only queries; never claim metrics based
    // on only a single page of records. Admin authorization is checked above.
    const [records, ...statusTotals] = await Promise.all([
      q.range(offset, offset + 24),
      ...["pending", "approved", "paid", "rejected"].map(value =>
        session.client.from("withdrawal_requests")
          .select("id", { count: "exact", head: true }).eq("status", value)
      ),
    ]);
    if (records.error) throw records.error;
    for (const result of statusTotals) if (result.error) throw result.error;
    const counts = Object.fromEntries(
      ["pending", "approved", "paid", "rejected"].map((statusName, index) =>
        [statusName, statusTotals[index].count ?? 0]
      )
    );
    return sendWithdrawalResponse({
      requests: records.data || [],
      total: records.count ?? 0,
      counts,
      page,
    });
  } catch (error) {
    return withdrawalError(error, "Unable to load withdrawal requests.");
  }
}
