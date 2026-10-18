# OVER POWER ESPORTS — Step 03 Admin Withdrawal Control Center

**Status: CODE + VERCEL PREVIEW ONLY. No production merge. No live payment functions activated.**

## Implemented UI / backend integration

- Replaced the original Admin Dashboard Salary placeholder UI with premium **Withdrawals** management component. Internal navigation key `salary` remains unchanged to preserve existing bookmarks (e.g. `/admin/dashboard?section=salary`).
- Kept the other existing Admin Dashboard operations, management screens, registered players, match earnings, profit, teams, tournaments, registration and all existing data untouched.
- Existing verified admin auth gate and authenticated bearer token reused; API independently verifies admin `profiles.role` on every request.
- All-status metrics from PostgreSQL head/count queries, paged 25-rows list, status filters, search current visible page only, refresh, player lookup, masked number in list, full destination only inside admin detail.
- Select a request to view player, team, requested gross amount, status, recipient, dates and payment evidence.
- **Approve** Pending: distinct confirmation; still not Paid and no funds transferred.
- **Reject** Pending or Approved: mandatory reason; reserved amount released by existing wallet rules.
- **Record manual Paid** only for Approved: admin must manually transfer money via bKash/Nagad first, enter actual player-borne fee, provider reference, optional note, and attest transfer was completed and receipt verified. Preview actual net sent = gross − fee. No payout API, no PIN, no OTP, no automated transfer.
- Post/refresh after successful decision; server-side atomic wallet/RPC guards in Step 01 remain authoritative; front-end submit lock and button disabled state reduce duplicate clicks.
- Isolated CSS modules: desktop split list/detail, tablet/mobile one column, keyboard focus and readable dark premium cyan-blue-purple lighting.
- Detailed status and authenticated player identity displayed without exposing a full receiver number in the list.

## Financial invariants

1. No minimum gross withdrawal configured.
2. One Pending/Approved request per player, enforced by partial DB index once migration applies.
3. Player pays **actual** transfer fee entered at payment confirmation. Fee must be >= 0 and strictly smaller than gross amount; Net = Gross − Fee; Paid gross is deducted from player's wallet.
4. No real bKash/Nagad automatic payout is attempted. Personal account remains a manual process.
5. Approve and Paid are distinct state transitions. A transaction ID entered by admin is an attestation, **not proof verified by provider APIs**.
6. A real payment receipt should be reconciled independently outside this dashboard.

## Security and release blockers

- Supabase Free encrypted logical backup Run #5 passed checksum, offline decryption and `PGDMP` validation. **Isolated actual database restore remains unverified**.
- Financial withdrawal SQL migration is still **not applied**. Read-only initial snapshot: 9 players, 76 player_earnings records, 0 withdrawal requests. No live data modified by Step 03.
- Step 01 PR #12 is a DRAFT on `main`, Step 02 PR #16 is a DRAFT on Step 01 branch, and this Step 03 implementation stays stacked as a **DRAFT PR** on Step 02 branch.
- When DB migration has not applied, admin endpoint fails closed with "not ready" message and no action buttons; no invented payout records.
- Before Production: complete disposable-restore trial, audit SQL triggers/RLS/functions/legacy grants, test requests/reject/approve/paid/duplicate/transfers/accounting, authenticated desktop+mobile walkthrough, then merge PR #12 → #16 → this PR only after explicit approval. **Do not automatically merge.**

## Test matrix

| Test | Status |
|---|---|
| GitHub branch / Step 03 file diff verified | PASS |
| Vercel Preview Next.js build for combined Step 01/02/03 code | PASS |
| Admin navigation retains existing salary key/bookmarks | PASS (source review) |
| Backend separates paid, reject, approve and counts requests | PASS (source review; DB untested) |
| Personal accounts cannot auto-transfer from website | PASS (code review) |
| Other existing admin manager screens preserved | PASS (isolated file diff) |
| Full Supabase restore into disposable instance | NOT YET RUN |
| Migrated wallet / RLS / financial contract tests | NOT YET RUN |
| Manual transaction confirmation integration test | NOT YET RUN |
| Authenticated admin and player E2E live browser test | NOT YET RUN |
| Production merge / finance activation | BLOCKED BY SAFETY GATES |

