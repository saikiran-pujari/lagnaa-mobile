# 0005. fetch-based typed client with Zod-validated responses; no OpenAPI yet

Status: accepted · 2026-10-12

## Context
`lagnaa-server` publishes no contract. Response shapes are implicit and inconsistent (`data` vs `profiles`). The old clients used axios with ad-hoc `data?.data ?? data` unwrapping. Silent drift reached production more than once (see parity reports).

## Decision
`core/http` wraps `fetch` with auth, refresh, timeouts and typed errors. `src/api/*` is the only module aware of paths and envelopes, returns glossary-named mobile types, and validates every response with Zod schemas kept in `src/api/schemas`. Contract mismatches surface as monitored, retryable errors. When the backend adopts `@hono/zod-openapi` (Gap #5), schemas are generated and hand-written ones deleted.

## Alternatives
- Share `@lagnaa/types` and `@lagnaa/api-client` from `lagnaa-client`: rejected, couples repos, carries web assumptions, and those types are untyped `Record<string, unknown>` in places.
- Generate from Prisma types: rejected, database shape is not the API shape, and leaks server fields.
- axios: rejected, no need; `fetch` + `AbortController` suffice; upload progress uses `XMLHttpRequest` directly.

## Consequences
Schemas must be maintained until OpenAPI exists; the fixture-capture script keeps them honest. Strict schemas on security-relevant shapes add a layer of defence against accidental over-sharing by the server.
