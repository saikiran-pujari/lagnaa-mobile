# Authentication architecture

## Backend mechanism (verified)

- Credentials: email or phone + password (`POST /auth/login`), or Google ID token (`POST /auth/google`).
- Tokens: JWT access (default 30 min; claims `userId`, `email`, `role`, `tv`) and JWT refresh (7 d), both HS256. Refresh rotates both tokens and revokes the old refresh token; the server keeps refresh tokens in a table and a blacklist of revoked access tokens.
- Revocation: `POST /auth/logout` (one refresh token), `POST /auth/logout-all` and password change bump `tokenVersion` so every outstanding access token fails with `TOKEN_REVOKED`.
- Registration requires an `emailVerificationToken` from the OTP flow in production.

## Session state machine (`core/session`)

```
booting ──restore()──▶ signedOut
   │                      ▲
   │ tokens valid          │ signOut(reason)
   ▼                      │
signedIn ◀──────────────┘
   │ GET /auth/me → profile incomplete
   ▼
needsProfile ──profile complete──▶ signedIn
```

- `restore()` on boot: read tokens from Keychain; if the access token is not expired, state is `signedIn` immediately (optimistic) and `GET /auth/me` runs in the background; if expired but a refresh token exists, refresh with a 5 s timeout; otherwise `signedOut`. Boot never blocks on the network beyond that timeout.
- `signIn(tokens, user)`: write Keychain, set state, register FCM token (if permission granted), sign in to Firebase (custom token), hydrate `preferences` namespace.
- `signOut(reason)`: best-effort `POST /auth/logout`, delete Keychain entries, unregister FCM token, Firebase sign-out, clear MMKV namespaces for the Member, clear the TanStack cache and its persisted copy, reset navigation. Reason (`user`, `expired`, `revoked`, `deleted`) selects the message shown on the sign-in screen.

## Storage

- Access and refresh tokens: `react-native-keychain` (iOS Keychain with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`; Android Keystore-backed encryption). Never MMKV, never AsyncStorage, never logs.
- Member id and role: derived from the access token at runtime; cached in the `session` slice (memory).
- Biometric unlock: not in v1; the Keychain items are created with a flag that allows adding it later without migration.

## Google Sign-In

`@react-native-google-signin/google-signin` with the iOS and Android client IDs from `env/`; the ID token goes to `POST /auth/google`. The response's `needsProfileCompletion` / `isNewUser` routes to `needsProfile`. No Google refresh tokens are stored on the device.

## Multi-device and revocation UX

- "Sign out everywhere" and password change are explicit settings actions with a confirmation that other devices will be signed out.
- When a request fails with `TOKEN_REVOKED`, the app signs out immediately with the message "You were signed out from another device or your password changed".

## Account deletion

Blocked on Gap #1. The screen exists (`DangerZone`) and explains the current path (email support) until the endpoint ships; the client-side cleanup equals `signOut('deleted')`.
