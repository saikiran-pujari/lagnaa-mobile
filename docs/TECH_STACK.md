# Tech stack and compatibility matrix

Every version below was verified against the npm registry, the `@react-native-community/template@0.87.2` package and `@react-native/gradle-plugin@0.87.1` on 2026-10-12. Re-verify before upgrading; versions drift monthly. Rule: production builds never use nightly, canary, alpha, beta or release-candidate versions.

## Native toolchain

| Component | Version | Reason |
|---|---|---|
| React Native | **0.87.1** | Latest stable (0.88 is at rc.4). First release with AGP 9, Metro 0.87, Strict TypeScript API default. |
| React | **19.2.3** | Pinned by the RN 0.87 template; `@react-native/jest-preset` peers `^19.2.3`. (19.3.0 exists; not yet supported by the preset.) |
| New Architecture | enabled | Required by RN Firebase 26, react-native-mmkv 4, Nitro Modules; default since RN 0.76. |
| Hermes | enabled (bundled) | Default engine; required for OTA bytecode diffing. |
| Node.js | **22.21.1** locally; CI `22.x` | RN 0.87 requires ≥ 22.13 (`@react-native/metro-config` engines). |
| Package manager | **pnpm 12** (`nodeLinker: hoisted` in `pnpm-workspace.yaml`) | Project preference; hoisting keeps the flat `node_modules` Metro, autolinking and Gradle expect. pnpm 10+ reads project settings only from `pnpm-workspace.yaml`; `.npmrc` is auth/registry only. Postinstall scripts are allow-listed (`allowBuilds`) and packages younger than 24 h are refused unless listed in `minimumReleaseAgeExclude`. |
| TypeScript | **~6.0** | Template version; `@react-native/typescript-config` and eslint-config lag TS 7.0. TS 6 deprecates `baseUrl`; path aliases are relative to `tsconfig.json`. |
| Metro | 0.87 (via `react-native`) | Bundled with RN. |
| Android Gradle Plugin | **9.2.1** | Pinned by `@react-native/gradle-plugin@0.87.1` (`libs.versions.toml`). |
| Gradle | **9.4.1** | Template wrapper; AGP 9.x requires Gradle ≥ 9.1. |
| Kotlin | **2.2.0** | Template `kotlinVersion`; AGP 9 has built-in Kotlin (template sets `android.builtInKotlin=false`, `android.newDsl=false` for library compatibility). |
| JDK | **17 minimum**; Android Studio JBR 21 used locally | AGP 9 minimum is 17. |
| compileSdk / targetSdk / minSdk | **37 / 36 / 24** | Template values. Play requires target 36 since 2026-08-31. minSdk 24 keeps the Indian long tail of Android 7 devices. The SDK package is named `platforms;android-37.0` (minor-versioned SDKs); `android-37` does not exist. |
| Android Build-Tools | 37.0.0 | Template. |
| NDK | 27.1.12297006 | Template; already installed locally. |
| Xcode | **26.5** (installed) | RN asks for "the latest Xcode". |
| iOS deployment target | **16.0** | Decision (Q11). RN minimum is 15.1; 16 drops a negligible share and keeps modern APIs available. |
| CocoaPods | latest 1.16.x | Default RN iOS dependency manager. SwiftPM support in 0.87 is experimental and not used. |
| Watchman | latest | Recommended by RN for Metro file watching on macOS. |

## JavaScript dependencies

