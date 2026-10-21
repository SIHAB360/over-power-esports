# OVER POWER ESPORTS — Android Notifications

## English application
The standalone Android app opens the dedicated English app at https://over-power-esports.vercel.app/app. It displays Login, Home, Matches, Wallet, Inbox and Profile in one native full-screen window. Admins receive the role-restricted management interface. The public website remains separate. Match schedules and feature changes deployed to the web automatically appear in the installed app after a reload; native code changes require a new APK.

## Background push notification prerequisites
1. Create your own Firebase project in Firebase Console, add Android app package `com.overpower.esports` (release) and `com.overpower.esports.debug` (test). Enable Firebase Cloud Messaging API.
2. In GitHub repository Actions secrets, configure the **public Firebase Android client values** `OP_FIREBASE_APP_ID`, `OP_FIREBASE_API_KEY`, `OP_FIREBASE_PROJECT_ID`, `OP_FIREBASE_SENDER_ID`. They are injected during APK builds and are not service-account credentials.
3. Create a server-side Firebase service account with FCM send permissions. Set its complete JSON as **Vercel Production environment variable `FIREBASE_SERVICE_ACCOUNT_JSON`**; never commit it, put it into an APK, or paste it into chat. Redeploy the website once the variable is saved.
4. Install the APK built after those values are configured. Log in as an approved player, open Inbox, tap **Enable Android Notifications**, and approve Android 13+ notification permission. The app registers its device token with an authenticated API.
5. From an administrator test environment, publish one match assigned to that test player's team. Verify Android's system notification banner with the app in the background and completely closed. Then verify the 60m/30m/15m reminders. Never use live player accounts for unsolicited tests.

If Firebase is not configured, the APK can launch and the in-app Match Inbox will work, but **Android system push will not work**. This is a deliberate fail-safe, not a silent promise of delivery.

## How it works
The Android native FirebaseMessagingService receives FCM data messages while the app is open, backgrounded or closed (subject to Android background/network restrictions), creates a `Match Announcements & Reminders` notification channel with high importance and shows a tappable banner pointing back to the in-app match screen. The server sends high-priority notifications only to explicitly opted-in, approved recipients, respecting the squad scope, and retains the existing web-push and unread inbox record.

Notifications are not guaranteed immediately if permission is denied, Android battery restrictions intervene, the network is offline or Google's FCM transport delays a message. iOS requires APNs or an installed Safari PWA with permitted Web Push; Android FCM setup alone does not enable iPhone native push.

## Build
JDK 17, Android SDK 36 and Gradle 8.11.1:
    cd android
    gradle :app:assembleDebug

Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`. To build a signed Play Store release you must provide your own release signing certificate; do not put private keys in GitHub source. Debug build certificates may change across CI runners, so updating an earlier debug APK can require uninstall/reinstall.
