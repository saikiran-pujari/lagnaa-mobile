# 0008. Store Release and OTA Release as separate, gated pipelines

Status: accepted · 2026-10-12

## Context
Native and JS changes have different risk, review and recovery profiles. The brief requires that production never receives every commit, that Android and iOS release independently, and that a bad OTA is recoverable.

## Decision
Tags `v*` trigger signed native builds (Android AAB on ubuntu; iOS archive on macOS once the Apple account exists) attached to a GitHub release; store upload stays manual. OTA publishes to `development` automatically on `main`, to `staging` and `production` by manual promotion with rollout percentage and crash-rate gates. Native fingerprint changes without a version bump fail CI. `versionCode` continues from 3 to replace the existing Play listing.

## Alternatives
- Fastlane-driven automatic store upload: deferred; manual upload is adequate at current release cadence and avoids storing App Store Connect API keys early.
- EAS Build/Submit: rejected, Expo service.

## Consequences
Release managers own promotions. The first iOS release is blocked on an Apple Developer account (documented pre-release step).