| Package | Version | Role | Compatibility note |
|---|---|---|---|
| `@react-navigation/native` | 7.5.x | Navigation container, linking | peers `react >= 18.2`, any RN |
| `@react-navigation/native-stack` | 7.20.x | Stack navigator (native screens) | peers screens ≥ 4, safe-area ≥ 4 |
| `@react-navigation/bottom-tabs` | 7.20.x | Tab navigator | |
| `react-native-screens` | 4.29.x | Native screen containers | 4.27 added RN 0.87 support |
| `react-native-safe-area-context` | 5.10.x | Insets | template ships ^5.5 |
| `react-native-gesture-handler` | 3.3.x | Gestures | |
| `react-native-reanimated` | 4.7.x | Animation | peers `react-native: 0.86 - 0.88`, worklets 0.13.x |
| `react-native-worklets` | 0.13.x | Required by Reanimated 4 | |
| `@tanstack/react-query` | 5.104.x | Server state | |
| `zustand` | 5.0.x | Client state | |
| `zod` | 4.6.x | Runtime validation at the API seam and env | server uses Zod 3; mobile is independent |
| `react-native-keychain` | 10.0.x | Keychain / Keystore for tokens | last release 2025-03; stable, small surface; monitor |
| `react-native-mmkv` | 4.3.x | Encrypted fast KV (cache, prefs) | Nitro module; needs `react-native-nitro-modules` 0.37.x |
| `@shopify/flash-list` | 2.3.x | Virtualized lists | v2 is New Arch only |
| `react-native-svg` | 15.15.x | Vector icons | |
| `lucide-react-native` | latest | Icon set (consistent stroke) | depends on react-native-svg |
| `react-native-bootsplash` | 7.3.x | Native splash screen | |
| `react-native-edge-to-edge` | 1.8.x | System bars with edge-to-edge | RN 0.87 template enables edge-to-edge |
| `react-native-keyboard-controller` | 1.22.x | Keyboard-aware layouts | peers reanimated ≥ 3 |
| `react-native-config` | 1.7.x | Build-time env per flavor/scheme | |
| `@react-native-firebase/app`, `messaging`, `database` | 26.4.x | FCM/APNs push, RTDB realtime | v26 requires New Architecture; modular API only. iOS uses CocoaPods distribution with static frameworks (`$RNFirebaseDisableSPM = true`); Firebase stops publishing CocoaPods after Oct 2026, so the SPM + dynamic-linkage migration is a tracked Phase 2 task. |
| `@react-native-google-signin/google-signin` | 16.1.x | Native Google Sign-In | |
| `@sentry/react-native` | 8.30.x | Crash + error monitoring | 8.16 fixed RN 0.87 iOS header break |
| `hot-updater` + `@hot-updater/react-native` + `@hot-updater/bare` + `@hot-updater/cloudflare` | 1.0.x | OTA (Phase 2) | GA 2026-10; see `OTA_DECISION.md` |

## Dev dependencies

| Package | Version | Note |
|---|---|---|
| `@react-native-community/cli*` | 20.2.x | Template |
| `@react-native/{babel-preset,metro-config,typescript-config,eslint-config,jest-preset}` | 0.87.1 | Match RN exactly |
| `eslint` | 9.x | RN eslint-config peers `^8 \|\| ^9`; ESLint 10 is not yet supported |
| `typescript-eslint` | 8.x | |
| `prettier` | 3.x | |
| `jest` | 29.x | Template; RNTL peers ≥ 29 |
| `@testing-library/react-native` | 14.x | peers RN ≥ 0.78, React ≥ 19 |
| Maestro CLI | latest | E2E; installed outside npm |

## Rejected or deferred

- **Expo framework, Expo Router, expo-updates, expo-image**: all require `expo` + Expo Modules in the native tree (ADR 0002, 0006).
- **react-native-fast-image**: unmaintained since 2024; does not start under Fabric without patches. If disk caching beyond the OS HTTP cache is needed, evaluate `@d11/react-native-fast-image` (ADR 0009).
- **react-native-nitro-image**: too new for production; revisit for on-device resizing.
- **axios**: `fetch` is native in RN; a thin typed client is enough (ADR 0005).
- **react-native-code-push**: retired with App Center (2025-03-31).
- **TypeScript 7, ESLint 10, Jest 30, React 19.3**: blocked by RN 0.87 peer ranges; revisit with RN 0.88.
