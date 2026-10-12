# Repository audit: what the existing Lagnaa code taught us

Factual inventory of `lagnaa-server`, `lagnaa-client` and the existing Expo mobile app, taken on 2026-10-12 before any architecture decision. Nothing here was modified. Facts are quoted from code, not from READMEs, where they disagree.

## lagnaa-server (backend)

- Hono 4 on Node 22 (`engines: 22.20.0`), Prisma 5 on PostgreSQL, Redis cache, Zod validation, JWT access (30 min) + refresh (7 d) with `tokenVersion` revocation and a token blacklist table.
- Modular monolith: `auth`, `users`, `profiles`, `matches` (search + interest), `messaging`, `contact-request`, `shortlist`, `block`, `upload`, `notifications`, `admin` (+ reports), `subscriptions` (stub). Routes mounted under `/api/*` in `src/server.ts`.
- Response envelope: `{ success: true, data, message? }` and `{ success: false, error: { message, code?, details? } }`. **Exception**: search returns `{ success, profiles, pagination }` and recommendations return `{ success, data }`. Page pagination `{ page, limit, total, totalPages }`; cursor pagination `{ limit, nextCursor, hasMore }` (search only; cursor mode ignores `sortBy`).
- No OpenAPI or generated contract. Request schemas exist as Zod in `src/schemas/*.ts`; response shapes are implicit in controllers and mappers.
- Authorization is enforced server-side: three profile mappers (`mapToPublicProfile`, `mapToPrivateProfileWithoutContact`, `mapToPrivateProfile`) chosen by relationship; block guard applied to every interaction; messaging requires an accepted Interest; Contact Request requires a Connection.
- Photos: presigned S3 PUT for upload (`POST /upload/presigned`, purposes `profile-photo`, `profile-photos`, `horoscope`, `verification-document`, `verification-selfie`; max 5 MB; jpeg/png/webp), presigned GET for viewing (`GET /upload/presigned-view?objectKey=`, 1 h), and the server inlines resolved view URLs into profile responses when the viewer is allowed.
- Push: `POST/DELETE /notifications/fcm-token`, server sends FCM v1 multicast with `data.type` + id; stale tokens auto-pruned. Realtime: Firebase RTDB `notifications/{userId}` push of `NEW_MESSAGE`, client auth via custom token (`GET /auth/firebase-token`).
- Google sign-in: `POST /auth/google { idToken }`, audiences from `GOOGLE_CLIENT_IDS` (web + iOS + Android). New Google accounts get a Stub Profile and `needsProfileCompletion: true`.
- Email OTP: `POST /auth/email/send-otp`, `POST /auth/email/verify-otp` → `emailVerificationToken` required by `POST /auth/register` in production.
- Rate limits: auth routes 5/15 min, search 30/min, messages limited, global 5000/15 min.
- Gaps found (see `BACKEND_GAPS.md`): no account deletion, no notification preferences, no minimum-app-version endpoint, CORS `*`, `MASTER_PASSWORD` login bypass, no OpenAPI, unused env keys, no tests in `src/`.

## lagnaa-client (web + old mobile)

- npm workspaces: `apps/web` (Vite, React 18, shadcn/ui, react-router 7, MobX stores + TanStack Query, Firebase web SDK), `apps/mobile` (Expo SDK 57, Expo Router, RN 0.86.3, React 19.2.3), shared `packages/{types,constants,validation,auth,api-client,business}`.
- `packages/api-client`: axios instance with request-time expiry check, single-flight refresh, 401 code switch (`TOKEN_EXPIRED` → refresh+retry; `TOKEN_REVOKED|TOKEN_BLACKLISTED|INVALID_SIGNATURE|MALFORMED_TOKEN|INVALID_TOKEN` → sign out). Behaviour worth keeping; implementation not reused.
- `packages/business`: `isProfileIncomplete` (stub name or strength < 20), `resolvePostAuthPath`, `ageFromDateOfBirth`, `heightToFeetInch`, image validation limits. Rules worth keeping.
- `packages/validation`: `profileUpdateSchema`, `signupSchema`, height/time-of-birth helpers, `getProfileStrengthPercentage`.
- `packages/constants`: Indian states, cities, professions, gotras, education, diet, etc. for pickers.
- Old mobile app: 25 Expo Router screens; services call endpoints directly from screens; tokens in `expo-secure-store`; search filters persisted per user in SecureStore (misuse: not a secret); chat polls `GET /message/:conversationId` while focused; push via `expo-notifications` native device token; design tokens in `src/ui/tokens` (primary `#7c2d12`, drifted from the web brand). `docs/mobile-parity/*` lists the parity backlog as of 2026-06-11: edit-profile, chat thread, contact request flow and most filters were missing or partial.
- Brand (web `globals.css`): primary `hsl(348 60% 30%)` (maroon), accent `hsl(38 70% 50%)` (gold), warm off-white background, Playfair Display + Inter, dark theme defined. App icon artwork: maroon gradient `#ba4b54` → `#771927` with a cream "L" and lotus mark.
- Store identity: Android package / iOS bundle id `in.lagnaa.app`, scheme `lagnaa`, Android `versionCode` 2 shipped, version 1.0.1. Play release built locally with an upload keystore (alias `upload`) referenced from gitignored `credentials.json`.

## Decisions this audit forced

- Build a runtime-validated contract layer in mobile (Zod response schemas at the API seam) rather than trusting implicit shapes.
- Carry the auth-refresh behaviour, business rules and picker constants forward as **rules**, re-implemented in the mobile architecture; do not import `@lagnaa/*` packages.
- Treat `objectKey` as photo identity and presigned URLs as cacheable credentials.
- Regenerate app icons from the artwork; the existing PNGs have a baked-in rounded rectangle on black.
