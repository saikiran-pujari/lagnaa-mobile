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
