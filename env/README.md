# env/

Public, build-time configuration per environment, consumed by `react-native-config` (Android product flavor / iOS scheme selects the file) and validated by `src/core/env` at startup.

- Values here ship inside the binary and are readable by anyone. Never add secrets.
- `*.local` files override values on one machine and are gitignored.
- `pnpm env:check` validates all three files and refuses `localhost`/`http://` in production.
