# OVER POWER ESPORTS — encrypted database backup on Supabase Free

## Why this exists

Supabase Free does **not** include managed scheduled backups/PITR. This workflow takes a **manual PostgreSQL logical database dump** without modifying any live rows or schema. It encrypts the dump BEFORE uploading an Actions artifact.

**Important:** A PostgreSQL logical dump is **not** equivalent to a Supabase managed restore point. It does not back up Storage bucket object files, project/dashboard settings, external authentication providers, payment credentials, service secrets or global database roles. Those require separate recovery plans. Restore testing is mandatory before changing production withdrawal tables.

This repository is PUBLIC. A GitHub Actions artifact may be available to people with repository read access. **Only encrypted artifacts must be uploaded.** Never put an unencrypted database dump, private key, personal data or connection string into GitHub.

## 1. Keep your PRIVATE key safely outside the repository

The project owner receives a private key file named OVER_POWER_BACKUP_PRIVATE_KEY.pem from the setup conversation. Keep the file offline, in at least two secure places, and do not commit, paste or send it to anyone. Do not store it in GitHub Actions secrets: the runner only needs the public certificate in ops/backup/OVER_POWER_BACKUP_PUBLIC_CERT.pem.

**If the private key is lost, backups encrypted with its matching public certificate are permanently unrecoverable.**

Certificate SHA-256 fingerprint:

A9:EA:1D:44:30:F5:AC:20:42:D7:D5:7D:6E:B1:89:95:93:23:2B:65:26:70:DF:9F:3A:90:44:5D:6D:F4:BD:E7

## 2. Configure the single GitHub Actions secret

1. In the [Supabase Dashboard](https://supabase.com/dashboard), open the OVER POWER project and click **Connect**.
2. **IMPORTANT: the default Supabase Connect screen may show Direct connection. Change Method to Session pooler first** (NOT Transaction pooler), then choose URI and Copy. A Direct URI like `postgresql://postgres:[YOUR-PASSWORD]@db.siiftefxumacaitjmuxj.supabase.co:5432/postgres` will not work reliably from GitHub Actions, even with a real password: it uses IPv6. Session pooler is accessible over IPv4.
   The correct Session pooler URI has this **shape** (do not guess the host): `postgresql://postgres.siiftefxumacaitjmuxj:[YOUR-PASSWORD]@[EXACT-POOLER-HOST]:5432/postgres`. The exact pooler host must be copied from the Connect dialog: a region may have multiple pools. Replace only `[YOUR-PASSWORD]` with the real database password. Percent-encode reserved password characters; do not share the result in chat. The workflow adds `sslmode=require` unless already present.
3. In [GitHub repository Settings](https://github.com/SIHAB360/over-power-esports/settings/secrets/actions) → Secrets and variables → Actions → **New repository secret**:
   - Name: `SUPABASE_SESSION_POOLER_URL`
   - Value: the **complete** PostgreSQL Session Pooler URI, including the password.
4. Save. Never paste the URL/password into an issue, PR, workflow file, ChatGPT message or screenshot.

Existing Vercel/Supabase web-app environment variables must not be changed. If the Supabase database password was lost, ask before resetting it; reset can interrupt existing integrations.

## 3. Manually run the workflow

1. Open [GitHub Actions](https://github.com/SIHAB360/over-power-esports/actions/workflows/manual-supabase-encrypted-backup.yml).
2. Choose **Run workflow** on branch **main**.
3. Wait for the job **PostgreSQL 17 encrypted backup** to succeed.
4. Under the completed job's **Artifacts**, download `op-esports-encrypted-db-<run-id>`.
5. Keep the encrypted `.dump.cms` file and matching `.sha256` checksum outside GitHub in another safe place.
6. Artifact retention is only **14 days**. Keep your own copy.

The workflow runs only via manual `workflow_dispatch`. It never runs on pull requests, push or cron. It never accepts private-key material. It uses PostgreSQL 17 `pg_dump -Fc`, checks that `pg_restore` can fully decode the archive, then encrypts with OpenSSL CMS authenticated **AES-256-GCM** using the committed PUBLIC certificate. The plaintext is removed before artifact upload. Note that archive decode is **not** the same thing as restoring into a functioning Supabase instance.

## 4. Verify download and decrypt OFFLINE

You need OpenSSL 3+, PostgreSQL client tools matching server major version 17, and your private-key file. Do this only on a secure computer; plaintext dumps contain sensitive account data. Example commands:

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

Replace names with those from the downloaded artifact. On Windows, use WSL/Linux shell or a compatible shell with OpenSSL/Postgres. Do NOT run a restore against production. Test actual recovery in an isolated, disposable PostgreSQL/Supabase-compatible environment before approving finance migration.

After testing, securely remove the decrypted local database dump. Keep only the encrypted archive and offline private key.

## 5. Finance Step 01 release gate

- Confirm backup workflow run succeeded.
- Download encrypted artifact + checksum offline.
- Decrypt successfully with offline PRIVATE key.
- Independently verify schema/data or test a restore into a disposable compatible database.
- Then the Step 01 withdrawal migration in PR #12 may be reviewed/applied with row-count preflight checks. **Do not merge PR #12 or expose Withdrawal UI earlier.**
- Need separate `d` approval to begin Step 02/03.

## Troubleshooting

- **Missing or wrong secret format**: the secret must contain the entire Session pooler URI, **not** a password alone. Confirm GitHub Actions Secret **name** is `SUPABASE_SESSION_POOLER_URL`. Use Update if a prior secret exists.
- **GitHub annotation says Direct Connection**: you copied `db.siiftefxumacaitjmuxj.supabase.co`. Change the Supabase Connect method to **Session pooler**; it must use user `postgres.siiftefxumacaitjmuxj` and the pooler host on port 5432.
- **GitHub annotation says password placeholder**: replace `[YOUR-PASSWORD]` with your real Database Password in GitHub Secret; never disclose it here.
- **Node.js 20 deprecated warning**: an unrelated GitHub Action warning, not a database connection failure.
- **Missing secret**: add `SUPABASE_SESSION_POOLER_URL` (not an API token).
- **Connection refused / host not reachable**: pick Session Pooler; Direct DB often requires IPv6 not available on GitHub-hosted runners.
- **Invalid password**: re-check secret, password URL-encoding; do not print secrets to logs.
- **Permission denied on some schemas**: job fails closed. Do not use a partial archive for recovery.
- **GitHub Actions disabled**: owner may need to enable Actions in GitHub Settings (no code changes required).
- **Artifact unavailable**: job must succeed before upload; try again after checking logs without sharing sensitive values.
