# OTA architecture

The app always starts from the **embedded bundle** shipped in the Store Release, then, if and only if a verified compatible bundle is already staged, swaps to it on a cold start. The OTA server is never on the startup path.

## Compatibility model

```
Native Runtime (store build)
  runtimeFingerprint = hash(native deps, RN version, android/ + ios/ config)   ← computed at build time
  appVersion = 1.4.0, buildNumber = 23
        │
        ├── OTA bundles tagged with the same fingerprint → compatible
        └── any other fingerprint → rejected by the server and by the client (double check)
```

- Any change under `android/`, `ios/`, to `react-native`, or to a dependency with native code changes the fingerprint and therefore requires a Store Release. CI computes the fingerprint on every PR and fails if it changed without a version bump (`scripts/fingerprint.ts`).
- JS-only changes may ship OTA when they also pass the OTA safety review in `RELEASE_ARCHITECTURE.md`.
- `minSupportedAppVersion` (Gap #3) lets the backend force a store upgrade regardless of OTA.

## Launch sequence

```
native splash (bootsplash)
 1. monitoring.init()                        sync, < 50 ms
 2. env validate                             sync
 3. UpdateProvider.selectBundle()            local only: staged+verified bundle? → load it; else embedded
 4. JS starts; session.restore() with 5 s network cap
 5. navigation mounts; splash hides
 6. UpdateProvider.healthCheck()             10 s window: no fatal JS error, first screen rendered
      → ok: commit bundle as current
      → fail: mark bad, fall back on next start, report
 7. UpdateProvider.checkAndApply('launch')   background, 10 s timeout, download → verify → stage
      also on 'foreground' (max once per 30 min) and 'manual' (Settings › About)
```

Failure behaviour: update server down, CDN down, offline, corrupt download, signature mismatch, incompatible fingerprint, startup crash: each path ends in "keep running what works" and a monitoring event. No UI blocks on an update; "Update available, restart to apply" is a non-modal banner only when a staged bundle is critical (force-update flag).

## Manifest (what the client needs from the server)

`bundleId`, `channel`, `platform`, `targetFingerprint`, `minAppVersion`, `createdAt`, `gitSha`, `fileHashes[]`, `signature`, `forceUpdate`, `rolloutPercent`, `enabled`. The client caches the last manifest for diagnostics (no secrets inside).

## Channels and environments

| Build flavor | Channel | Who gets it |
|---|---|---|
| dev | `development` | engineers; every merge to `main` auto-publishes |
| staging | `staging` | internal testers (Play internal track / TestFlight internal); manual promote |
| prod | `production` | public; manual promote with rollout percentage and 24 h watch on crash rate |

The channel is baked into the build (flavor/scheme). A production binary can never read the development channel.

## Rollback and kill switch

- Console: disable or roll back a bundle; clients that check next receive the previous bundle or an instruction to revert to embedded.
- Client: automatic revert when the health check fails; manual "Reset app updates" in Settings › About for support cases.
- Monitoring: `release` = `appVersion+build`, `dist` = `bundleId`; crash-rate alert per bundle triggers rollback.

## Cache behaviour

Bundles are content-addressed (`bundleId` = hash); downloads are resumable; the previous bundle is kept for one-step rollback; older ones are deleted. Assets are verified by hash before use.

## The `UpdateProvider` seam (ships in the foundation)

```ts
interface UpdateProvider {
  selectBundle(): Promise<void>;                      // native-side, before JS
  checkAndApply(trigger: 'launch'|'foreground'|'manual'): Promise<UpdateResult>;
  healthCheck(): Promise<void>;
  current(): { bundleId: string | 'embedded'; channel: Channel; fingerprint: string };
  reset(): Promise<void>;
}
```

`NoopUpdateProvider` implements it today (always embedded). `HotUpdaterProvider` replaces it in Phase 2.
