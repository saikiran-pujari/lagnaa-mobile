# 0007. Jest + React Native Testing Library + Maestro

Status: accepted · 2026-10-12

## Context
The brief requires unit, component and E2E layers chosen for compatibility with RN 0.87 and the New Architecture, covering critical journeys rather than implementation details.

## Decision
Jest 29 with `@react-native/jest-preset` for unit and integration tests at module seams; RNTL 14 for components; Maestro for E2E (black-box through accessibility APIs, no RN internals, works on New Architecture without configuration). Detox is not used.

## Alternatives
- Detox: grey-box synchronisation with the RN runtime requires New Architecture-specific setup and is slower to stabilise; its advantage (speed on mature suites) does not apply yet.
- Appium: heavier, slower, no RN benefit.

## Consequences
Maestro flows need an Android API 34 emulator image until Maestro's API 35/36 support is confirmed on our CI; iOS simulators are fine. E2E runs nightly and on tags, not per PR.
