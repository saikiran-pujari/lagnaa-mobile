# Testing strategy

Tests exist to protect critical journeys and the seams that make screens predictable, not to mirror implementation. Follow `skills/matt-pocock/tdd`: tests live at agreed seams and read like specifications.

## Layers

| Layer | Tool | Seam | What it protects |
|---|---|---|---|
| Unit | Jest 29 + `@react-native/jest-preset` | `core/*` interfaces, `api/*` functions with a fake transport, pure utils | token refresh and sign-out rules, response contract parsing, env validation, deep-link parsing, OTA compatibility logic, profile strength, formatters |
| Component | React Native Testing Library 14 | design-system components and feature components rendered with providers | states (loading/error/empty/content), accessibility labels, pressed/disabled behaviour, theme contrast snapshots (light + dark) |
| Integration (JS) | Jest + fake transport + MSW-style recorded responses | feature hooks + api + core together | "send interest from a card updates the card and the stats" without native |
| E2E | Maestro (YAML flows) on iOS simulator and Android emulator (API 34 image for Maestro compatibility) | the built app against a stubbed or dev backend | critical journeys only |

## Critical journeys (E2E, in order of implementation)

1. Cold start → sign in with email + password → Home renders.
2. Register (4 steps, OTP stubbed in dev) → Onboarding basics → Home.
3. Discover → open profile → send interest → Connections › Sent shows it.
4. Receive interest (seeded) → accept → chat thread → send message → message appears.
5. Request contact → accept on the other account (seeded) → contact visible.
6. Sign out → Keychain empty, Home not reachable, deep link replay after sign-in.

## Rules

- A test at an unagreed seam is a review finding. Seams are the module interfaces in `ARCHITECTURE.md`.
- No mocking of internal collaborators; replace adapters at the seam (fake transport, in-memory keychain, in-memory MMKV).
- Expected values come from fixtures captured from the real server (`tests/unit/api/fixtures/*.json`), never recomputed by the test.
- Snapshot tests only for theme token tables (to catch accidental palette changes), never for component trees.
- Each feature PR adds at least one component test for a new state and one unit test per new `api` function.

## Infrastructure (ships in the foundation)

- `jest.config.js` with the RN preset, Reanimated's Jest resolver (`react-native-reanimated/jest/resolver`, which also resolves Worklets to its web implementation) and `setUpTests()` in `tests/setup/jest.after-env.ts`; `tests/setup/jest.setup.ts` fakes keychain, MMKV, config, Firebase, Sentry and bootsplash; path aliases via `moduleNameMapper`. RNTL 14: `render` is async (`await renderWithProviders(...)`), matchers are built in.
- `tests/setup/render.tsx`: `renderWithProviders()` wrapping QueryClient, ThemeProvider, NavigationContainer.
- `tests/setup/fakes/`: `FakeTransport`, `MemoryKeychain`, `MemoryKV`.
- `tests/e2e/`: `smoke.yaml` (launch, splash gone, sign-in screen visible) and a `README.md` for running Maestro locally and in CI.
- CI runs unit + component on every PR; E2E on `main` nightly and on release tags.
