# OVER POWER ESPORTS — Android APK / AAB foundation

This is the **real Android Trusted Web Activity (TWA) application** for:
https://over-power-esports.vercel.app/

- App name: **OVER POWER ESPORTS**
- Android package: \`com.overpower.esports\`
- Entry screen: dedicated **/app software Login and Dashboard UI** (not the website Home)
- Player / moderator / admin login, dashboards, match schedule, Supabase data and
  Vercel website updates use the **same existing web app**, not a duplicate database.
- Push permission and actual push subscription are managed by the existing
  logged-in Player Match Center. The Android wrapper does not bypass consent.
- Not a standalone offline copy; accounts, match schedules and financial balances
  require the internet. The service worker caches only public assets.

## 1. Build a test APK (no signing secrets needed)

Open \`android/\` in Android Studio with JDK 17, or run in a configured
Android SDK + Gradle 8.11.1 environment:

\`\`\`sh
cd android
gradle :app:assembleDebug
\`\`\`

Output: \`android/app/build/outputs/apk/debug/app-debug.apk\`.

The connected **Android App CI** GitHub Action also produces this file
as a downloadable **GitHub Actions artifact**. Debug uses
\`com.overpower.esports.debug\`, separate from the real release app.

Because the debug certificate is not the website's configured release signer,
the TEST APK can open as a Chrome Custom Tab WITH a browser address bar.
This is expected; it does not mean the Play Store production TWA is broken.

## 2. Sign for release — never commit your keystore

Before distributing a release APK/AAB, create and securely back up a long-lived
upload key using Android Studio's Generate Signed Bundle / APK workflow or
\`keytool\`. Do not share the keystore/passwords with ChatGPT or commit them.

For a locally signed build provide:
- \`OP_ANDROID_KEYSTORE_PATH\`
- \`OP_ANDROID_STORE_PASSWORD\`
- \`OP_ANDROID_KEY_ALIAS\`
- \`OP_ANDROID_KEY_PASSWORD\`

Then run \`gradle :app:assembleRelease :app:bundleRelease\`.
Do not distribute or upload an unsigned release.

## 3. Verify the web ↔ Android relationship (mandatory for fullscreen TWA)

Get the **SHA-256 app-signing certificate fingerprint** that corresponds to the
ACTUAL distributed APK. If using Google Play App Signing, get the **App signing
key certificate** fingerprint from Play Console > Release > Setup > App integrity.
The upload key fingerprint by itself might be insufficient for Play-distributed
apps; both can be supplied when appropriate.

Set Vercel **Production** environment variable
\`ANDROID_TWA_SHA256_FINGERPRINTS\` to the genuine colon-separated SHA-256
certificate fingerprints. Multiple values are comma-separated.
Redeploy the site, then confirm this returns the JSON containing your actual
package name and fingerprints:

\`\`\`
https://over-power-esports.vercel.app/.well-known/assetlinks.json
\`\`\`

Until a real fingerprint has been configured, that endpoint intentionally
returns **404**. It does not publish fake fingerprints.

The site's generated \`assetlinks.json\` binds \`com.overpower.esports\` to
the genuine certificate and the Android manifest declares the corresponding
web \`asset_statements\`. Fullscreen TWA works once the browser verifies both.

## 4. App icon / PWA readiness

The PWA manifest now uses correctly sized PNG URLs:
\`/pwa-icon/192\` and \`/pwa-icon/512\`, with a mask-safe icon.
The site registers \`/match-notifications-sw.js\` on first load, preserving
existing opt-in 60/30/15-minute match push handling and providing a private-safe
offline fallback. Supabase data is **never cached offline**.

Users can also install the PWA directly from supported mobile browsers
before the signed Android APK is published.

## 5. Release QA checklist

1. Test Player and Admin sign-in from Home.
2. Test a real approved player viewing their squad's upcoming matches.
3. After explicitly enabling browser notifications, test push in a controlled
   test account only (never send unsolicited push to all players).
4. Verify links to another website open safely in normal browser context.
5. Verify \`assetlinks.json\` returns the correct release signing fingerprint.
6. Confirm in Android App Links settings the domain is verified.
7. Build a signed \`.aab\` for Google Play and use its internal testing track.
8. Confirm website changes propagate after a new Vercel Production deployment.
9. Do not bundle Supabase service-role/VAPID private keys in Android artifacts.

### Important

An APK/AAB is **not** automatically a verified release application merely
because the source code builds. Domain verification requires real signing
certificates, and Play Store publication requires the user's Play Console account.
