# Dependency policy

Every dependency is a liability that outlives the feature that introduced it. Add one only when it clears the gate below, and record the result in the pull request.

## Gate

Before `pnpm add`, answer in the PR description:

1. **Problem**: what cannot be done with React Native core, an existing dependency, or 50 lines of our own code?
2. **Maintenance**: last release date, open issue trend, number of maintainers, response time on recent issues. Anything without a release in 12 months is presumed abandoned.
3. **Compatibility**: supports the pinned React Native version, the **New Architecture** (Fabric + TurboModules, bridgeless), iOS 16+ and Android API 24+. Check `peerDependencies` ranges, not just the README.
4. **Native impact**: does it add native code? If yes: Kotlin/Swift (preferred) or Objective-C/Java; does it need `AndroidManifest`/`Info.plist` changes, new permissions, or a Gradle plugin? A native dependency changes the Native Runtime and forces a Store Release.
5. **Size**: JS bundle delta (`pnpm why`, bundle visualiser) and native binary delta.
6. **Security**: known advisories (`pnpm audit`), install scripts, network access at build time.
7. **License**: MIT, BSD, Apache-2.0 or ISC. Anything else needs an explicit decision.
8. **Overlap**: does an existing dependency already solve this? Two libraries for the same job is a defect.

## Rules

- Pin exact versions for everything that touches native code (`react-native`, navigation, reanimated, screens, Firebase, Sentry, MMKV, keychain, OTA). Caret ranges only for pure-JS libraries.
- `pnpm-lock.yaml` is committed and CI uses `--frozen-lockfile`.
- Upgrades of `react-native` are their own PR, following the upgrade helper diff, and bump the Native Runtime fingerprint.
- No dependency may be added by an agent without the gate answers in the PR. The `skills/matt-pocock/code-review` skill treats a missing gate as a blocking finding.
- Remove a dependency when its last use goes; `knip` (or `pnpm why`) runs in CI to flag unused packages.
- Prefer libraries maintained by Software Mansion, Callstack, Shopify, Margelo, Invertase, Expo (pure-JS or Expo-Module-free packages only) or the React Native Community; they track RN releases closely.

## Current exceptions

- `react-native-keychain` 10.0 has had no release since 2025-03. Accepted because its surface is tiny and stable and it wraps OS APIs directly; revisit if an RN upgrade breaks it.
- `hot-updater` reached 1.0 in October 2026 with a single primary maintainer. Accepted behind the `UpdateProvider` seam so it can be replaced (ADR 0006).
