# 0002. Own the native projects; no managed native generation

Status: accepted · 2026-10-12

## Context
The previous Expo app regenerated `android/` on every `prebuild`, which required a patch script to restore release signing and made native configuration (flavors, Firebase, permissions) fragile. Store releases, OTA fingerprints and security hardening all depend on deterministic native projects.

## Decision
`android/` and `ios/` are committed and edited directly. Three Android product flavors (`dev`, `staging`, `prod`) and three iOS schemes with xcconfig own bundle ids, names, env files and Firebase configs. No tool may regenerate these directories; changes are reviewed like any code.

## Alternatives
- Expo prebuild with config plugins: rejected (see context).
- Single flavor with runtime environment switching: rejected, dev/staging/prod must install side by side and a production binary must not be able to point at a dev backend.

## Consequences
Native upgrades are manual diffs (upgrade helper). Developers need the full native toolchain. The fingerprint of these directories is the Native Runtime identity for OTA.
