# Release architecture

Two release mechanisms with a hard boundary between them.

## Store Release (Native Runtime)

Required when any of these change: native code or configuration (`android/`, `ios/`), native dependencies or their versions, React Native version, permissions, entitlements, capabilities (push, universal links), signing, app icon/splash, build flavors, the OTA public key, the Sentry native SDK, Firebase SDKs, minimum OS versions, or any change that alters the app's primary purpose or adds a feature category the store review has not seen.

```
tag v<semver>  →  CI builds signed AAB (Android) and signed archive (iOS, when configured)
             →  artifacts attached to the GitHub release
             →  human uploads: Play Console internal → closed → production (staged); TestFlight → App Store
```

Android and iOS are released independently; a platform-specific fix ships for that platform only. Store releases are the only way to change the Native Runtime fingerprint.

## OTA Release (compatible application code)

Allowed content: React components, styles, navigation logic, JS business logic, API integration, copy, bundled JS assets (images, fonts already registered natively), bug fixes.

Not allowed OTA even though "JS-only":
- anything that depends on a native module, prop or permission that the target Native Runtime does not have (the fingerprint check enforces most of this; the review catches the rest);
- new asset types requiring native registration (fonts);
- changes that alter the app's primary purpose, add in-app purchase flows, or add capabilities Apple or Google would review (policy boundary, see below);
- changes to security-sensitive JS (token handling, OTA client, deep-link resolution) without a security review;
- large bundles over the size budget (`PERFORMANCE.md`) without staged rollout.

```
merge to main  →  development channel (automatic)
promote        →  staging channel (manual, after QA on internal builds)
promote        →  production channel at 10% → 50% → 100% (manual, crash-rate gated)
```

## Policy boundary

Apple's Developer Program License Agreement permits downloaded interpreted code that does not change the app's primary purpose, does not create a store for other code, and does not bypass OS security; Google Play's policy exempts code run by an interpreter without direct access to Android APIs. OTA is used for **compatible application code**, never to ship features that avoid review. If a change would be a new feature in release notes, it goes through a Store Release first; OTA then carries the fixes to it.

## Versioning and identifiers

| Identifier | Source | Example |
|---|---|---|
| `appVersion` | `package.json` version (semver), mirrored to `versionName` / `MARKETING_VERSION` by `scripts/sync-version.ts` | 1.4.0 |
| `buildNumber` | `versionCode` / `CURRENT_PROJECT_VERSION`, monotonically increasing per platform; Android continues from 3 | 23 |
| `runtimeFingerprint` | `scripts/fingerprint.ts` at build time | `a91c…` |
| `bundleId` | OTA content hash | `3f7e…` |
| `gitSha` | CI | |
| `environment` / `channel` | flavor/scheme | prod / production |

All six are exposed by `core/env.release` and attached to monitoring events and Settings › About.

## Safety

- Semantic versioning for `appVersion`; a breaking API change on the backend is coordinated with `minSupportedAppVersion` (Gap #3).
- Kill switch: OTA console disable + `maintenance` flag from `/app/config` (gap).
- Forced store upgrade: `minSupportedAppVersion` below the installed version renders a blocking "Update Lagnaa" screen with a store link.
- A bad OTA bundle is recoverable in three ways: automatic health-check revert, console rollback, user reset.
- A bad Store Release is recoverable only by a new Store Release; therefore every Store Release goes through internal and closed tracks first.
