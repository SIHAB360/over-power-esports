# General Staff RBAC — Safety Gate

## Requested behavior
- Main Admin assigns **individual actions** (view/create/edit/delete/approve/export) to approved player accounts by **section**.
- Player Dashboard displays a Staff Panel entry only if the player has a valid view grant.
- Staff Panel lists only permitted sections, never unrestricted legacy Admin Dashboard.
- Supported registry: matches, players, earnings, teams, tournaments, withdrawals, profit, verification, achievements.

## Implemented in draft
- Staff management UI with section/action picker.
- General staff_access_grants migration DRAFT, not run.
- Scoped player staff portal and access-introspection endpoint.
- Main-admin only API guard additionally requires immutable auth app_metadata role.
- Write operation currently responds 503 and no staff grants can be applied; this is intentional fail-closed.

## Blocking requirements before release
1. **Trusted Super Admin bootstrap:** Existing Supabase project has one profiles.role admin but no auth.users app_metadata.role admin. A verified ownership check and bootstrap are required. Do not silently promote any user based only on editable profiles.role.
2. **Profiles role escalation:** Audit/harden user self-update policies for profiles.role. Ensure a user cannot grant admin/moderator to themselves, even through direct Data API calls.
3. **Grant mutation:** Implement one transactionally safe, audit-logged admin-only RPC, with explicit revocation behavior.
4. **Enforcement:** Protect each staff-facing section and every data-changing operation in its backend/RLS (matches and match_player_stats currently allow only admin/moderator). Avoid assigning moderator globally. Keep earnings, finance, payouts, deletions restricted by action.
5. **Compatibility:** Existing all-powerful admin screens cannot be reused for staff access without server-side operation filtering.
6. **Tests:** Unauthenticated, unassigned player, each action allow/deny, cross-section isolation, direct API/RPC bypass attempts, revoke during session, self-permission assignment attempt, audit log integrity, and mobile navigation.
7. Only merge to main and deploy once above verifications are complete. No live financial action in synthetic tests.
