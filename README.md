# Lagnaa Mobile

Native iOS and Android app for Lagnaa, built with React Native 0.87 (bare, New Architecture, Hermes). Backend: `lagnaa-server`. Web client: `lagnaa-client`.

Status: **foundation phase**. Architecture and tooling are in place; product screens come next (see `docs/IMPLEMENTATION_PLAN.md`).

## Read first

1. `CONTEXT.md`: what Lagnaa is and the words we use.
2. `docs/ARCHITECTURE.md`: how the app is built.
3. `docs/MOBILE_PRODUCT_SURFACE.md`: what it does.
4. `docs/adr/`: why.

## Prerequisites (macOS)

- Node 22.13+ (`.nvmrc`), pnpm 10 (`corepack enable && corepack prepare pnpm@latest --activate`)
- Xcode 26.x with iOS 16+ simulators, CocoaPods
- Android Studio with SDK Platform 37, Build-Tools 37.0.0, NDK 27.1.12297006, an emulator (API 34 recommended for Maestro)
- JDK 17+ (`JAVA_HOME`, Android Studio's bundled JBR works), `ANDROID_HOME`
- Watchman (recommended), Maestro CLI (E2E)

## Setup

```bash
pnpm install
pnpm env:check
cd ios && pod install && cd ..
```

Firebase configs (`google-services.json`, `GoogleService-Info.plist`) are optional for debug builds; without them push and realtime report "not configured".

## Run

```bash
pnpm start                      # Metro
pnpm android:dev                # dev flavor on emulator/device
pnpm ios:dev                    # Lagnaa-Dev scheme on simulator
```

Staging and production variants: `pnpm android:staging`, `pnpm ios:staging`, `pnpm android:prod`, `pnpm ios:prod`.

Notes: iOS simulator builds must be (ad-hoc) signed so the Keychain entitlements apply; `run-ios` does this, a bare `xcodebuild … CODE_SIGNING_ALLOWED=NO` produces an app whose Keychain calls fail. The brand fonts (Playfair Display, Inter) are referenced by the design tokens but not yet bundled; text falls back to system fonts until Phase 1 adds them under `assets/fonts` with `react-native.config.js`.

## Screen preview in the browser (dev convenience)

```bash
pnpm web
```

Renders the app with `react-native-web` and shims for native modules (`web/shims`). It is for looking at screens quickly, not a supported client: native behaviour (keychain, MMKV, push, splash, gestures) is faked, and nothing in `web/` is linted, typechecked or released. The real web client lives in `lagnaa-client`.

## Quality

```bash
pnpm lint · pnpm typecheck · pnpm test · pnpm test:e2e · pnpm fingerprint
```

## Environments, releases, OTA

`docs/ENVIRONMENT_ARCHITECTURE.md`, `docs/RELEASE_ARCHITECTURE.md`, `docs/OTA_ARCHITECTURE.md`.

## Agents

`AGENTS.md`. Skills under `skills/`.
