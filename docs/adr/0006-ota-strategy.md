# 0006. OTA: UpdateProvider seam now, hot-updater on Cloudflare in Phase 2

Status: accepted · 2026-10-12

## Context
See `docs/OTA_DECISION.md` for the full evaluation. CodePush is retired; expo-updates requires Expo Modules; hot-updater reached 1.0 in October 2026 and is the only pure-RN self-hosted option with native signature verification.

## Decision
The foundation ships the `UpdateProvider` interface, a `NoopUpdateProvider`, the launch sequence, fingerprint computation, channel-per-flavor configuration and release metadata. hot-updater with the Cloudflare adapter is integrated in Phase 2, after the first signed Store Release exists, behind that seam.

## Alternatives
- expo-updates with a custom server: rejected for native-tree pollution.
- Hosted CodePush descendants: rejected for data control and unverified New Architecture support.
- No OTA: rejected, the product needs fast fixes; but no OTA is the safe default until Phase 2.

## Consequences
Phase 2 is wiring, not architecture. If hot-updater stalls, the provider is swapped. The OTA public key, once embedded, rotates only through a Store Release.
