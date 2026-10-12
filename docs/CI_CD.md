# CI/CD

GitHub Actions, kept minimal. Secrets never appear in logs; release uploads to stores stay manual.

## `ci.yml` (pull requests and `main`)

```
checkout → pnpm install --frozen-lockfile → env:check → lint → typecheck → format:check → test (unit + component)
        → fingerprint check (fails if native fingerprint changed without version bump)
        → gitleaks secrets scan (config: .gitleaks.toml; lockfile checksums allow-listed)
```

Quality gates fail the job; nothing is advisory. Runs on Linux in about two minutes and needs no secrets.

## TODO: native build validation (deliberately not in CI yet)

Decision 2026-10-12: no Android or iOS build runs in CI. Native breakage (changes under `android/`, `ios/`, native dependency bumps, Gradle/Pod config) is caught locally by building before a store release, not by CI. Reason: both jobs take 15–25 minutes and the iOS one needs macOS runners billed at 10× the Linux rate, which is wasteful for a one-person repo with manual releases.

When to reinstate: a second contributor, or the first time a native regression reaches `main` unnoticed. The intended shape is a separate `native-build.yml`:

- `on.push` / `on.pull_request` with `paths`: `android/**`, `ios/**`, `package.json`, `pnpm-lock.yaml`, `.runtime-fingerprint`, `babel.config.js`, `metro.config.js`, `react-native.config.js`; plus `workflow_dispatch` for an on-demand run before cutting a store build.
- Android job (ubuntu): `setup-java` 17 → `android-actions/setup-android@v3` with explicit `packages: platforms;android-37.0 build-tools;37.0.0 platform-tools` (the action's default package list references the retired `tools` package) → `gradle/actions/setup-gradle` → `./gradlew assembleDevDebug`.
- iOS job (macos-15): `pod install` with `LANG=en_US.UTF-8` using the runner's CocoaPods (no Bundler) → `xcodebuild -workspace ios/Lagnaa.xcworkspace -scheme Lagnaa-Dev -configuration Debug-Dev -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build`. Build validation only; an unsigned simulator app cannot use the Keychain, so never launch it.
- Cache `~/.gradle` and `ios/Pods` keyed by the lockfiles.

The last working versions of these jobs are in git history (commit "Add Gitleaks configuration…" and the fix that followed).

## Release builds: manual (decision 2026-10-12)

Store builds are produced by hand on a developer machine and uploaded manually:

- Android: `pnpm android:bundle:prod` with `ANDROID_KEYSTORE_*` env vars or a gitignored `android/credentials.json`; upload the AAB from `android/app/build/outputs/bundle/prodRelease/` in Play Console (internal → closed → production).
- iOS: Xcode, scheme `Lagnaa`, Product → Archive, distribute to App Store Connect (requires an Apple Developer team; not set up yet).
- OTA (Phase 2, optional): `hot-updater deploy --channel <channel>` from a release manager's machine.

The workflows that automated these (`android-release.yml`, `ios-release.yml`, `ota-release.yml`) were removed to keep the repo small; recreate them from `docs/RELEASE_ARCHITECTURE.md` if release automation becomes worth it. `ci.yml` stays: it is validation, not release.

## Caching

pnpm store, Gradle (`~/.gradle/caches`, wrapper), CocoaPods (`ios/Pods` keyed by `Podfile.lock`), Xcode DerivedData keyed by `Podfile.lock` + `pnpm-lock.yaml`.

## Required secrets (names only)

`ci.yml` needs none beyond the default `GITHUB_TOKEN` (used by the secrets scan). Signing material, Firebase configs and OTA keys stay on the release manager's machine while releases are manual.
