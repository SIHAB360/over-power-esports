# OVER POWER ESPORTS — Step 02 Player Withdrawal UI Verification

**Status: PREVIEW ONLY. Not merged to Production. No database migration executed.**

## Scope implemented

- Player-only Wallet & Withdrawal section at the bottom of existing personal Player Dashboard.
- Keep legacy lifetime earnings and all other player data/profile/statistics UI untouched.
- Read secure wallet figures from `GET /api/player/wallet`, **not** by reusing the all-time earnings display as available balance.
- Show available balance, completed-match net earnings, active reserved withdrawals and cumulative paid withdrawals.
- Responsive bKash/Nagad selection, Bangladesh receiver number, gross amount and confirmation checkbox.
- Disclose that transfer fee is borne by the player and the **final net payout is calculated from the actual admin-recorded fee** (fee rate has NOT been invented).
- Reject invalid local amount/number; backend remains authoritative for amount available, ownership and one active request.
- POST to `/api/player/withdrawals` with the authenticated Supabase bearer token; never transmit bKash PIN/OTP or database credentials.
- Submission is protected from double click with busy and ref lock, displays pending status and refreshes wallet from the server.
- Latest 25 requests show status, masked receiver number, date, paid fee/net/reference or rejection reason.
- Accessibility: labelled inputs, radio-group legend, aria-invalid, status announcements, keyboard focus, mobile 1–2 column layout, reduced motion.
- **Admin read-only player-preview intentionally does not render another player's wallet.**

## Safety / release guard

This UI is built ON TOP of draft foundation PR #12 and therefore DOES NOT exist on the Production branch. Its API depends on PR #12's new database columns and RPC migration. Until that migration has been applied and tested, any requests would return a service-not-ready error; the component disables withdrawal submissions rather than representing an invented wallet balance.

The predecessor Step 01 draft **must** pass real database restore and financial integration QA before either PR can be merged to Production. A successful encrypted-backup decrypt/archive-check alone is not a complete restore rehearsal.

This UI is proposed through a **draft stacked Pull Request** with base `feat/withdrawal-foundation-step01-20261017`. The admin Salary-to-Withdrawal Control Center remains explicitly deferred to Step 03, requiring a separate user `d`.

## Tests / checks

| Check | Status |
|---|---|
| JS/CSS build on Vercel Preview | PASS — deployment READY |
| UI changes isolated from existing Dashboard data logic | PASS — import and one component mount only |
| Admin read-only preview segregation | PASS — component behind !adminView |
| Frontend direct payment-provider transfer | Not present; deliberately manual |
| Live player wallet values | NOT tested; Supabase migration not installed |
| Player form full request/approve/paid lifecycle | NOT tested; pending Step 01 integration |
| Mobile screenshot and authenticated browser walkthrough | NOT tested |
| Production deployment | HELD — draft PR |

## Existing money rules

- No minimum withdrawal amount has been configured.
- Only one pending or approved request per player.
- Player bears actual transfer fee; not a hard-coded fixed percentage.
- Admin manual payment confirmation occurs in Step 03 and must carry a real transaction reference.
- No balance is fabricated; UI renders unavailable state if wallet endpoint is unavailable.