Production status: **unchanged** until a safe database restoration and end-to-end payment workflow is verified.

## Browser-based UI verification — 2026-10-18

GitHub Actions [Withdrawal Player/Admin UI browser preflight #3](https://github.com/SIHAB360/over-power-esports/actions/runs/39127072226) finished **SUCCESS**. All **7 independent Chromium tests** passed against a disposable locally built Next.js application, with dummy Supabase client URL and synthetic sessions, intercepted data and API calls.

1. Player dashboard redirects unauthenticated visitors to Login.
2. Authenticated synthetic Player: Wallet desktop display, available balance, insufficient-funds/number/consent validation, request creation, updated history and duplicate-request prevention.
3. Backend `503` explicitly disables Player Withdrawal on responsive mobile viewport.
4. Non-admin synthetic Player cannot access Admin Dashboard.
5. Admin Dashboard redirects unauthenticated visitors to Login.
6. Authenticated synthetic Admin: load pending request, approve it without any funds sent, then attest synthetic manual payment with fee and transaction reference; no payment-provider API calls.
7. Admin Control Center displays on narrow mobile viewport.

GitHub CI dependency installation and Next.js production build were successful. Vercel Preview of the branch was READY. No production database credentials, actual account tokens, private payment numbers or payment gateway were used.

**Important limitations:** Browser authentication and wallet API responses were **mocked**: this is a UI behavior smoke test, not a real Supabase authenticated user session or production-like authorization integration. Verified SQL RLS/accounting integration is separately recorded in Step 01 Run #9. Before release, a real consenting Player and authorized Admin must test Login, viewing respective wallets, history and read-only paths. Do not send or reveal account passwords, Supabase JWT or payment OTPs in this report.

Production gate remains CLOSED: Do not merge Step 01/02/03 or execute their production migrations without separate explicit user approval. Existing live data remains 9 players, 76 earnings and 0 withdrawals; new withdrawal schema is absent.

## Final mixed browser + live Next.js route guard test — 2026-10-18

GitHub Actions [Chromium UI/browser & API preflight Run #4](https://github.com/SIHAB360/over-power-esports/actions/runs/39127281060): **SUCCESS** on commit `bbe5098c1eeb81c739a2a90849ff5ca563a1650e`. All **8 scenarios passed**.

- Actual locally started **Next.js production-build API routes**, without Playwright interception or bearer token, returned `401 Unauthorized` for all five endpoints: GET `/api/player/wallet`, POST `/api/player/withdrawals`, GET `/api/admin/withdrawals`, POST `/api/admin/withdrawals/review`, and POST `/api/admin/withdrawals/confirm-payment`.
- Chromium browser: unauthenticated Player/Admin redirect; authenticated *mock* Player dashboard wallet displays correct available funds and field/consent/insufficient-balance rules; mock request creates Pending and prevents duplicate submission; unavailable wallet fails closed on mobile; mock Player blocked from Admin page; synthetic Admin can Approve then *record* manual Paid with fee and reference; admin UI displays on narrow mobile viewport.
- Synthetic account fixtures and intercepted provider numbers were not actual Supabase sessions. **No real user password, OTP, Supabase production API secret, provider wallet, production database write or payment transfer was involved**.
- Next.js production build PASS. Vercel Preview deployment READY. Previous isolated PostgreSQL 17 schema restore, proposed migrations and wallet/RLS SQL lifecycle PASS (Run #9), and encrypted backup #6 independently decrypted and verified.

**Unverified release requirement:** a consenting real Player and authorized Admin must manually sign in to their respective Preview pages, validate account navigation and read-only displays, and verify responsive/mobile appearance. Because live production has not had the withdrawal migrations installed, live wallet processing must stay disabled. Do not impersonate users or collect their credentials.

**Release status: NOT APPROVED / NOT DEPLOYED.** Keep PR #12, PR #16 and PR #17 Draft. Apply production SQL / merge only with fresh explicit authorization.
