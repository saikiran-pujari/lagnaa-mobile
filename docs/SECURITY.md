# Security

This is a review of the foundation's security posture, not a claim that the app is secure. Written in guidance mode of `skills/cloudflare/security-audit`: each item names the boundary, the control, and what remains.

## Threat model (summary)

Assets: Member credentials and tokens; personal, family and contact data; photos; chat; device push tokens. Adversaries: a person with the unlocked device (ex-partner, family member), a person who extracts the app binary, a network attacker, a malicious OTA source, a compromised third-party dependency.

## Controls in the foundation

| Area | Control | Remaining risk |
|---|---|---|
| Authentication | Backend JWT with rotation and revocation; tokens only in Keychain/Keystore; sign-out clears everything; revoked tokens force sign-out | Access tokens are valid up to 30 min after revocation on other devices unless `tokenVersion` check runs (it does on every request) |
| Token storage | `react-native-keychain`, accessible after first unlock, this device only | A rooted/jailbroken device can read Keychain; no root detection in v1 |
| API authorization | Server decides; mobile renders received level; strict Zod schemas flag unexpected sensitive fields | Server bugs would leak; mobile cannot fix them |
| Sensitive data at rest | No L2/L3 persistence; MMKV encrypted with Keychain-held key; per-Member namespaces | OS image cache may hold photo bytes until expiry |
| Logging | Redaction in logger and Sentry; console stripped in release | Third-party SDK logs (Firebase) are not under our redaction |
| Analytics | None | |
| Media | Photos only via server-authorised presigned URLs; temp upload files deleted | Presigned URL valid 1 h to anyone holding it (server-side mitigation) |
| Deep links | Allow-listed patterns; ids validated as UUID; unauthenticated links queued, never executed before sign-in; no sensitive data in URLs | Universal links not yet verified by domain (Gap #13) |
| Notifications | Payloads carry ids only; the app fetches content after auth; token unregistered on sign-out | Notification body (sent by server) shows sender first name and message preview on the lock screen; preference needed (Gap #2) |
| OTA | Phase 2: native signature + hash verification, fingerprint compatibility, embedded fallback, health-check revert, channel baked into binary | Until Phase 2 there is no OTA at all (safe default) |
| Update server | Cloudflare Worker with signed manifests; private key in CI/KMS only | Key rotation requires a Store Release |
| Native signing | Android upload key outside the repo (env or gitignored file), Play App Signing holds the app key; iOS signing to be set up when the Apple account exists | Loss of the upload key requires a Play reset procedure |
| Secrets | None in the app; `env/` holds public identifiers only; CI secrets by name | A leaked Firebase/Google id is public by design; abuse is limited by server-side audience checks |
| Debug settings | Dev menu, cleartext traffic and Flipper only in `dev` flavor; `android:debuggable=false`, `allowBackup=false`, `usesCleartextTraffic=false` in staging/prod; iOS ATS on | |
| Build hardening | Hermes bytecode; ProGuard/R8 on release with mapping upload; no `EXPORTED` components without need | No anti-tamper/RASP in v1 |
| Dependencies | `DEPENDENCY_POLICY.md`; `pnpm audit` in CI; lockfile frozen | Supply chain risk in any npm package; pinned natives reduce blast radius |
| Certificate handling | System trust store; no pinning in v1 (pinning would break on backend certificate rotation without a Store Release) | MITM with a user-installed CA on a compromised device |

## Known risks outside this repo (reported, not fixed here)

- `MASTER_PASSWORD` login bypass exists in the backend (Gap #11).
- CORS `*` on the backend (Gap #10).
- A web OAuth client secret was found in plaintext in the workspace root (Gap #14): rotate it.
- No account deletion endpoint (Gap #1).

## Assumptions

- The backend enforces authorization on every route listed in `MOBILE_PRODUCT_SURFACE.md` (verified by reading the services; not penetration-tested).
- Firebase RTDB security rules restrict `notifications/{userId}` to the matching `auth.uid` (not verified; rules live in the Firebase project, not in any repo).
- Cloudflare account access is limited to release managers.

## Review cadence

`security-audit` guidance review on every PR touching `core/session`, `core/http`, `core/deeplinks`, `core/updates`, `core/storage`, native config, or CI secrets. A full audit (all six phases of the skill) before the first production Store Release and before enabling the production OTA channel.
