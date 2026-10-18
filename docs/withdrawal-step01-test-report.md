# OVER POWER ESPORTS — Player Withdrawal Step 01 Verification

This change prepares server-only authenticated wallet/withdrawal endpoints and a transactional SQL migration. **It does not send money automatically.** The user requested no implementation of Player UI (Step 02) or Admin UI (Step 03) before a later "d".

## Approved business rules

- Minimum: undecided; SQL setting minimum_amount = NULL, i.e., only amount > 0 and available balance are enforced until configured.
- Payout method: personal bKash or personal Nagad (manual transfer, not an API disbursement).
- Transfer charges are paid by the player: gross requested wallet debit; actual provider fee recorded by admin; recipient receives gross minus fee.
- Maximum concurrent active withdrawals: one per player (pending OR approved), enforced by DB unique partial index.
- All amounts numeric, up to two decimal places. Neither charge percentage nor minimum amount was invented.

## Backup verification — encrypted archive RECOVERABLE, full restore outstanding

The Supabase project remains on Free Plan; managed scheduled backup / PITR is not provided. GitHub Actions [Manual encrypted Supabase backup Run #5](https://github.com/SIHAB360/over-power-esports/actions/runs/39060404560) completed successfully on 2026-10-17 at approximately 18:59 UTC.

Verification of the specific archived artifact `op-esports-encrypted-db-39060404560`:
- GitHub workflow: PostgreSQL 17 `pg_dump` succeeded, complete archive parsed by `pg_restore --file=/dev/null`, AES-256-GCM CMS encryption succeeded, encrypted artifact uploaded.
- GitHub Artifact ID: `12111450390`; ZIP reports approximately 491,664 bytes; GitHub scheduled expiration 2026-10-31 18:59 UTC.
- Independently downloaded encrypted ZIP and verified embedded SHA-256 checksum: **PASS**.
- Independently decrypted encrypted dump with matching locally mounted offline RSA private key and public certificate: **PASS**.
- Verified decrypted payload begins with `PGDMP` custom PostgreSQL dump magic and size 490,354 bytes: **PASS**.
- Immediately deleted temporary decrypted dump from model working environment after verification. Do not store plaintext in the public repository.
- **ACTUAL RESTORE INTO A DISPOSABLE COMPATIBLE DATABASE: NOT YET TESTED**. A successful decrypt and archive parse is not proof of a working Supabase restore. PostgreSQL client/server extensions, roles and storage objects need special treatment.

Consequently, production money-related migrations and API deployment remain **on hold** pending isolated restore rehearsal and financial regression tests. Retain a private offline copy of both the encrypted archive and corresponding recovery private key; never upload the private key to GitHub.

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
- [x] Encrypted full logical backup created, downloaded, checksum-verified and decrypted independently
- [ ] Restore verified in a disposable compatible PostgreSQL/Supabase environment (managed PITR not available on Free Plan)
- [ ] Migration applied after backup verification
- [ ] Disposable test-user financial and concurrency tests
- [ ] Production merge/deploy after successful test
- [ ] Separate Step 02/03 approval with "d"

## 2026-10-17 isolated PostgreSQL 17 integration result — PASS

GitHub Actions Run #7: https://github.com/SIHAB360/over-power-esports/actions/runs/39064534632 — SUCCESS.

- Fresh production PUBLIC schema/data pg_dump succeeded (read-only, no live writes).
- Public schema, data, policies, indexes and FKs restored in disposable PostgreSQL 17 with minimal auth stubs. This does NOT prove recovery of Supabase Auth/Storage internals or a whole project.
- Both proposed Step 01 SQL migrations applied successfully ONLY to the disposable clone.
- SQL assertions passed: 9 players, 76 earnings, zero source withdrawals; no role self-escalation grants; unsafe match injection policies removed; protected earnings DML/TRUNCATE; one active request; wallet reservation; duplicate rejection; player prevented from admin approval; admin rejection released reserved balance; Pending -> Paid blocked; manual Paid with actual fee/net and reference; repeat Paid rejected; 5 audit events; balance debited exactly once.
- All test transactions and simulated provider reference existed ONLY in disposable database, not Production. No real bKash or Nagad transfer.
- Runner removed plaintext backup and test logs; no user data was uploaded as artifacts.

### Security blocker (DO NOT go live yet)

Public GitHub main tracks .env.local, and Step 01 branch stages its removal and a new .gitignore. A keys-only review of the current file and both historical versions found ONLY NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (both intentionally client-visible); NO SUPABASE_SERVICE_ROLE_KEY or database-password field in those file versions. Do not falsely claim service-role exposure from this file. Continue repository-wide secret/history review as appropriate. Independently, a database password candidate was previously posted in chat; rotate it IF it remains active and update the existing GitHub Actions backup secret. Production finance release still requires authenticated E2E/explicit approval.

### Remaining release gates

- [x] Encrypted backup #5 decrypted and archive validated.
- [x] Isolated public schema/data restore in PostgreSQL 17.
- [x] SQL migration and wallet/admin/Paid test lifecycle passed in isolated clone.
- [x] Hardened registration, privilege escalation, fake earnings and wallet source write rules staged in Step 01.
- [ ] Confirm any password previously disclosed in chat is no longer active; verify Vercel/GitHub secrets and review repository history for any actual privileged exposure (not established for .env.local).
- [ ] Authenticated desktop/mobile browser walkthrough with authorized player/admin account.
- [ ] Explicit approval to apply migrations on production with controlled financial smoke testing.
- [ ] Real bKash/Nagad manual transfer receipt/reconciliation process documented and tested.

Release decision: BLOCKED. All withdrawal PRs remain draft; database migration NOT applied on live Supabase.

## Final isolated RLS smoke test — GitHub Actions Run #9 SUCCESS

Verified [GitHub Actions Run #9](https://github.com/SIHAB360/over-power-esports/actions/runs/39088863849) finished **success** on commit `60a5a9518d8d899e65651ebf61de53100022c618`. All pipeline jobs completed:

- Production `public` data exported **read-only** to the ephemeral runner; encrypted backup from prior Run #5 remains separately available.
- Isolated PostgreSQL 17 restored public schema, constraints, real 9 players and 76 earnings records.
- Two proposed SQL migrations applied successfully **only in the disposable clone**.
- Financial request/approval/reject/manual Paid lifecycle, duplicate and fee accounting, and audit assertions completed successfully.
- Additional real-role impersonation testing using non-privileged `authenticated` and `anon` roles blocked profile admin escalation, player self-approval, direct earnings changes and forged anonymous match insertion. The disposable auth schema stubs used Supabase-equivalent grants.
- Temporary dump and test logs removed; no player data or plaintext archive uploaded as artifact.

### Before release

- This validates the **public schema/financial SQL** in a disposable PostgreSQL 17 environment, not all Supabase infrastructure, storage and Auth internals.
- Do not assume this verifies live authenticated browsers: desktop/mobile Player and Admin end-to-end tests remain pending.
- Independently confirm that the database password disclosed earlier in chat is no longer active; do **not** post any credential here. Update GitHub secret if password rotated and verify Vercel configuration.
- Obtain **explicit new approval** before applying production migration or merging Draft PRs #12 → #16 → #17.
- At verification time, live database still had 9 players, 76 earnings and 0 withdrawals; both migrations were unapplied.

**Go-live state: NOT DEPLOYED**.

## Post-rotation backup validation — 2026-10-18

- GitHub Actions [Manual encrypted Supabase backup #6](https://github.com/SIHAB360/over-power-esports/actions/runs/39126019976): **SUCCESS**; all dump, archive validation, encryption, upload and temporary-cleanup steps passed.
- Artifact: `op-esports-encrypted-db-39126019976` (Artifact ID `12136061896`, expires `2026-11-01 12:09 UTC`).
- Independent examination of downloaded ZIP: CMS encrypted payload SHA-256 **PASS**; decryption using existing offline RSA private key/public certificate **PASS**; decrypted data has PostgreSQL `PGDMP` custom archive header **PASS**, size 489,623 bytes.
- The decrypted temp file, keys extracted for the test, and temporary directory were wiped from the working container after verification. No plaintext data was placed in GitHub source or attached to the conversation.
- Password stored in GitHub secret is sufficient for authenticated Postgres backup. **Do not interpret this as cryptographic proof that an older password has been disabled**; user reports having reset it. Keep secret private.
- This is a fresh encrypted logical database backup, not a full project/Auth/Storage recovery rehearsal.
- Production money schema remains unchanged as separately verified: 9 players, 76 earnings rows, 0 withdrawals, migration `provider` column absent. PR #12/#16/#17 still awaiting production release.

Remaining requirements: confirm Supabase old DB credential is invalid if applicable; perform authenticated browser-level Player and Admin UI walkthrough, confirm existing site integrations, then request explicit permission for production migrations and staged deployment.
