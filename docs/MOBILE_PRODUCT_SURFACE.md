# Mobile product surface

Derived from the web client, the old Expo app and the backend routes. Each row answers: what is the Member trying to do, which screen serves it, which backend calls it needs, what data and how sensitive, which auth state, and what the mobile-specific interaction is. Nothing here is a new product requirement; "Gap" marks capabilities the backend does not yet provide (`BACKEND_GAPS.md`).

Legend: sensitivity L1 public · L2 private-to-member · L3 contact/identity.

## Auth

| Goal | Flow | Screen | API | Data | Sens. | Auth | Mobile interaction |
|---|---|---|---|---|---|---|---|
| Get in fast | Sign in | `SignIn` | `POST /auth/login`, `POST /auth/google`, `GET /auth/public-config` | identifier, password, Google idToken | L3 | signed out | Single screen; Google button first-class; password field with reveal; keyboard-aware; biometric unlock out of v1 |
| Create account | Register | `RegisterSteps` (4 steps: About · Email · Security · Finish) | `POST /auth/email/send-otp`, `verify-otp`, `POST /auth/register` | name, gender, DOB, profileFor, email, phone, password, terms | L3 | signed out | Full-screen stepper with progress; native date picker; OTP auto-fill (`autoComplete="one-time-code"`); back = previous step |
| Recover session | Boot | `Boot` (splash) | `POST /auth/refresh`, `GET /auth/me` | tokens | L3 | any | Native splash held until session resolved or 1.5 s timeout, then routed |
| Leave | Sign out / everywhere | `Settings` | `POST /auth/logout`, `/logout-all`, `DELETE /notifications/fcm-token` | refresh token | L3 | signed in | Confirmation sheet; clears Keychain, MMKV, query cache, Firebase |
| Delete account | Account deletion | `DangerZone` | **Gap #1** | | L3 | signed in | Required by stores; UI ships behind the gap |

## Onboarding

| Goal | Flow | Screen | API | Data | Sens. | Auth | Mobile interaction |
|---|---|---|---|---|---|---|---|
| Become discoverable | Profile completion | `Onboarding` (sections: Basics · Background · Family · Lifestyle · Partner · Photos) | `GET /auth/me`, `POST|PUT /profile`, `POST /upload/presigned`, `PUT /profile/update-photo` | profile fields, photos | L2/L3 | `needsProfile` | Section-per-screen with save-as-you-go; strength meter persistent in header; skip allowed after basics (gender + DOB required for discovery) |

## Discovery

| Goal | Flow | Screen | API | Data | Sens. | Auth | Mobile interaction |
|---|---|---|---|---|---|---|---|
| See what needs me + suggestions | Home | `Home` tab | `GET /auth/me`, `/interest/stats`, `/interest?type=received&status=PENDING`, `/contact-request?type=received`, `/search/recommendations`, `/message/conversations`, `/profile/me/viewers`, `/shortlist/shortlisted-by` | counts, cards | L1/L2 | signed in | Pull-to-refresh; "Needs you" stack first (pending interests, contact requests, incomplete profile); horizontal recommendation rail |
| Find compatible profiles | Search | `Discover` tab | `GET /search` (cursor mode, `includeScore=true`), filters | public cards + score | L1 | signed in, profile complete | Infinite list (FlashList); filters in a bottom sheet with Apply/Reset; saved per Member in MMKV; card actions: Interest, Shortlist |
| Inspect a profile | Profile detail | `ProfileDetail` | `GET /profile/:id` (+ inline presigned photos), `POST /interest/send`, `/interest/respond`, `/contact-request/send`, `/shortlist/:memberId`, `/block`, `/report` | level-dependent | L1→L3 | signed in | Photo pager (gated/blurred when not allowed); sticky action bar at thumb reach (Interest / Message / Request contact depending on status); sections collapsible; share sheet out of v1 |

## Connections

| Goal | Flow | Screen | API | Data | Sens. | Auth | Mobile interaction |
|---|---|---|---|---|---|---|---|
| Respond to interest | Interests | `Connections` tab › Received / Sent / Connected | `GET /interest?type=`, `POST /interest/respond`, `DELETE /interest/:id` | sender/receiver cards | L1 | signed in | Segmented control; swipe actions accept/decline on received; cancel on sent; connected rows open chat |
| Exchange contact | Contact requests | `Connections` › Contact requests | `GET /contact-request`, `POST /contact-request/respond` | names | L1 | signed in | Accept reveals your contact to them: explicit confirmation sheet |
| Keep candidates | Shortlist | `Shortlist` | `GET /shortlist`, `POST|DELETE /shortlist/:memberId` | cards | L1 | signed in | Bookmark toggle everywhere; list with Interest action |
| Who noticed me | Views / shortlisted by | `Home` sections, `Viewers` | `GET /profile/me/viewers`, `/shortlist/shortlisted-by` | cards | L1 | signed in | |
| Stop someone | Block / Report | `ReportSheet`, `Settings › Blocked` | `POST /block`, `DELETE /block/:memberId`, `GET /block`, `POST /report`, `GET /report/my-reports` | reason text | L2 | signed in | Overflow menu on profile; report is a modal sheet with reason chips |

## Chat

| Goal | Flow | Screen | API | Data | Sens. | Auth | Mobile interaction |
|---|---|---|---|---|---|---|---|
| Talk to a connection | Conversations | `Messages` tab | `GET /message/conversations`, `/message/unread/count` | previews | L2 | signed in | Unread badges on tab; RTDB `NEW_MESSAGE` invalidates; polling fallback 10 s while focused |
| Read and send | Thread | `ChatThread` | `GET /message/:conversationId`, `POST /message`, `POST /message/mark-read`, `DELETE /message/:id` | messages | L2 | signed in, connected | Inverted FlashList; keyboard-controller composer; optimistic send with retry; mark-read on focus; blocked state renders a notice |

## Notifications

| Goal | Flow | Screen | API | Data | Sens. | Auth | Mobile interaction |
|---|---|---|---|---|---|---|---|
| Hear about activity | Push | OS → deep link | `POST|DELETE /notifications/fcm-token` | token | L2 | signed in | Permission asked after first meaningful action, not at launch; tap routes to thread / interests; preferences **Gap #2** |

## Settings

| Goal | Flow | Screen | API | Data | Sens. | Auth | Mobile interaction |
|---|---|---|---|---|---|---|---|
| Control exposure | Privacy | `Settings › Privacy` | `PATCH /profile/visibility`, `PUT /profile` (`photoPrivacy`) | settings | L2 | signed in | Radio groups with plain-language consequences |
| Secure account | Password | `Settings › Password` | `POST /auth/change-password` | passwords | L3 | signed in | Signs out other sessions (server bumps tokenVersion) |
| Share biodata | Biodata | `Biodata` | own profile | L2/L3 | signed in | Phase 3: PDF via native share sheet |

## Out of v1 (web-only or deferred)

Admin console; pricing/subscriptions (backend stub); marketing, legal, help, FAQ pages (opened in the in-app browser from Settings › About); verification document upload (no public routes); biodata PDF (Phase 3).
