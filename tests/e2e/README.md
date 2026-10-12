# E2E (Maestro)

Install the CLI: `curl -fsSL "https://get.maestro.mobile.dev" | bash`. Build and install a dev variant (`pnpm ios:dev` or `pnpm android:dev`), then `pnpm test:e2e` or `maestro test tests/e2e/<flow>.yaml`.

Android: use an API 34 emulator image for Maestro until API 35/36 support is confirmed on CI. Flows identify elements by `testID`, never by text that may change.
