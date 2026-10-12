# 0001. React Native 0.87 stable, bare (community CLI), New Architecture

Status: accepted · 2026-10-12

## Context
The brief requires the latest stable React Native without the Expo framework, with owned `android/` and `ios/` projects. On 2026-10-12 the stable line is 0.87.1; 0.88 is at rc.4 and excluded by the no-prerelease rule. RN 0.87 raised minimums to Node 22, AGP 9, Kotlin 2.0+ and made the Strict TypeScript API default.

## Decision
Scaffold from `@react-native-community/template@0.87.2` with `@react-native-community/cli` 20.2, React 19.2.3, New Architecture and Hermes enabled, edge-to-edge enabled. Pin native-facing dependencies exactly. Upgrade RN only via dedicated PRs following the upgrade helper.

## Alternatives
- Expo SDK 57 (prebuild/CNG): rejected, managed native projects contradict native ownership and the brief.
- RN 0.86 (previous stable): rejected, 0.87 is stable and avoids an immediate upgrade; Reanimated 4.7 supports 0.86–0.88 either way.
- RN 0.88 rc: rejected, prerelease.

## Consequences
Strict TypeScript API means some community libraries' types need the compatibility opt-out until updated (`@react-native/strict-api` opt-out exists through 0.88). AGP 9 requires `android.builtInKotlin=false`/`android.newDsl=false` compatibility flags until all native modules migrate. ESLint 10, Jest 30, TS 7 and React 19.3 wait for RN peers.
