# Lagnaa: shared context for humans and agents

Lagnaa is a matrimonial platform for the Kshatriya community in India. A **Member** creates a **Profile** (for themselves or for a son, daughter, brother or sister), discovers other Profiles, expresses **Interest**, and once an Interest is accepted the two Members are **Connected**: they can chat, and either can ask for the other's **Contact** details. Families are first-class participants: many Profiles are managed by a parent or sibling.

The backend (`lagnaa-server`, Hono + Prisma + PostgreSQL + Redis) is the single source of truth for identity, authorization, business rules, privacy and data. The web client (`lagnaa-client/apps/web`) and this mobile app are peers that consume it. Nothing in the mobile app enforces authorization; it renders what the backend has already decided the viewer may see.

## Vocabulary

Terms below are used exactly as written in code, docs, tests and commit messages. `GLOSSARY.md` is the authoritative definition list; this file explains how the concepts relate.

- **Member**: an authenticated account (`User` on the server). Has a role (`USER`, `PARENT`, admin roles) and exactly one Profile.
- **Profile**: the marriage-seeking person's data. `profileFor` records whether the Member is the person (`SELF`) or a relative (`MY_SON`, `MY_DAUGHTER`, `MY_BROTHER`, `MY_SISTER`).
- **Viewer**: the Member looking at someone else's Profile. What the Viewer receives depends on the relationship between the two Members, decided by the server (see Visibility levels).
- **Interest**: a one-directional request from a sender to a receiver. States: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`. One Interest per ordered pair; a rejected Interest cannot be re-sent.
- **Connection**: the relationship that exists once an Interest is `ACCEPTED` in either direction. Connections unlock chat and the ability to request contact. Connected Members disappear from each other's search results.
- **Contact Request**: a request, only possible between Connected Members, to reveal email and phone. States: `PENDING`, `ACCEPTED`, `REJECTED`. When accepted, the Profile is **Contact Unlocked** for the requester.
- **Conversation** and **Message**: chat between two Connected Members. Messages are plain text. Unread counts are per Conversation.
- **Shortlist**: a private bookmark of another Member. The other side can see who shortlisted them ("Shortlisted by").
- **Profile View**: a record that a Viewer opened a Profile ("Who viewed you").
- **Block**: a Member hides themselves from, and stops all interaction with, another Member, in both directions. Blocked pairs cannot send Interests, Contact Requests or Messages, and do not see each other in search or conversations.
- **Report**: a Member flags another for moderation. Reported Members can optionally be excluded from search.
- **Recommendation**: a server-computed list of Profiles for the Viewer (opposite gender, similar age, same sub-caste when set).
- **Compatibility Score**: a 0-100 number computed by the server from the Viewer's partner preferences against a candidate Profile.
- **Profile Strength**: a 0-100 completeness percentage computed client-side from Profile fields. Below 20% the Profile is **Incomplete** and discovery is unavailable. A freshly created Google account has a **Stub Profile** (first name "Pending", last name "User").
- **Visibility**: a Profile setting: `PUBLIC`, `PRIVATE` (owner and admins only), `CONNECTIONS_ONLY` (details visible, photos gated).
- **Photo Privacy**: a Profile setting: `all`, `interests` (Connected Members only), `none`.
- **Verified**: an admin-granted trust flag on a Member.
- **Active Today**: the Profile owner was active within the current day.

### Visibility levels (what a Viewer receives)

The server returns one of three shapes for `GET /profile/:id`. The mobile app renders whichever arrives and never derives a higher level locally.

1. **Public**: no exact birth date, no contact, no family or preference details; photos are included only if Photo Privacy allows. May carry `interestStatus: PENDING` if the Viewer already sent an Interest.
2. **Private without contact**: full details (birth date and time, family, preferences, horoscope) but no email or phone. Carries `interestStatus: ACCEPTED` and `contactRequestStatus` so the UI can offer "Request contact".
3. **Private with contact**: everything, including email and phone, `contactUnlocked: true`. Returned to the owner, admins, and Viewers whose Contact Request was accepted.

### Photos

Photos live in a private S3-compatible bucket. The server resolves object keys into short-lived presigned view URLs only when the Viewer is allowed to see them. The mobile app treats the **object key** as the stable identity of a photo and the presigned URL as a temporary, cacheable credential (see `docs/PERFORMANCE.md`, images).

### Notifications

The server sends FCM pushes with `data.type` in `NEW_MESSAGE` (with `conversationId`), `NEW_INTEREST` (with `interestId`), `INTEREST_ACCEPTED` (with `interestId`), and a Firebase Realtime Database event at `notifications/{userId}` for in-app live updates (currently `NEW_MESSAGE` only). The client signs in to Firebase with a custom token from `GET /auth/firebase-token`.

## Session concepts

- **Session**: an access token (30 min) and a refresh token (7 days). Refresh rotates tokens. The server invalidates every outstanding token by bumping a per-Member `tokenVersion` ("logout everywhere", password change).
- **Native Runtime**: the store-delivered binary: native code plus the embedded JS bundle. Identified by app version and build number plus a native fingerprint.
- **OTA Bundle**: a signed JavaScript bundle compatible with exactly one Native Runtime fingerprint, delivered through a **Channel** (`development`, `staging`, `production`).

## Where to look

- Product flows: `docs/MOBILE_PRODUCT_SURFACE.md`
- Why things are the way they are: `docs/adr/`
- Backend contract and its gaps: `docs/API_ARCHITECTURE.md`, `docs/BACKEND_GAPS.md`
