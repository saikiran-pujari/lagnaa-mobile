# Implementation plan

Phases are gated: each ends with the validation list for that phase green. Estimates are for one engineer with agent assistance.

## Phase 0: Foundation (this phase)

Deliverables: scaffolded RN 0.87 project with pnpm; flavors/schemes for dev/staging/prod; TypeScript strict, ESLint 9, Prettier; Jest + RNTL + Maestro smoke; `core/*` modules with fakes and unit tests (env, http, session, storage, logger, monitoring, updates seam, deeplinks, query); `src/api` for auth, profile, search, interest, contact-request, message, shortlist, block, report, upload, notifications with Zod schemas and fixtures; design-system tokens (light/dark), primitives, first components (`Text`, `Button`, `TextField`, `Screen`, `QueryBoundary`, `EmptyState`, `ErrorState`, `Skeleton`, `RemotePhoto`/`GatedPhoto`); navigation skeleton with auth gating and linking; Firebase + Google Sign-In + Sentry wired but inert without config; bootsplash and regenerated icons; CI (`ci.yml`); release builds are manual by decision; docs.

Validation (brief §45): Android dev debug build runs on the emulator; iOS dev debug build runs on the simulator; `pnpm typecheck`, `lint`, `format:check`, `test` pass; Metro starts; navigation gating works with the fake transport; env check passes for all three files; New Architecture confirmed in both native logs; no Expo packages in `pnpm-lock.yaml`; no secrets in git (`gitleaks` in CI).

## Phase 1: Core loop (3–4 weeks)

First: bundle Playfair Display and Inter (`assets/fonts`, `react-native.config.js`, `pnpm react-native-asset`) so the typography tokens resolve; register the iOS/Android Google OAuth client ids and the six Firebase apps; create the Android API 34 emulator for Maestro.

Auth (sign in, register with OTP, Google), session restore, onboarding sections with drafts and photo upload, Home, Discover with filters and recommendations, Profile detail with all three visibility levels and the interest/contact actions, Connections tab, Shortlist, Block/Report, Settings (privacy, password, blocked, about). E2E journeys 1–3. First internal Store Release (Android internal track; iOS TestFlight once the Apple account exists).

## Phase 2: Chat, notifications, OTA (2–3 weeks)

Conversations and thread with optimistic send, RTDB invalidation and polling fallback; push permission flow, token lifecycle, deep-link routing from notifications; hot-updater integration on Cloudflare behind `UpdateProvider`; development and staging channels live; E2E journeys 4–6; closed testing track.

## Phase 3: Polish and release (2 weeks)

Biodata PDF via share sheet; who-viewed/shortlisted-by sections; performance pass against `PERFORMANCE.md` budgets; accessibility pass (screen reader, font scale 1.3, reduced motion); full `security-audit` run; production Store Release; production OTA channel enabled at 10% rollout.

## Cross-repo tickets (not in this plan's scope)

`docs/BACKEND_GAPS.md` items 1–14; account deletion (#1) and `/app/config` (#3) are required before the public production release.
