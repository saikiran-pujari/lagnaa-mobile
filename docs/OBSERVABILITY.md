# Observability

## Error monitoring: Sentry (`@sentry/react-native` 8.x)

Captures JS exceptions, native crashes (iOS + Android), ANRs, unhandled promise rejections, navigation breadcrumbs (route names), HTTP breadcrumbs (path templates, status, duration), and release health.

Tags on every event: `release` (`appVersion+buildNumber`), `dist` (OTA `bundleId` or `embedded`), `environment`, `channel`, `platform`, `os`, `device.model`, `runtimeFingerprint`. User context: `{ id: memberId }` only.

Disabled when `SENTRY_DSN` is empty (development default). Source maps uploaded in release workflows. `tracesSampleRate` 0.1 in production, 1.0 in staging; profiling off.

## PII redaction rules

Applied in `core/logger` and in Sentry `beforeSend` / `beforeBreadcrumb`:

1. Drop request and response bodies entirely.
2. Replace path parameters with templates (`/profile/:id`).
3. Strip query strings.
4. Redact values whose key matches `/token|secret|password|otp|email|phone|dateOfBirth|timeOfBirth|horoscope|content|firstName|lastName|fatherName|motherName|address/i`.
5. Truncate exception messages that contain `@` or 10+ consecutive digits (likely email/phone) to a generic message, keep the stack.
6. Never attach screenshots, view hierarchies or console logs.

## Logging

`core/logger` is the only logging interface. Levels: `debug` (dev only), `info`, `warn`, `error`. Each call is `(event: string, fields?: Record<string, unknown>)` with redaction applied to fields. Release builds have `console.*` stripped.

## Analytics

Not installed. Before any analytics SDK is added, this section must list: the events (name, trigger, properties), why each is needed, environment separation, consent handling (India DPDP Act considerations), and a PII review against the redaction rules. Event naming, when it comes: `domain.object.action` in snake_case (`discovery.profile.opened`), no free-text properties, ids only.

## Health signals we want from day one

- Crash-free sessions per `release` and per `dist` (OTA bundle).
- Startup time (bootsplash hide timestamp) p50/p95 per device class.
- API error rate by path template and code, including `CONTRACT_MISMATCH`.
- OTA check/download/apply outcomes.
