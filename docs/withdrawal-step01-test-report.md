# OVER POWER ESPORTS — Player Withdrawal Step 01 Verification

This change prepares server-only authenticated wallet/withdrawal endpoints and a transactional SQL migration. **It does not send money automatically.** The user requested no implementation of Player UI (Step 02) or Admin UI (Step 03) before a later "d".

## Approved business rules

- Minimum: undecided; SQL setting minimum_amount = NULL, i.e., only amount > 0 and available balance are enforced until configured.
- Payout method: personal bKash or personal Nagad (manual transfer, not an API disbursement).
- Transfer charges are paid by the player: gross requested wallet debit; actual provider fee recorded by admin; recipient receives gross minus fee.
- Maximum concurrent active withdrawals: one per player (pending OR approved), enforced by DB unique partial index.
- All amounts numeric, up to two decimal places. Neither charge percentage nor minimum amount was invented.

## Mandatory BACKUP gate — still open

Connected Supabase tools expose project, schema and SQL functions but **do not expose the Supabase managed Backup/PITR inventory or restore test**. The project is ACTIVE_HEALTHY; that does not prove a restorable backup exists. Thus migration is NOT APPLIED in production and no production withdrawal feature should be deployed yet.

Owner needs to verify in Supabase Dashboard > Database > Backups:
- A recent restorable snapshot or active PITR restore window.
- Restore point/time and database recovery access.
- Prefer a safe restore test before processing real money.

Do not put personal payout information or plaintext database dumps in a public GitHub repository.

## Current live read-only inspection

- withdrawal_requests: 0 existing rows.
- player_earnings: 76 rows.
- players: 9 rows.
- Existing withdrawal statuses: pending, approved, paid, rejected.
- Existing wallet RPC: get_player_wallet_balance(p_player_id uuid), sums completed-match earnings less active reservations and paid withdrawals.
- Legacy request_player_withdrawal(p_amount numeric) allows amount-only requests with no payment destination; new migration revokes authenticated use of this legacy RPC.
- Legacy admin_process_withdrawal(uuid,text) can mark Paid without payment transaction proof; new migration revokes authenticated use of this legacy RPC.
- Authenticated player_earnings INSERT policy named "Allow insert player earnings" currently permits arbitrary earnings INSERT; migration removes that policy and restricts earnings mutation to trusted definer logic.
- Public execute grant exists on rebuild_player_earnings; migration revokes execution for public, anon, authenticated.
- Existing create_esports_match uses trusted SECURITY DEFINER RPC and rebuilds earnings. Existing 30/70 allocation and player data are preserved.
- New schema adds method, receiver, paid fee, net payout, reference, staff review/paid markers, rejection reason, immutable-history-style audit table and wallet settings row.
- Important separate risk: current Admin Match Delete cascades to player earnings; after withdrawals have been paid, financial-history protection on deletions deserves a dedicated follow-up.

## API route design, held off production

- GET /api/player/wallet : authenticated player's own balance + recent withdrawal history (RLS)
- POST /api/player/withdrawals : authenticated account requests payout with {amount, provider, receiverNumber}; atomic server RPC enforces balance and one-active-request
- GET /api/admin/withdrawals : admin-only paginated list
- POST /api/admin/withdrawals/review : admin approves pending or rejects pending/approved with mandatory reason
- POST /api/admin/withdrawals/confirm-payment : admin records actually completed manual bKash/Nagad transfer, actual provider fee and unique transaction reference; only approved requests

An Approved request does not equal Paid. This system does not contact bKash/Nagad directly. No PIN, OTP, or personal account password is collected.

## Integration tests REQUIRED after verified backup and staging migration

| Test | Expected outcome |
|---|---|
| Unauthorized requests | HTTP 401 |
| Player with valid balance requests gross payout | Exactly one pending row, reserved amount increases |
| Duplicate and concurrent withdrawal requests | At most one active, never overdrawn |
| Balance too low | Rejected without record |
| Invalid provider, mobile number or amount precision | Rejected |
| Player uses admin action | Rejected |
| Admin approve pending | Approved, still reserved |
| Admin reject with reason | Rejected, reserve released, history logged |
| Pending -> Paid directly | Rejected |
| Admin confirms already-sent payout | Fee and net recorded, unique reference, Paid; audit created |
| Duplicate reference or duplicate Paid attempt | Rejected |
| Player attempts direct earnings INSERT | Rejected |
| Public rebuild earnings execution | Rejected |
| Unauthorized audit modification | Rejected |
| Existing 76 earnings and 9 players remain intact | Confirm after migration |
| Match saving and earnings reconciliation | Unchanged |
| Player/Admin UI | Not activated in Step 01 |

## Rollback and release criteria

Do NOT drop financial tables or columns after real transactions. A rollback after any payout needs audited reconciliation and a verified database restore plan. No live player earnings or withdrawal rows were modified by this branch.

- [x] Read-only schema, RLS, function and existing row count inspection
- [x] Migration and backend drafted in isolated GitHub branch
- [ ] Restorable backup/PITR confirmed
- [ ] Migration applied after backup verification
- [ ] Disposable test-user financial and concurrency tests
- [ ] Production merge/deploy after successful test
- [ ] Separate Step 02/03 approval with "d"
