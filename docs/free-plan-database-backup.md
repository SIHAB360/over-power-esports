# OVER POWER ESPORTS — Secure Database Backup (Supabase Free Plan)

**Status:** Setup ready, but **no successful backup yet**. Production Withdrawal Step 01 Draft PR #12 remains on hold until backup + recovery verification.

## Why the earlier GitHub Actions runs failed

The detailed log for [Backup Run #4](https://github.com/SIHAB360/over-power-esports/actions/runs/39059556698) shows that connection validation succeeded, but PostgreSQL returned:

```
FATAL: password authentication failed for user "postgres"
```

GitHub reached the correct Session Pooler, but the password in the original URL was incorrect or did not authenticate. The Node.js warning was unrelated.

The earlier user-shared password may have been exposed in chat. **Rotate that password** before using it for a production backup. Do not share actual passwords, URI, screenshots containing secrets, or API keys.

## Simple password-only configuration (new)

You no longer need to copy or construct a connection string.

The GitHub Actions workflow uses the **verified Session Pooler settings** for this project:

- Host: `aws-0-ap-northeast-1.pooler.supabase.com`
- Port: `5432`
- Username: `postgres.siiftefxumacaitjmuxj`
- Database: `postgres`
- SSL: required

Only the real database password is stored as a GitHub Actions secret.

### 1 — Reset your database password securely, if you don't know it or it was shared

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/siiftefxumacaitjmuxj), choose **Connect → Session pooler**.
2. Click **Reset database password** (or Project Settings → Database → Reset database password).
3. Create a **long unique password** in your password manager. Save it somewhere safe.
4. Existing applications using a *direct PostgreSQL connection string* might need their credentials updated. In the connected Vercel production app, only Supabase API-based environment-variable names were visible at inspection time; that does not prove every other client will be unaffected.

Never reset without checking other systems that might connect directly to Postgres.

### 2 — Add a single secret to GitHub

Open [Actions secrets](https://github.com/SIHAB360/over-power-esports/settings/secrets/actions).

1. Click **New repository secret**.
2. Set Name to exactly `SUPABASE_DB_PASSWORD`.
3. In Secret, paste **ONLY your actual database password**, without `postgresql://`, username, host, square brackets, or quotation marks.
4. Click **Add secret**.

The old `SUPABASE_SESSION_POOLER_URL` secret is **not used anymore**. After the new method succeeds, delete the obsolete secret so a potentially exposed password is not retained.

This workflow does not print your password in output or pass it on the command line. The password is handed to the ephemeral PostgreSQL 17 Docker client via `PGPASSWORD`.

### 3 — Create the backup

Open [GitHub Backup Workflow](https://github.com/SIHAB360/over-power-esports/actions/workflows/manual-supabase-encrypted-backup.yml).

1. Click **Run workflow**.
2. Select `main`, then **Run workflow**. Do not re-run old runs as they use older code.
3. Wait for **PostgreSQL 17 encrypted backup** to show a green success icon.
4. Download the artifact **op-esports-encrypted-db-<run-id>**. It contains a `.dump.cms` ciphertext and a SHA-256 checksum. No plaintext database export is uploaded.
5. Keep a copy outside GitHub. The GitHub artifact is retained for **14 days**.

The workflow is manual-only; it never runs on a PR, push, or schedule.

### 4 — Verify you can restore

Your **offline backup private key** is required to decrypt backup artifacts. This key must remain **outside GitHub** and backed up securely. The public certificate in `ops/backup/` is safe to commit.

Encrypted archive integrity is checked in the workflow, but a genuine restore into a disposable compatible PostgreSQL environment still needs verification before the sensitive Withdrawal migration.

For secure local verification:

```bash
sha256sum -c op-esports-supabase-YYYYMMDDTHHMMSSZ-runNNNN.dump.cms.sha256
openssl cms -decrypt -binary -inform DER \
  -in op-esports-supabase-YYYYMMDDTHHMMSSZ-runNNNN.dump.cms \
  -inkey OVER_POWER_BACKUP_PRIVATE_KEY.pem \
  -recip OVER_POWER_BACKUP_PUBLIC_CERT.pem \
  -out op-esports-recovery.dump
pg_restore --list op-esports-recovery.dump
pg_restore --file=/dev/null op-esports-recovery.dump
```

Replace the example filename with the actual encrypted artifact filename. Never run an unreviewed restore against the live database. A logical `pg_dump` is **not** managed PITR, nor does it back up Storage object contents and Supabase external service/project settings.

## Safety gate for Player Withdrawals

- [x] GitHub password-only backup workflow designed for Supabase Free Plan.
- [ ] Real database login succeeds and encrypted backup is produced.
- [ ] Backup is downloaded and successfully decrypted using the offline private key.
- [ ] Recovery verification in a disposable database succeeds.
- [ ] Withdrawal Draft PR #12 financial migration reviewed, applied, and tested.
- [ ] Separate user `d` approval before Step 02/03 UI.

**Do not attempt withdrawal migration until backup/recovery checks are complete.**

## Troubleshooting

| Error | Meaning |
|---|---|
| `Missing SUPABASE_DB_PASSWORD repository secret` | Add the new **password-only** secret described above |
| `password authentication failed` | The password is incorrect or the database password changed; check/reset through Supabase Dashboard |
| `could not connect / timeout` | Pooler or network availability issue; inspect workflow logs without posting secrets |
| `pg_dump server version mismatch` | PostgreSQL client/server major-version mismatch; workflow currently uses PostgreSQL 17 |
| `Node.js 20 deprecated` | Third-party GitHub Action warning, not a database authentication issue |

The GitHub repository is public: only **encrypted** artifacts should be uploaded. The offline private key MUST remain private.
