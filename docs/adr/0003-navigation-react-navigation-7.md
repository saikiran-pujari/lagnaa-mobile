# 0003. React Navigation 7 (native-stack + bottom-tabs)

Status: accepted · 2026-10-12

## Context
Mobile navigation must feel native (platform transitions, gestures, back behaviour), support deep links and notification routing, auth-gated trees, modal/sheet routes, nested navigators, typed routes, and the New Architecture.

## Decision
`@react-navigation/native` 7.5 with `native-stack` and `bottom-tabs` on `react-native-screens` 4.29. One typed `RootStackParamList`; screens use `useAppNavigation()`/`useAppRoute()` wrappers only. Linking config is the single deep-link resolver; push taps are translated to the same URLs. Navigation state is not persisted across cold starts.

## Alternatives
- Expo Router: rejected, requires the Expo framework.
- react-native-navigation (Wix): rejected, smaller ecosystem, weaker New Architecture story, imperative API harder to type.
- Custom navigation: rejected.

## Consequences
Navigation is a dependency with native code (screens); upgrades are Store Releases. Typed routes make renames compile-time safe.
