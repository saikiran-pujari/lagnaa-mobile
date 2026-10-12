# 0009. Image layer: core `Image` behind a `RemotePhoto` primitive, presigned URLs memoised per object key

Status: accepted · 2026-10-12

## Context
Photos live in a private bucket; the server returns presigned URLs valid 1 h that differ on every request, which defeats URL-keyed caches. `react-native-fast-image` is unmaintained; `expo-image` needs Expo Modules; `react-native-nitro-image` is too new.

## Decision
`RemotePhoto` (design-system primitive) is the only image component for remote photos. It takes `{ objectKey, url?, expiresAt? }`, resolves and memoises the presigned URL per `objectKey` until `expiresAt`, renders RN core `Image` with decode-size caps, and renders `GatedPhoto` when no URL is authorised. The OS HTTP cache handles bytes; no app-level disk cache in v1.

## Alternatives
- `@d11/react-native-fast-image` (maintained fork): deferred; adopt behind the same primitive if measurements show cache misses or memory problems.
- Download photos to app storage: rejected (privacy, sandbox growth).

## Consequences
Cache efficiency depends on URL reuse within the hour; a backend thumbnail endpoint is a follow-up for list performance.
