# Data privacy architecture

The backend is the security boundary. The mobile app's job is to not widen it: it stores, logs and displays nothing beyond what the current screen needs, and forgets it promptly.

## Sensitive data categories

| Category | Examples | Level | Where it may exist on the device |
|---|---|---|---|
| Credentials | password, access/refresh tokens, Google ID token, Firebase custom token | L3 | Keychain (tokens) or memory during the request only |
| Contact identity | own email, phone; another Member's email/phone when Contact Unlocked | L3 | memory + TanStack cache (not persisted) |
| Birth data | date of birth, time of birth, horoscope URL, manglik | L3 | memory + cache (not persisted); own values may be in a form draft (MMKV, per Member) |
| Family and background | parents' names and occupations, family status, income, sub-caste, gotra, kuldevi | L2 | memory + cache (not persisted) |
| Messages | chat content | L2 | memory + cache (not persisted); unsent draft in MMKV per conversation |
| Photos | profile and gallery images (presigned URLs) | L2 | OS image cache (URL-keyed, expires with the URL); never copied to app storage |
| Public card data | name, age, city, profession, education, verified flag | L1 | cache persisted ≤ 24 h |
| Device identifiers | FCM token | L2 | Keychain-free: MMKV (needed for unregistration), cleared on sign out |
| Preferences | filters, theme | L1 | MMKV per Member |

## Visibility states (mirror of the server)

Public → private without contact → private with contact. The response tells the app its level; the app renders down, never up. A cached public view is never "upgraded" with fields from another cached response. Photo URLs arrive only when the server has authorised them; the app never builds a storage URL from an object key.

## Client storage rules

1. Secrets only in Keychain. Everything else in MMKV instances encrypted with a key generated on first launch and stored in Keychain.
2. Storage is namespaced by Member id. Sign-out deletes the namespace; a different Member signing in never sees leftovers.
3. Persisted query cache contains L1 data only (allow-list of query keys). L2/L3 queries are marked `meta.persist = false`.
4. Form drafts expire after 7 days and are deleted on submit.
5. No photo is written to the app sandbox except a temporary file during upload, deleted after the PUT completes or fails.

## Logging restrictions

- `core/logger` redacts values for keys matching `/token|password|otp|email|phone|dateOfBirth|timeOfBirth|horoscope|content/i` before anything leaves memory.
- Request logging records method, path template (`/profile/:id`, not the id), status, duration and request id. Never bodies, never query strings.
- `console.*` is stripped from release builds by Babel (`transform-remove-console`), leaving only `core/logger`.

## Monitoring and crash reporting

- Sentry `sendDefaultPii: false`; `beforeSend` and `beforeBreadcrumb` run the same redaction; breadcrumbs for navigation record route names and ids only; network breadcrumbs record path templates.
- User context is `{ id: memberId }` only. No email, no name.
- Screenshots and view hierarchy attachments are disabled.

## Analytics

None in v1. If added, events must be reviewed against `OBSERVABILITY.md` and must not carry L2/L3 fields.

## Screenshots and recents

- Chat and profile detail do not block screenshots in v1 (blocking harms legitimate family use). Android `FLAG_SECURE` is wired as a per-screen option for later.
- App switcher snapshot: a blur overlay is applied when the app resigns active on iOS and in `onPause` on Android, so recents do not show chat or contact details.

## Lifecycle

- Logout: see `AUTH_ARCHITECTURE.md`; everything per Member is gone, Keychain cleared, OS image cache purged for session URLs where the platform allows.
- Account deletion: same as logout plus server deletion (Gap #1).
- Token expiry: tokens are cleared from Keychain the moment refresh fails with 401.
- Cache invalidation: profile and relationship changes invalidate dependent queries; the RTDB/push events only invalidate.

## Known risks

See `SECURITY.md`. The largest: the server inlines presigned URLs with a 1 h life; anyone with the URL can fetch the image within that window. Mitigation is server-side (shorter expiry) and client-side (never log or share URLs).
