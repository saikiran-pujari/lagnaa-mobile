# Contributing

## Branches

`main` is always releasable to the `development` OTA channel. Work happens on short-lived branches: `feat/<area>-<short>`, `fix/<area>-<short>`, `chore/<short>`, `native/<short>` (anything touching `android/` or `ios/`). Rebase on `main` before opening a PR; squash-merge.

## Commits

Conventional Commits: `feat(discovery): saved filters sheet`, `fix(chat): mark-read on focus`, `native(android): add staging flavor`, `docs:`, `chore:`, `test:`. The body says why. Native changes mention the version bump.

## Pull requests

A PR is mergeable when:
- CI is green (lint, typecheck, unit, component, env check, fingerprint check, Android debug build).
- The description names the seam(s) tested and links the issue.
- New dependencies carry the `DEPENDENCY_POLICY.md` gate answers.
- UI changes include light and dark screenshots at 375 pt, and the `ui-ux-pro-max` pre-delivery checklist is ticked.
- Changes to `core/session`, `core/http`, `core/deeplinks`, `core/updates`, `core/storage`, native config or workflows have a security note.
- `GLOSSARY.md`/ADR updated when terms or decisions changed.
- No secrets, no Firebase config files, no keystores, no `.local` env files.

## Architecture rules

See `AGENTS.md` (the same rules apply to humans).

## Testing

`pnpm test` (unit + component) before pushing. E2E locally with `maestro test tests/e2e/<flow>.yaml` against a dev build.

## Releases

- Version bump: `pnpm version <minor|patch>` runs `scripts/sync-version.ts` (updates `versionName`, `MARKETING_VERSION`) and increments `versionCode`/`CURRENT_PROJECT_VERSION`.
- Store Release: tag `v<version>`; build the signed AAB / Xcode archive manually (docs/CI_CD.md) and upload to Play (internal → closed → production) and App Store Connect.
- OTA Release (Phase 2): merges auto-publish to `development`; promote to `staging` and `production` through the OTA workflow with rollout percentage. Never promote to production on a Friday evening.

## Local setup

See `README.md`.
