# CI/CD

GitHub Actions, kept minimal. Secrets never appear in logs; release uploads to stores stay manual.

## `ci.yml` (pull requests and `main`)

```
checkout → pnpm install --frozen-lockfile → env:check → lint → typecheck → test:unit → test:component
        → fingerprint check (fails if native fingerprint changed without version bump)
        → android debug build (ubuntu, Gradle cache)               ← every PR
        → ios debug build (macos, CocoaPods cache)                 ← main merges and release tags only
```

Quality gates fail the job; nothing is advisory.

## `android-release.yml` (tag `v*`)

Decode upload keystore from secrets → `gradlew bundleProdRelease` with `ANDROID_KEYSTORE_*` env → upload AAB + mapping file as release artifacts → upload source maps to Sentry (when DSN configured). Human uploads to Play Console.

## `ios-release.yml` (tag `v*`, enabled once an Apple Developer team and App Store Connect record exist)

Import certificate + provisioning profile from secrets into a temporary keychain → `xcodebuild archive` + `exportArchive` (App Store method) → upload IPA artifact. Human uploads via Transporter or `altool`.

## `ota-release.yml` (Phase 2; tag `ota/<channel>/<n>` or manual dispatch)

Build JS bundle for both platforms → sign → `hot-updater deploy --channel` → post bundle id and fingerprint to the run summary. Production channel requires a manual approval environment and a rollout percentage input.

## `nightly.yml`

E2E (Maestro) against the development build on an iOS simulator and an Android API 34 emulator.

## Caching

pnpm store, Gradle (`~/.gradle/caches`, wrapper), CocoaPods (`ios/Pods` keyed by `Podfile.lock`), Xcode DerivedData keyed by `Podfile.lock` + `pnpm-lock.yaml`.

## Required secrets (names only)

`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `GOOGLE_SERVICES_JSON_{DEV,STAGING,PROD}`, `GOOGLE_SERVICE_INFO_PLIST_{DEV,STAGING,PROD}`, `SENTRY_AUTH_TOKEN`, `IOS_CERTIFICATE_P12_BASE64`, `IOS_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `OTA_SIGNING_PRIVATE_KEY`, `CLOUDFLARE_API_TOKEN`.
