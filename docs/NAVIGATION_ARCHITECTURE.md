# Navigation architecture

Decision: **React Navigation 7** with native-stack and bottom-tabs on `react-native-screens` (ADR 0003). Expo Router was rejected because it requires the Expo framework.

## Shape

```
RootStack (native-stack, headerShown: false)
├── Boot                         splash; resolves session, pending deep link, OTA health
├── AuthStack                    signedOut
│   ├── Welcome
│   ├── SignIn
│   ├── Register (steps as nested native-stack: About → Email → Security → Finish)
│   └── ForgotPassword           (gap: no backend route; screen explains)
├── OnboardingStack              needsProfile
│   ├── OnboardingIntro
│   └── OnboardingSection { section }
├── MainTabs (bottom-tabs)       signedIn
│   ├── HomeTab      → Home
│   ├── DiscoverTab  → Discover
│   ├── ConnectionsTab → Connections (segments: received | sent | connected | contact)
│   ├── MessagesTab  → Messages
│   └── MeTab        → Me (own profile hub + settings entry)
├── ProfileDetail { profileId, memberId? }     pushed over tabs
├── ChatThread { conversationId }
├── EditProfileSection { section }
├── PhotoViewer { objectKeys, index }           fullScreenModal
├── FiltersSheet                                 transparentModal (bottom sheet)
├── ReportSheet { memberId }                     transparentModal
├── Shortlist · Viewers · Blocked
├── Settings (native-stack group: Settings, Privacy, Notifications, Password, DangerZone, About)
└── Biodata
```

- Tabs are five, labelled with icons and text, bottom-anchored, respecting safe-area and edge-to-edge.
- Detail screens push on the **root** stack so they cover the tab bar (a profile or a chat is a focused task).
- Sheets use `presentation: 'transparentModal'` with a gesture-driven bottom sheet component from the design system; Android back closes them.
- Every param list is typed in `src/navigation/types.ts`; `useAppNavigation()` and `useAppRoute<'ProfileDetail'>()` are the only entry points screens use.

## Auth gating

`RootNavigator` renders exactly one of `Boot`, `AuthStack`, `OnboardingStack`, `MainTabs` from `session.state`. Transitions reset the stack (no back into a signed-out state). A deep link that arrives while signed out is stored as `pendingLink` and replayed once the state becomes `signedIn`.

## Deep links

Scheme `lagnaa://` (v1) and `https://lagnaa.in/...` (universal/app links, cross-repo ticket, Gap #13). Linking config maps:

| URL | Route | Notes |
|---|---|---|
| `lagnaa://profile/:profileId` | `ProfileDetail` | 404 → "This profile is no longer available" state |
| `lagnaa://chat/:conversationId` | `ChatThread` | 403 (blocked) renders blocked notice |
| `lagnaa://interests` | `MainTabs › ConnectionsTab` (received) | |
| `lagnaa://connection/:interestId` | `ConnectionsTab` with highlight | |
| `lagnaa://settings/notifications` | `Settings › Notifications` | from OS notification settings |

Push notification taps are translated to the same URLs by `core/notifications` (`NEW_MESSAGE` → chat, `NEW_INTEREST` / `INTEREST_ACCEPTED` → interests), so one resolver handles both.

## Back behaviour

- Android hardware/gesture back pops the current native stack; on a tab root it switches to Home, and on Home it backgrounds the app (platform default).
- Modal sheets intercept back to dismiss.
- Multi-step forms treat back as "previous step" until the first step, then confirm discard if the draft is dirty.

## State restoration

Navigation state is **not** persisted across cold starts (privacy: a cold start always lands on a predictable screen). Warm restores are handled by the OS.
