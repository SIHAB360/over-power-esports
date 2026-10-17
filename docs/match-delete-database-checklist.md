# Match deletion: Supabase dependency check before enabling in production

## Status

The History UI and guarded DELETE API are ready on the feature branch.
**Do not merge to production until the atomic Supabase RPC is installed and verified.**
The API deliberately fails closed if `delete_esports_match(p_match_id)` is unavailable.
Do not attempt a client-side `.from("matches").delete()` as a shortcut.

## Read-only database inspection needed

Connect the actual Supabase project and inspect:

1. Columns, FK constraints, delete actions, triggers and policies for `matches`.
2. FK paths for `match_finance`, `match_player_stats`, `match_results`, `player_earnings` and any additional match child tables.
3. The current `create_esports_match` transaction/function and any triggers that create/calculate player earnings.
4. Whether `player_earnings` has a direct `match_id` or derives the match through another join; do not delete earnings of unrelated matches.
5. All player and dashboard aggregations that depend on those records.
6. Current RLS and Admin role from `profiles`; moderators may view history but **must not delete**.
7. Existing Supabase backup/PITR setup and a rollback plan.

Read-only discovery query (adjust schema names if necessary):

```sql
SELECT
  c.conname AS fk_name,
  c.conrelid::regclass AS child_table,
  c.confrelid::regclass AS parent_table,
  pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint AS c
WHERE c.contype = 'f'
  AND (
    c.conrelid::regclass::text LIKE '%match%'
    OR c.confrelid::regclass::text LIKE '%match%'
    OR c.conrelid::regclass::text LIKE '%earn%'
  )
ORDER BY 2, 3;

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('matches','match_finance','match_results',
                     'match_player_stats','player_earnings')
ORDER BY table_name, ordinal_position;

SELECT event_object_table AS table_name, trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('matches','match_finance','match_results',
                             'match_player_stats','player_earnings')
ORDER BY table_name, trigger_name;
```

## Required RPC contract

Authenticated-only `public.delete_esports_match(p_match_id text)` returns
`{"deleted":true}` only after **all** relevant match children, financial and
player earnings rows have been removed, including the parent match, in ONE
PostgreSQL transaction. Reject missing matches and non-Admin users, and fail
transactionally if an unexpected FK or trigger prevents a complete cleanup.

Use `auth.uid()` and the database `profiles.role` for authorization inside
the function. Avoid any direct client-accessible DELETE policies on the tables.
Grant EXECUTE only to the authenticated role.

## Verification before production

- Backup snapshot available.
- Delete a dedicated test match with test player stats and earnings, using
  an authenticated Admin. Confirm the deleted match disappears from all
  affected tables and aggregates; no other match changes.
- Verify the same request as a Moderator and unauthenticated user is rejected.
- Test repeated request / missing match, FK failure rollback, and UI refresh.
- Verify Profit, Dashboard, Player earnings, History and Match creation still work.
- Do not delete real historical data as a test.

The website code alone cannot prove schema-wide deletion while Supabase is not
connected. Wait for a confirmed Supabase connection before running SQL or
merging this feature.

## Verified Supabase implementation (2026-10-17)

Verified project `siiftefxumacaitjmuxj` using live schema inspection. All six foreign keys referencing `public.matches(id)` have **ON DELETE CASCADE**: `match_finance`, `match_player_stats`, `match_players`, `match_results`, `player_earnings`, and `team_earnings`. Existing `matches` update trigger does not handle deletes.

Applied migration `secure_atomic_admin_match_delete` successfully:
- `public.delete_esports_match(p_match_id text)` uses one parent DELETE inside one transaction; FK cascades perform complete cleanup.
- It verifies `auth.uid()` and checks `profiles.role = admin` within the database.
- Uses `SECURITY DEFINER SET search_path = ''`, and grants execution only to authenticated users, not anon.
- Returns `{deleted:true,matchId:...}` only when a match row actually disappears.
- Permission and function existence verified; authenticated role has EXECUTE, anon does not.

No real match rows were deleted during setup. Future end-to-end authenticated deletion should be checked carefully with a disposable test match created by the administrator. The live feature is available only after explicit per-record confirmation.
