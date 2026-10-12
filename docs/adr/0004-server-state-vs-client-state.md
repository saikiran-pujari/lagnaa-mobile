# 0004. TanStack Query for server state, Zustand slices for client state, no global store

Status: accepted · 2026-10-12

## Context
The web app mixes MobX stores holding API responses with TanStack Query, causing drift between the two. The brief forbids a giant global store and asks for a clear server/client split.

## Decision
All backend data is TanStack Query state with centrally defined keys, invalidation by mutations and realtime events, and an allow-listed persisted cache (L1 data only, 24 h). Zustand holds four small slices: session, preferences, drafts, ui. API responses are never copied into Zustand.

## Alternatives
- MobX (web parity): rejected, duplicates server state and hides invalidation.
- Redux Toolkit + RTK Query: rejected, more ceremony for the same split.
- TanStack Query only: rejected, session state and drafts are not server state.

## Consequences
Realtime becomes "invalidate the right keys", simple and testable. Persistence rules are enforced by key allow-list, which is also where privacy decisions are made.
