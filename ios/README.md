# iOS/iPadOS native software

This is a SwiftUI + WKWebView iPhone/iPad application, **not a website shortcut**.
It opens the dedicated authenticated \`/app\` login and app tabs in a private
native WKWebView. The official homepage logo is reused in its splash and app icon.

## Build and release
Run on macOS with Xcode and XcodeGen:
- \`sips -s format png -z 1024 1024 ../app/assets/logo.png --out OverPowerEsports/Assets.xcassets/AppIcon.appiconset/AppIcon.png\`
- \`xcodegen generate --spec project.yml\`
- \`xcodebuild -project OverPowerEsports.xcodeproj -scheme OverPowerEsports -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build\`

GitHub Actions builds an **unsigned iPhone Simulator .app** for QA only.
This cannot be installed on a real physical iPhone. A device-installable IPA
requires Xcode, an Apple Developer Program team, a signing certificate and
provisioning profile, or approved App Store/TestFlight distribution. We will
never provide a fake unsigned IPA.

### Available iPhone solution now
Open https://over-power-esports.vercel.app/app in Safari, tap Share →
Add to Home Screen. It opens the same bank-style software with live
backend updates and supported opt-in browser push.

### Auto updates
Web app features use the same Next.js/Supabase online backend. Publishing
new website code updates the app screens without rebuilding Swift code.
Changes to iOS *native window code* require a new signed app release.
Never embed Supabase service-role credentials or silently collect data.
