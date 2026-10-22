# OVER POWER ESPORTS — English app & Android background match alerts

The app's English Home, Matches, Wallet, Inbox and Profile screens are in
Production. Server-generated match Inbox entries are **not** Android OS banners.

## Actual push status at last inspection (2026-10-22)
- Production project Vercel environment **does not** list `FIREBASE_SERVICE_ACCOUNT_JSON`.
- Supabase `op_match_native_push_tokens` has **zero** registered Android devices.
- No genuine closed-app FCM delivery can be claimed until setup is completed.
- Existing Supabase match schedule, approved-player recipients, notification
  records, and the 60/30/15 minute pg_cron worker are retained.

## Required setup by Firebase project owner

1. Open https://console.firebase.google.com/ and create/select a Firebase project.
2. Add an Android app with package ID **`com.overpower.esports.debug`**
   for the GitHub Actions debug/test APK. Production Play app is a *separate*
   Firebase Android registration: `com.overpower.esports`.
3. In Firebase Project settings > Your apps, get the Android registration's:
   - `OP_FIREBASE_APP_ID` — mobile `mobilesdk_app_id`
   - `OP_FIREBASE_API_KEY` — `current_key`
   - `OP_FIREBASE_PROJECT_ID` — `project_id`
   - `OP_FIREBASE_SENDER_ID` — `project_number`
   These must all belong to the **same** Firebase project. They are
   configuration identifiers, not a Firebase Admin private key.
4. Put those four fields in GitHub repository Settings > Secrets and variables
   > Actions > **Repository secrets**. Never put the service-account private
   key in an APK, Git commit, public issue, or this chat.
5. Firebase Project settings > Service accounts > Generate new private key.
   Save it securely and enter the complete JSON as a secret Vercel
   **Production** environment variable `FIREBASE_SERVICE_ACCOUNT_JSON`.
   Use least privilege, rotate compromised credentials and keep them out of
   chat/logs. Ensure FCM HTTP v1 is enabled for the project.
6. Build the APK again via GitHub Actions **Android App — Test APK**, install
   this new APK on an Android phone with Google Play services, then sign in
   as one approved Player. From **Home > Android Match Notifications**, tap
   **Enable Android Notifications**, then accept Android permission.
7. In **Admin > Match Schedule Center**, check **Android Push Readiness**.
   The Firebase server should say Configured, and Android devices should
   be at least 1. Configured here means usable key format, **not** proof of
   an actual FCM delivery.
8. Publish an **authorized actual match** for that test account's team and
   check both the OS notification banner while the app is backgrounded and
   the in-app Inbox. Repeat using the user-approved controlled test setup
   with the app closed. Do **not** create dummy matches or mass-notify
   real players without their knowledge.
9. In Admin, validate 60/30/15-minute reminders with future genuine
   schedules and signed cron. Network, power settings, Google Play services,
   OS notification settings and FCM TTL may delay or suppress banners.

## What updates automatically?

When the website is deployed, the existing Android native WebView receives
the updated English /app UI and new sections via the website backend, without
rebuilding the APK. **Native Firebase config, native code, application icon or
native permissions require a fresh APK**. This is a live hybrid app, not a
standalone full-offline game client.

## Troubleshooting
- **Firebase not configured**: production server secret absent or malformed.
- **0 Android devices**: no opted-in approved Player has registered an FCM
  token using a Firebase-configured APK.
- **Inbox but no banner**: check Notification permission, notification
  channel, matching Firebase project IDs and APK variant, and whether device
  has Google Play services.
- **Device token registered but failed sends**: inspect Vercel Cron errors
  without logging tokens, retry transient messages and remove expired tokens.
- **Plugin install failed**: no ChatGPT plugin is needed for Firebase push.
  Firebase project and credentials must be configured by their owner.
