# OP ESPORTS Player-wise Withdrawal Lock + Bengali Payment-style Gateway

Status: **Staging branch ready; NOT installed on production.**

## Scope implemented

- Fail-closed table: \`public.player_withdrawal_access\`. Missing row means OFF.
- Only authenticated Admin may change access through \`admin_set_player_withdrawal_access(player_id, enabled, reason)\`. Client write grants are revoked. Changes serialized with the player-row lock also held by \`request_player_withdrawal_v2\`.
- Immutable access-change audit in \`public.player_withdrawal_access_events\`.
- Existing wallet-RPC preserves balance validation, one-active-request unique index, existing finance audit, and Admin Review/Paid confirmation.
- \`GET/POST /api/admin/withdrawals/access\` checks admin identity and exposes only permitted access states (not receiver numbers).
- \`GET /api/player/wallet\` returns \`withdrawalAccess.enabled\`; the Player UI fails closed if missing.
- Admin Withdrawals: player-by-player ON/OFF switch with explicit confirmation and recent change log.
- Player Dashboard: one prominent magenta glowing button; disabled while locked. History remains viewable using a separate link.
- Clicking an enabled button opens a large OP-branded pink/modal withdrawal interface with bKash/Nagad selection, Bengali payment labels, and a mobile full-screen layout. This is **NOT** an official bKash/Nagad payment site; no PIN/OTP collected.
- Admin permission remains ON until Admin turns it OFF. This request **does not** implement the earlier 30-minute/one-time-expiry proposal.

## Verified

- Isolated PostgreSQL 17 public-schema copy; live database queried only with a **read-only pg_dump**. New SQL migration applied to disposable clone; tests for default OFF, denied player self-toggle, Admin ON/OFF, direct SQL/role mutation block, next request blocked after OFF, old pending/approved/paid financial lifecycle, and new permission audit all passed.
  - [Isolated Security Run #2](https://github.com/SIHAB360/over-power-esports/actions/runs/39163310322)
- Real Chromium synthetic-account browser smoke: unauthenticated Admin toggle API 401, default locked Player, Admin ON/OFF confirmation, bKash/Nagad selection and submission, Bengali content and gateway sizing at 1440/390/320px. **6/6 successful.** Fake requests only; no real player activity or payments.
  - [Gateway Browser QA Run #1](https://github.com/SIHAB360/over-power-esports/actions/runs/39164184817)
- Vercel Preview build READY against staging branch.
- At preparation time Production has 9 players, 76 earnings, 0 withdrawals, and **no** new security access table. No SQL migration has been applied to Production.

## Production release gate (not yet authorized)

1. Fresh encrypted Postgres database backup and offline decryption/archive validation with existing recovery key; if possible, test restoration of the relevant schema.
2. Confirm no competing schema/migrations/main branch changes since final tests.
3. Obtain explicit approval acknowledging **every existing player will start with Withdrawal OFF**. Wallet browsing and historic approved requests are unaffected, but all NEW player payout requests are blocked until an Admin turns ON a player.
4. Apply the SQL migration \`supabase/migrations/20261019_admin_player_withdrawal_access.sql\` before merging UI/API code. Check player/earnings/history counts and security grants and test locked denial only with safe read-only/logical checks.
5. Merge release PR, wait for Vercel Production READY, check real signed-in Admin panel and Player lock status (do not perform an actual bKash/Nagad payment during a UI smoke).
6. Admin explicitly enables selected approved Players; there is **no automatic unlock** for any player.
7. If problem arises, Admin may switch players OFF again; if UI must be rolled back, leave DB security lock in place to block unauthorized requests. Never drop audit/history as rollback; produce audited migration if DB undo is later required.

**Security notes:** Don't post passwords, session tokens, private keys, phone numbers, or wallet PIN/OTP to public GitHub. Actual payment remains manual and may only be marked Paid after transfer proof/real transaction reference.
