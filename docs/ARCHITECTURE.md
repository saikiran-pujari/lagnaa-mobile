# Architecture

`lagnaa-mobile` is a native React Native application that consumes `lagnaa-server`. It is a separate client from the web app; the backend is the shared source of truth. The architecture optimises for three things: **predictable screen implementation** (every feature is built the same way), **privacy by construction** (sensitive data never outlives its need on the device), and **safe releases** (a bad OTA bundle is recoverable, a bad native build is independent per platform).

```
┌──────────────────────────────────────────────────────────────┐
│ screens (features/*/screens)                                 │
│   use feature hooks only; no fetch, no storage, no navigation │
│   side effects outside the navigation module                  │
├──────────────────────────────────────────────────────────────┤
│ feature hooks (features/*/hooks, queries, mutations)          │
│   compose TanStack Query + small Zustand slices               │
├──────────────────────────────────────────────────────────────┤
│ api (src/api)                                                 │
│   one module per backend domain; Zod-validated responses;     │
│   mobile-facing types; the only place that knows URLs         │
├──────────────────────────────────────────────────────────────┤
│ core (src/core)                                               │
│   http client + session, env, storage, logger, monitoring,    │
│   notifications bridge, updates (OTA seam), deep links        │
├──────────────────────────────────────────────────────────────┤
│ native (android/, ios/)  ·  lagnaa-server (HTTPS)             │
└──────────────────────────────────────────────────────────────┘
```

## Layers and their seams

Vocabulary follows `skills/matt-pocock/codebase-design`: a **module** has an **interface** at a **seam**; depth is leverage per unit of interface.

### `src/core` : deep modules, few interfaces

| Module | Interface (what callers know) | Hidden behind it |
|---|---|---|
| `core/env` | `env.apiBaseUrl`, `env.name`, `env.sentryDsn`, ... (frozen, Zod-validated at startup) | react-native-config, flavor/scheme mapping, fallbacks |
| `core/http` | `apiClient.request(schema, { method, path, body?, query? })` → validated data or `ApiError` | base URL, bearer injection, single-flight refresh, 401 code handling, timeouts, retry policy, request ids |
| `core/session` | `session.state`, `signIn(tokens)`, `signOut(reason)`, `restore()` | Keychain reads/writes, token decode, state machine, Firebase sign-in/out, FCM registration hooks, cache purge |
| `core/storage` | `secure.get/set/delete(key)`, `kv.get/set/delete(key)`, `kv.clearNamespace(ns)` | Keychain for secrets, encrypted MMKV for everything else, per-Member namespaces |
| `core/logger` | `log.debug/info/warn/error(event, fields?)` | console in dev, Sentry breadcrumbs in release, PII redaction |
| `core/monitoring` | `monitoring.init()`, `captureError(e, ctx)`, `setRelease(...)` | Sentry SDK, release/channel tags, scrubbing |
| `core/updates` | `UpdateProvider` interface: `checkAndApply(trigger)`, `currentBundleId()`, `rollbackIfUnhealthy()` | `NoopUpdateProvider` now; `HotUpdaterProvider` in Phase 2 |
| `core/notifications` | `notifications.requestPermission()`, `onOpen(handler)`, `registerToken()` | RN Firebase messaging, channel setup, token lifecycle |
| `core/deeplinks` | `parseDeepLink(url) → Route | null`, `pendingLink` | scheme + universal link patterns, auth gating |
| `core/query` | `queryClient`, `queryKeys` | persistence to MMKV with TTL, offline behaviour |

Each core module accepts its adapters (storage, transport, SDK) at construction so tests replace them at the seam (`core/http` is tested with a fake transport, `core/session` with an in-memory keychain).

### `src/api` : the backend contract

One file per server domain (`auth.ts`, `profile.ts`, `search.ts`, `interest.ts`, `contactRequest.ts`, `message.ts`, `shortlist.ts`, `block.ts`, `report.ts`, `upload.ts`, `notifications.ts`). Each exports functions that take mobile-facing input types and return mobile-facing output types, validating the server response with Zod (`src/api/schemas/*`). Screens and hooks never see the envelope, the `profiles` vs `data` inconsistency, or server field names that differ from the glossary. See `API_ARCHITECTURE.md`.

### `src/features/*` : product domains

`auth`, `onboarding`, `profile`, `discovery`, `connections`, `chat`, `notifications`, `settings`. Each may contain `screens/`, `components/`, `hooks/`, `queries.ts`, `mutations.ts`, `types.ts`, `utils/`. A feature imports from `api`, `core`, `design-system`, `navigation` and from its own folder. Cross-feature imports go through a feature's `index.ts` only and are rare; if two features need the same thing, it moves to `src/shared` or the thing is one feature.

### `src/design-system` : tokens → primitives → components → patterns

No raw colour, spacing or font values outside this folder. See `DESIGN_SYSTEM.md`.

### `src/navigation` : the only place that navigates

Typed route params, navigators, linking config, auth-gated route resolution. Screens call `useAppNavigation()` (typed) and never import React Navigation directly. See `NAVIGATION_ARCHITECTURE.md`.

### `src/app` : composition root

`App.tsx` mounts providers in a fixed order (monitoring → env → query client → session → theme → navigation → updates health check). `bootstrap.ts` runs startup steps with explicit timeouts so a slow network never blocks first paint (see `OTA_ARCHITECTURE.md`, launch sequence).

## Rules that keep the architecture predictable

1. A screen is a function of hook outputs. If a screen contains `fetch`, `AsyncStorage`, `Keychain`, `firebase` or a URL string, the PR is rejected.
2. Server data lives in TanStack Query. Zustand slices hold only: session state, theme preference, in-progress form drafts, transient UI state. See `STATE_MANAGEMENT.md`.
3. The backend decides visibility. The app renders the response it received; it never reconstructs a higher level from cached data.
4. Every network-dependent screen has four explicit states: loading, error (with retry), empty, content. The design-system `QueryBoundary` pattern enforces this.
5. Identifiers: `memberId` (server `userId`) for all relationships; `profileId` only for `GET /profile/:id` and profile views. Never mix.
6. Anything that changes `android/` or `ios/` is a Store Release. Anything else may be an OTA Release, subject to the compatibility rules in `RELEASE_ARCHITECTURE.md`.
7. No secrets in the app. Public identifiers (API base URL, Google client IDs, Sentry DSN, Firebase config) live in `env/` and native config files; nothing else.

## Request lifecycle (example: open a Profile)

```
ProfileDetailScreen
  → useProfile(profileId)                      features/profile/queries.ts
    → queryClient key ['profile', profileId]   core/query
      → api.profile.getById(profileId)         src/api/profile.ts
        → apiClient.request(ProfileResponseSchema, GET /profile/:id)   core/http
          → bearer from core/session; 401 TOKEN_EXPIRED → refresh once → retry
        ← validated ProfileView (public | privateNoContact | privateWithContact)
    ← { data, status, refetch }
  → renders sections according to data.level; photos via <RemotePhoto objectKey=.../>
```

## What is deliberately absent

- No global app store, no Redux, no MobX.
- No GraphQL, no code generation (until the backend publishes OpenAPI; ADR 0005).
- No analytics SDK in the foundation (`OBSERVABILITY.md`).
- No feature flags service; `env` carries the few build-time flags that exist.
