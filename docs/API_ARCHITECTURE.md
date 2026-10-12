# API architecture

```
Screen → feature hook → TanStack query/mutation → src/api/<domain>.ts → core/http apiClient → lagnaa-server
```

Screens never call the network. Feature hooks never build URLs. Only `src/api` knows paths, envelopes and server field names.

## Contract strategy

The backend exposes no OpenAPI (Gap #5). Until it does, `src/api/schemas/` holds **Zod response schemas** written from the server's mappers and controllers. Every response is parsed; a parse failure is an `ApiError('CONTRACT_MISMATCH')` that is reported to monitoring with the endpoint name (never the payload) and rendered as a retryable error. This turns silent drift into a visible signal. When the server publishes OpenAPI, the schemas are generated from it and the hand-written files are deleted.

Schemas use `.passthrough()` on objects where the server may add fields and `.strict()` on security-relevant shapes (profile levels), so an unexpected `email` on a public profile is also a contract mismatch rather than something the UI might render.

## Mobile-facing types

`src/api/types.ts` defines the shapes the rest of the app sees. They follow `GLOSSARY.md`, not the database:

```ts
type ProfileCard = { profileId; memberId; name; age; city?; state?; profession?; education?; photo?: PhotoRef; isVerified; activeToday; compatibilityScore?; interestStatus? }
type ProfileView =
  | { level: 'public'; ... ; interestStatus?: 'PENDING' }
  | { level: 'privateNoContact'; ... ; contactRequestStatus: 'NONE'|'PENDING'|'ACCEPTED'|'REJECTED' }
  | { level: 'privateWithContact'; ... ; email; phone }
type PhotoRef = { objectKey: string; url?: string; expiresAt?: number }
```

Server quirks are normalised here: `profiles` vs `data`, `profileImage` vs `profilePhoto`, `user.id` vs `userId`, `shortBio` vs `bio`.

## `core/http` client

- Built on `fetch`; JSON only; 15 s timeout; `AbortController` per request; retries idempotent GETs twice with jitter on network failure, never on 4xx.
- Attaches `Authorization: Bearer` from `core/session`. On `401`:
  - `TOKEN_EXPIRED` or no code → single-flight refresh (`POST /auth/refresh`) then one retry;
  - `TOKEN_REVOKED`, `TOKEN_BLACKLISTED`, `INVALID_SIGNATURE`, `MALFORMED_TOKEN`, `INVALID_TOKEN` → `session.signOut('revoked')`;
  - refresh itself failing with 401 → `session.signOut('expired')`.
- `429` surfaces as `ApiError('RATE_LIMITED', retryAfter)`; UI shows a calm message, no auto-retry storm.
- Error shape: `ApiError { code, status, message, retryable, details? }` where `message` is safe to display (server messages are user-facing already).
- Request ids: `X-Request-Id` (UUID) sent with every request and attached to breadcrumbs for support correlation.

## Uploads

`api/upload.ts` implements the three-step flow: `POST /upload/presigned` → `PUT <uploadUrl>` (raw bytes, `Content-Type`, progress via `XMLHttpRequest` because `fetch` has no upload progress in RN) → `PUT /profile/update-photo` or `PUT /profile { photos }`. Cancellation aborts the PUT; retries request a fresh presigned URL.

## Firebase

`api/auth.ts#getFirebaseToken` returns the custom token; `core/notifications` and `core/realtime` own the SDK. If `GET /auth/firebase-token` returns 503, realtime degrades to polling and push registration is skipped.

## Testing the seam

`core/http` accepts a `transport` (default `fetch`). Unit tests use a recorded-response fake; schema tests run every `schemas/*` against fixture JSON captured from the real server (`tests/unit/api/fixtures`). A fixture refresh script (`scripts/capture-fixtures.ts`, needs a dev token) keeps them honest.
