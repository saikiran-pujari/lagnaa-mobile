# OTA decision

Status: **decided** (Round 1 Q5, Round 2 Q16). Integration happens in Phase 2, after the first signed Store Release defines a Native Runtime.

## Options evaluated (October 2026)

| | hot-updater 1.0.x | expo-updates (custom protocol server) | Bitrise / Revopush / Stallion (hosted CodePush-style) | Microsoft CodePush | Defer entirely |
|---|---|---|---|---|---|
| Maintenance | GA 2026-10 after a long rc line; one primary maintainer; active | Expo team; very active | Vendors; SDK forks of CodePush | App Center retired 2025-03-31; server archived 2025-05 | n/a |
| RN 0.87 / New Arch | New Arch supported; bare adapter `@hot-updater/bare` | Yes, but requires `expo` + Expo Modules in `MainApplication`/`AppDelegate`/Podfile | Mostly legacy-bridge SDKs; New Arch support unverified | Legacy bridge; no | n/a |
| Self-hosted | Yes: Cloudflare (R2 + D1 + Worker), Supabase, AWS, Firebase | Yes: any server implementing the Expo Updates protocol | No (hosted) | Fork of archived server | n/a |
| Signing / integrity | Native `SignatureVerifier`; per-file SHA-256 `fileHash` (verified in package source); key via adapter (KMS/local) | Manifest signature (RSA-SHA256 by example) with embedded cert; SHA-256 per asset | Vendor-dependent | Package hash only | n/a |
| Rollback | Console rollback + force update; app falls back to embedded bundle on failure | `rollBackToEmbedded` directive; embedded fallback | Vendor | Yes | n/a |
| Staged rollout / channels | Channels + semver targeting (`appVersion`) or fingerprint strategy; cohort service in client | `metadata` + manifest filters (channels are a server convention) | Vendor | Deployment keys | n/a |
| Bundle size | bsdiff Hermes patches | Full bundles | Patches (Stallion) | Full | n/a |
| Operational load | Cloudflare Worker + R2 + D1 + console; our keys | Write and run a protocol server; our keys | Vendor account; data leaves our control | Run an archived server | none |
| Risk | Young 1.0; single maintainer | Expo Modules in the native tree; Expo config conventions bleed in | Vendor lock-in, policy exposure | Dead | No OTA |

## Decision

**hot-updater on Cloudflare**, behind the `UpdateProvider` seam, integrated in Phase 2.

Reasons: pure React Native (no Expo Modules), New Architecture, self-hosted on infrastructure we already pay for (Cloudflare has no egress fees for R2, which matters for OTA downloads at scale), native signature and hash verification, bsdiff patches, console with rollback and force-update, and a bare-CLI build adapter. The seam contains the maintenance risk: if the project stalls, `HotUpdaterProvider` is replaced without touching screens.

Rejected: expo-updates (native tree pollution contradicts the "no Expo workflow" rule even if technically allowed); hosted CodePush descendants (data and policy exposure, unverified New Arch); CodePush (dead); defer-only (we still ship the seam now so Phase 2 is wiring, not architecture).

## Architecture when integrated

```
CI (tag ota/<channel>/<n>) → pnpm hot-updater deploy --channel <channel> --platform ios|android
   → bundle (Hermes bytecode) + manifest signed with the release key (Cloudflare KMS-backed or CI secret)
   → R2 object + D1 row { bundleId, channel, platform, targetAppVersion|fingerprint, hash, signature, enabled, rollout% }
App launch → UpdateProvider.checkAndApply('launch')
   → GET worker /check?platform&appVersion&fingerprint&channel&bundleId
   → compatible newer bundle? download → verify signature + file hashes → stage
   → apply on next cold start (never mid-session) → health check (first screen rendered, no JS crash in 10 s)
   → unhealthy: provider marks bundle bad, restarts on previous/embedded bundle, reports to monitoring
```

## Operational requirements

- Cloudflare account with R2 bucket, D1 database, Worker; release signing key pair (private key only in CI secrets / KMS; public key embedded in the app, rotation requires a Store Release).
- Console access limited to release managers.
- Channels: `development` (every merge to `main`), `staging` (manual promote), `production` (manual promote with rollout percentage, starting at 10%).
