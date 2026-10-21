# OVER POWER ESPORTS — Native Desktop Software

This folder packages an app for https://over-power-esports.vercel.app/app with a dedicated login/home/matches/wallet/alerts/profile interface; the public website stays separate.

Target systems:
- Windows 10/11 x64: Portable .exe (sign for trusted public distribution)
- MacBook Intel: .dmg x64 (Apple Developer ID signing and notarization needed)
- MacBook Apple Silicon: .dmg arm64 (signing and notarization needed)

The desktop wrapper opens the live Vercel website. Player, Admin, matches and earnings share the SAME website and Supabase data, with no separate account store.

## Development

Install Node 20+ then run from desktop directory:
    npm install
    npm start

To build on the corresponding OS:
    npm run dist:windows
    npm run dist:mac:x64
    npm run dist:mac:arm64

GitHub Actions workflow Desktop Apps — Windows and macOS Test Builds uploads unsigned test downloads for each platform. Windows SmartScreen and macOS Gatekeeper may warn for unsigned test builds.

## Security

Renderer disables nodeIntegration, enables contextIsolation and sandbox.
Third-party HTTP(S) links open in the normal browser. Arbitrary protocols and permissions are denied.
Never store private server credentials or release signing keys in code. All finance, accounts and match schedules require live connection.

The in-app notifications inbox works, but native desktop OS push while the app is closed is not implemented. For system-level push use the browser-installed PWA on supported desktop platforms.
