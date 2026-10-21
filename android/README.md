# OVER POWER ESPORTS — Native Android Software 2.0

## What changed after the failed TWA APK
The old Android build was a Chrome-dependent Trusted Web Activity (TWA).
Without a correctly signed and verified Digital Asset Link, it could launch
as a browser tab. That is **no longer** the mechanism.

The new app contains a real native Android \`MainActivity\` with:
- A full-screen WebView **inside the APK**, no Chrome launch or browser bar.
- The website's genuine homepage logo in app launcher and native Splash Screen.
- The dedicated bank-app-style \`/app\` login/Home/Match/Wallet/Inbox/Profile.
- Native retry and connection error handling.
- User-initiated photo/document picker (for website registration and forms).
- HTTPS-only on-domain app navigation; external HTTPS links open the normal browser.
- Strict TLS validation, safe browsing, no JavaScript-to-Android bridge, no
  silent camera, location or microphone permissions.
- Separate debug package \`com.overpower.esports.v2test\` for test builds.

All app content comes live from the existing Next.js/Supabase deployment:
https://over-power-esports.vercel.app/app

**Website updates and newly created Admin/Player pages:** Website UI and
data changes appear inside the installed app after Vercel deploy/reload,
without a new APK. Adding a new top-level \`app/admin/<section>/page.js\`
or \`app/player/<section>/page.js\` auto-registers it as a software button
on the next web build. Native Android-only code/icon/permissions updates
still require a new APK/AAB.

## Debug build
Install JDK 17, Android SDK 36 and Gradle 8.11.1, then:

    cd android
    gradle :app:assembleDebug --no-daemon

Output: \`android/app/build/outputs/apk/debug/app-debug.apk\`.

GitHub Actions "Android App — Test APK" uploads the compiled test APK,
and "Android App — Real Emulator Launch Test" runs the APK in an Android
emulator, verifies the native Activity stays alive and records screenshots.

The debug APK is NOT a production-signed Play Store release and may prompt a
standard "Install unknown apps" warning. Only install builds from this
verified repository; do not disable device-wide security protections.

## Production release
Package name: \`com.overpower.esports\`. Create your personal release
keystore securely, and provide signing variables locally/through secured CI:
\`OP_ANDROID_KEYSTORE_PATH\`, \`OP_ANDROID_STORE_PASSWORD\`,
\`OP_ANDROID_KEY_ALIAS\`, \`OP_ANDROID_KEY_PASSWORD\`.
Never send keystore/passwords to ChatGPT or commit them to GitHub.
Build \`gradle :app:bundleRelease\` and publish via your own Play Console.

Digital Asset Links are optional for Android App Links and no longer
required for the app to open fullscreen.

## Push notifications
The **in-app** Match Notification Inbox and 60/30/15-minute reminder
records still function as part of Next.js. Native **background OS push**
for Android WebView when the app is fully closed requires a separate
Firebase Cloud Messaging implementation with your Firebase project;
do not claim this test APK already supports background pushes.

## iPhone / PC
The iPhone native SwiftUI project, Electron Windows/Mac builds and PWA
use exactly the same authenticated /app feature screens and live backend.

**Version 2 test package:** The old browser-based debug build was signed on a different ephemeral CI runner. The new `.v2test` identifier installs separately, avoiding the Android `INSTALL_FAILED_UPDATE_INCOMPATIBLE` signature error with the broken old `.debug` APK. Remove the old icon/app after verifying the new version. Future test builds may still need uninstall/reinstall because CI debug signing keys are ephemeral.
