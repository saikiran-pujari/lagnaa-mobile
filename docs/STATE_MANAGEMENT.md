# State management

Two kinds of state, two tools, no global store.

## Server state: TanStack Query v5

Everything that originates from `lagnaa-server` is a query or a mutation: own profile, other profiles, search pages, recommendations, interests, contact requests, conversations, messages, shortlist, viewers, blocked list, reports, upload status.

Rules:
- Keys are built by `core/query/keys.ts` only (`queryKeys.profile(profileId)`, `queryKeys.search(filters)`, ...). No ad-hoc arrays.
- Default `staleTime` 60 s; lists that change on user action (interests, conversations) are invalidated by their mutations; `Home` refetches on focus.
- Infinite lists use `useInfiniteQuery` with the server cursor (search) or page (messages, until Gap #7).
- Mutations are optimistic only where the UI pattern demands it (send message, shortlist toggle, mark-read). Every optimistic mutation has a rollback.
- Persistence: the query cache is persisted to encrypted MMKV with `maxAge` 24 h for L1 data (search cards, recommendations, conversations list) and **not persisted** for L2/L3 data (profile detail with private levels, messages, viewers). Logout clears the persisted cache. See `DATA_PRIVACY_ARCHITECTURE.md`.
- Realtime events (RTDB, push) only **invalidate** queries; they never write server data into the cache directly.

## Client state: Zustand v5 slices

Only state that has no server source of truth:

| Slice | Contents | Persistence |
|---|---|---|
| `session` | `state`, `memberId`, `role`, `needsProfile` reason | derived from Keychain on boot; not persisted itself |
| `preferences` | theme (`system\|light\|dark`), reduced data mode, last discovery filters | MMKV, per Member |
| `drafts` | in-progress register/onboarding/edit-profile forms, unsent message text per conversation | MMKV, per Member, cleared on submit or sign out |
| `ui` | transient flags: active sheet, toast queue, pending deep link | memory only |

Rules:
- A slice is created with `create<Slice>()(...)` in `features/<x>/store.ts` or `core/session/store.ts`; selectors are exported, components subscribe to the smallest selector.
- No API response is copied into Zustand. If you find yourself doing it, the data is server state.
- Form state inside a screen uses `react-hook-form` with Zod resolvers; only cross-screen drafts reach the `drafts` slice.

## Derived state

`profileStrength`, `isProfileIncomplete`, age, display height, visibility level are computed with pure functions in `features/profile/utils` from query data, memoised with `useMemo`. They are never stored.
