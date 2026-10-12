# AGENTS.md

Entry point for any coding agent (Claude Code reads it through `CLAUDE.md`; Cursor and Codex read it directly). Read this, then `CONTEXT.md`, then the doc the task needs.

## What this repository is

The Lagnaa mobile app: React Native 0.87 (bare, New Architecture), TypeScript strict, owned `android/` and `ios/`. It consumes `lagnaa-server`; it never contains business rules the server owns, and it never enforces authorization. Architecture: `docs/ARCHITECTURE.md`. Structure: `docs/REPOSITORY_STRUCTURE.md`.

## Vocabulary

Use `GLOSSARY.md` terms exactly (Member, Profile, Interest, Connection, Contact Request, Shortlist, Block, Report, Recommendation, Native Runtime, OTA Bundle, Channel). "match", "like", "swipe", "user" (outside server types) are not domain terms.

## Rules that are enforced in review

1. Screens call feature hooks only. No `fetch`, storage, Firebase, Keychain or URL strings in `src/features/*/screens` or `src/design-system`.
2. Server data is TanStack Query; Zustand holds session, preferences, drafts, ui only (`docs/STATE_MANAGEMENT.md`).
3. All backend calls go through `src/api/*` and are Zod-validated (`docs/API_ARCHITECTURE.md`).
4. No raw colour, spacing or font values outside `src/design-system/tokens`.
5. Privacy: no L2/L3 data persisted; redaction rules in `docs/DATA_PRIVACY_ARCHITECTURE.md`; nothing sensitive in logs or URLs.
6. Any change to `android/`, `ios/` or a native dependency is a Store Release; bump the version (`docs/RELEASE_ARCHITECTURE.md`).
7. New dependencies need the gate in `docs/DEPENDENCY_POLICY.md` answered in the PR.
8. Tests at agreed seams only (`docs/TESTING_STRATEGY.md`).
9. Do not invent backend endpoints or product rules. Gaps go to `docs/BACKEND_GAPS.md`.

## Agent skills

Skills live in `skills/<vendor>/<name>/SKILL.md`, symlinked from `.claude/skills/`. Use:

- `grill-me` / `grilling` before any non-trivial design; `domain-modeling` when terms or decisions change (`GLOSSARY.md`, `docs/adr/`); `codebase-design` vocabulary when shaping modules; `to-spec` to turn a discussion into an issue; `tdd` while implementing; `diagnosing-bugs` for defects; `code-review` before merging.
- `antislop` (core, mode: DURING) plus `antislop-ui`, `antislop-layoutmobile`, `antislop-copywriting`, `antislop-code` for any UI, copy or comment work. Direction comes from `DESIGN.md`; antislop is the filter.
- `ui-ux-pro-max` for mobile interaction decisions; run its pre-delivery checklist (`references/pro-rules.md`) before delivering any screen or component.
- `security-audit` (guidance mode) for changes to `core/session`, `core/http`, `core/deeplinks`, `core/updates`, `core/storage`, native config or CI secrets.
- `writing-for-agents` when editing this file, `CONTEXT.md` or any skill.

### Issue tracker

GitHub Issues on this repository. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the root. See `docs/agents/domain.md`.

## Commands

See `package.json` scripts and `CONTRIBUTING.md`. Never run store uploads, OTA production promotions or secret-handling commands from an agent session.
