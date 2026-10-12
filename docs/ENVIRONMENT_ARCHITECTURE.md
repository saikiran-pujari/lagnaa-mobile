# Environment architecture

Three environments, each a separate installable app, each with its own public configuration. No URL or key is written anywhere except `env/` and the native config that mirrors it.

| | development | staging | production |
|---|---|---|---|
| Android `applicationId` | `in.lagnaa.app.dev` | `in.lagnaa.app.staging` | `in.lagnaa.app` |
| iOS bundle id | `in.lagnaa.app.dev` | `in.lagnaa.app.staging` | `in.lagnaa.app` |
| Display name | Lagnaa Dev | Lagnaa Staging | Lagnaa |
| Android flavor / iOS scheme | `dev` / `Lagnaa-Dev` | `staging` / `Lagnaa-Staging` | `prod` / `Lagnaa` |
| `API_BASE_URL` | `http://localhost:3003/api` (emulator: `10.0.2.2`) | `https://service.lagnaa.in/api` (no staging backend yet, Gap #12) | `https://service.lagnaa.in/api` |
| `OTA_CHANNEL` | development | staging | production |
| `OTA_UPDATE_URL` | Cloudflare worker (dev) | worker (staging) | worker (prod) |
| `SENTRY_DSN` / `SENTRY_ENV` | empty = disabled / development | DSN / staging | DSN / production |
| Firebase app | dev app in the Lagnaa Firebase project | staging app | prod app |
| Google client IDs | shared web/iOS/Android ids from GCP `lagnaa-auth` | same | same |
| Logging | verbose, console | info, Sentry breadcrumbs | warn, Sentry |
| Dev menu / Flipper | on | off | off |

## Mechanism

- `env/.env.development`, `env/.env.staging`, `env/.env.production` are committed (public values only). `react-native-config` reads the file selected per Android flavor (`project.ext.envConfigFiles` in `android/app/build.gradle`) and per iOS build configuration (`ENVFILE` set on the `react-native-config` pod in the `Podfile` `post_install`), exposing values to Gradle, Xcode and JS.
- iOS has six build configurations (`Debug-Dev`, `Release-Dev`, `Debug-Staging`, `Release-Staging`, `Debug-Prod`, `Release-Prod`) and three shared schemes (`Lagnaa-Dev`, `Lagnaa-Staging`, `Lagnaa`), generated deterministically by `scripts/ios-configure.rb` (run with CocoaPods' Ruby: `GEM_HOME=$(brew --prefix)/Cellar/cocoapods/<ver>/libexec $(brew --prefix)/opt/ruby/bin/ruby scripts/ios-configure.rb`). Re-run it after any manual Xcode change to keep configurations in sync.
- `src/core/env/index.ts` parses `Config` with a Zod schema at startup and exports a frozen `env` object. A missing or malformed value fails fast in dev and reports in release with safe defaults where one exists (never a different API host).
- Firebase config files are **not** committed: `android/app/src/<flavor>/google-services.json` and `ios/Firebase/<Scheme>/GoogleService-Info.plist` are gitignored and injected by CI from secrets; Gradle and the Xcode build phase apply them only when present (Q19).
- Secrets never enter `env/`: keystore passwords, Sentry auth token (for source-map upload), OTA signing private key and Cloudflare API tokens live in CI secrets or local, gitignored files.

## Local overrides

`env/.env.development.local` (gitignored) overrides values for a developer's machine (LAN IP for a physical device, a feature flag). CI never uses `.local` files.

## Checking

`pnpm env:check` validates all three files against the schema and that production contains no `localhost`, no `http://`, and no empty required values. It runs in CI and in the pre-commit hook.
