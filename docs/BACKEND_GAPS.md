# Backend gaps the mobile app cannot work around

Tickets for `lagnaa-server`. The mobile app is designed to the current contract; each item below is a change the backend must make for the listed mobile capability to exist. None are implemented in this repo.

| # | Gap | Why it blocks mobile | Suggested change |
|---|---|---|---|
| 1 | No account deletion endpoint (`DELETE /profile` deletes the Profile, not the Member) | Apple App Store Review 5.1.1(v) and Google Play's account-deletion policy require in-app deletion for apps with account creation | `DELETE /users/me` (password or re-auth confirmation), cascade or soft-delete with grace period, revoke tokens, delete FCM tokens, purge S3 objects |
| 2 | No notification preference endpoints | Settings > Notifications toggles (interest, message, views, promos) have nowhere to persist; web keeps them in local state | `GET/PUT /users/me/notification-preferences`; server honours them in `sendFcmPush` |
| 3 | No minimum supported app version / kill switch endpoint | Forced store upgrade and OTA kill switch need a server-side signal independent of the OTA provider | `GET /app/config` → `{ minSupportedVersion: { ios, android }, maintenance?: {...} }` (public, cached) |
| 4 | Two response envelopes (`data` vs `profiles`) | Every list consumer needs a special case | Return `data` from search; keep `profiles` for one deprecation window |
| 5 | No OpenAPI / typed contract | Mobile hand-maintains Zod response schemas; drift is detected only at runtime | Adopt `@hono/zod-openapi` (request + response schemas) and publish the spec; mobile can then generate types |
| 6 | `GET /profile/:id` marks a view on every fetch | Pull-to-refresh and query refetch inflate "who viewed you" | Dedupe by `(viewer, profile, day)` or accept a `?view=false` flag for refetches |
| 7 | Message list is page-based (`page`, `limit`) and reversed server-side | Infinite scroll upwards in chat needs a stable cursor (`before=<messageId>`) | Add cursor pagination to `GET /message/:conversationId` |
| 8 | No unread-count push to RTDB for Interests or Contact Requests | Badges rely on polling | Emit `NEW_INTEREST`, `INTEREST_ACCEPTED`, `CONTACT_REQUEST`, `CONTACT_ACCEPTED` events on `notifications/{userId}` |
| 9 | Contact Request has no push notification | Recipient learns about it only when opening the app | `sendFcmPush` on send and on accept with `data.type = CONTACT_REQUEST | CONTACT_ACCEPTED` |
| 10 | CORS is `Access-Control-Allow-Origin: *` and `ALLOWED_ORIGINS` is unused | Not a mobile blocker; a web security issue found during audit | Read `ALLOWED_ORIGINS` and reflect allowed origins |
| 11 | `MASTER_PASSWORD` accepts any Member's login | Security risk documented in `SECURITY.md` assumptions | Remove, or restrict to non-production builds at compile time |
| 12 | No staging environment | Mobile `staging` channel points at production API | Deploy a staging instance with its own database and Firebase project |
| 13 | Universal links need web assets | `https://lagnaa.in/profile/:id` cannot open the app | Host `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` from `lagnaa-client/apps/web` |
| 14 | Google OAuth native client IDs | Native Google Sign-In needs iOS and Android client IDs added to `GOOGLE_CLIENT_IDS` | Create the clients in GCP project `lagnaa-auth`; rotate the leaked web client secret found in the workspace root |
