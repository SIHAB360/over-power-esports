# OVER POWER ESPORTS — WhatsApp-style match notifications

## Native Android heads-up push vs in-app Inbox

- New match: Admin creates a published schedule; the backend queues one
  announcement for each logged-in approved player in the selected squad.
- Automatic timed reminders: 60/30/15 minutes before a match (the existing
  Supabase cron runs independently of whether Admin has their browser open).
- **Native Android:** Firebase Cloud Messaging sends HIGH-priority DATA payloads
  to the device's \`FirebaseMessagingService\`. The OS displays a HIGH-importance
  Match Alerts channel with sound and heads-up banner when allowed, even when
  the WebView app is not in the foreground.
- **Android 13+:** Players must explicitly tap **Enable Alerts** and allow the
  operating-system POST_NOTIFICATIONS permission.
- **Browser / installed iPhone Home Screen PWA:** Existing VAPID Web Push
  remains independent; tap "Enable alerts" in Match Center, install the PWA
  where required, and grant permission.
- **iPhone SwiftUI test build / Windows and macOS Electron:** In-app alerts
  work. Native iPhone closed-app APNs and native Windows/macOS closed-app
  push are NOT configured; Apple requires real APNs credentials and signing.
- Android system behavior depends on device settings, network availability,
  Google Play services and battery restrictions. FCM cannot guarantee an
  instantaneous popup on every device or when permission is denied.

### Firebase setup required BEFORE Android background push can work

This repository cannot invent a Firebase project, read its private service
account key or silently obtain phone notification permission.

1. In your own Google Firebase Console, create/select an Android Firebase
   project and register Android package **\`com.overpower.esports\`** for release.
   For the unsigned testing APK register **\`com.overpower.esports.v2test\`**,
   which is a DIFFERENT app ID. Do not mix them up.
2. In Firebase Project Settings > Cloud Messaging, enable the supported
   Firebase Cloud Messaging API and ensure it belongs to the SAME Firebase project.
3. Copy the **public Android Firebase app identifiers** from the Android app
   setup and save them as encrypted GitHub Actions repository secrets:
   - \`OP_FIREBASE_API_KEY\`
   - \`OP_FIREBASE_APP_ID\` (must match the TEST package's Firebase app for TEST APK)
   - \`OP_FIREBASE_SENDER_ID\`
   - \`OP_FIREBASE_PROJECT_ID\`
   Android APK is compiled with these identifiers (never with service
   account credentials). Without them, the app shows "awaiting Firebase setup".
4. In Vercel Production project environment, configure
   **\`FIREBASE_SERVICE_ACCOUNT_JSON\`** with the full private JSON service
   account belonging to the same Firebase project. **Do NOT put this key in
   GitHub source, Android, browser, or ChatGPT messages.** Restrict its service
   permissions to Firebase messaging where feasible.
5. Build a NEW APK after the public app identifiers are configured in
   GitHub Actions; redeploy the Vercel backend with its private key.
6. Sign in to the NEW APK as a real Approved Player, tap **Enable Alerts**,
   allow the Android notification permission. The app authenticates its FCM
   token against \`/api/player/native-push\`. Admin's publish and 60/30/15
   countdown worker then send FCM and retain the in-app inbox.
7. Make a controlled test match or send a controlled test notification to a
   test player; verify the actual device shows a pop-up **while app is
   backgrounded/closed** and taps open the dedicated **/app?tab=alerts**.
   Do not create fake paid matches in Production for testing.
8. Admin can select one squad or all approved players. Only those with a
   functional user login and opted-in devices receive phone push.

### Why the earlier APK didn't show push

The earlier version was a browser-based Trusted Web Activity without a
verified signing relationship, followed by an embedded Android WebView
that cannot use browser PushManager. Merely having an inbox or VAPID keys
on the server cannot cause notifications to a WebView outside the app.
Firebase native device tokens and OS notification permission were missing.

### Data protection

\`op_native_push_tokens\` is service-role only. Its POST/DELETE endpoints
enforce a Supabase-verified Bearer login and approved player status, limit
five devices per user and never return FCM tokens to another player.
Firebase service account and VAPID private keys stay only on the server.
No password, PIN or OTP collection is part of this system.

### Automatic update boundary

Next.js web pages, player/admin buttons, fixtures and server-side
notification logic update with the next Vercel deployment and app reload.
Android native Firebase SDK, OS permissions and app icon changes require
a rebuilt APK. Apple signed release updates require a new app submission.
