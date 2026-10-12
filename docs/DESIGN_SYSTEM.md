# Design system

A mobile product, not the website shrunk. Direction comes from `DESIGN.md` (brand: maroon, gold, warm neutrals, Playfair Display + Inter). This document fixes the structure; `antislop` and `ui-ux-pro-max` skills govern quality.

## Token architecture (three layers)

```
primitive  →  semantic  →  component
#771927       color.primary   button.primary.bg
```

- **Primitive** tokens (`tokens/primitives.ts`): raw palette ramps (maroon 50-900, gold 50-900, neutral warm 0-950, success/warning/danger ramps), type scale, spacing scale (4-pt base: 4 8 12 16 20 24 32 40 48 64), radii (4 8 12 16 24 full), elevation (0-4), motion durations (fast 120 · base 200 · slow 320 ms) and easings, icon sizes (16 20 24 32), touch target 44 (iOS) / 48 (Android).
- **Semantic** tokens (`tokens/semantic.ts`): `color.surface.{base,raised,sunken,overlay}`, `color.text.{primary,secondary,muted,inverse,link}`, `color.brand.{primary,primaryPressed,accent}`, `color.border.{subtle,strong,focus}`, `color.status.{success,warning,danger,info}` each with `bg` and `fg`, `color.privacy.locked` (the one place gated content gets its colour). Defined once for **light** and once for **dark**; both ship from day one and are tested for 4.5:1 text contrast.
- **Component** tokens live beside the component (`components/Button/tokens.ts`) and reference semantic tokens only.

Typography: `display` (Playfair Display 600, 32/40), `title` (Playfair Display 600, 24/32), `heading` (Inter 600, 20/28), `body` (Inter 400, 16/24), `bodyStrong` (Inter 600, 16/24), `label` (Inter 500, 14/20), `caption` (Inter 400, 13/18). All respect Dynamic Type / `fontScale` up to 1.3 without layout breakage; above that, lines wrap, nothing truncates silently.

## Layers

| Layer | Contents | Rule |
|---|---|---|
| `primitives/` | `Box`, `Text`, `Pressable`, `Icon`, `RemotePhoto` | the only components that touch RN primitives and tokens directly |
| `components/` | `Button`, `IconButton`, `TextField`, `Select`, `DatePickerField`, `OTPField`, `Avatar`, `Badge`, `Card`, `ListItem`, `Chip`, `SegmentedControl`, `Switch`, `Divider`, `Skeleton`, `BottomSheet`, `Dialog`, `Toast`, `Banner`, `ProgressBar` | built from primitives; every component has pressed, disabled, loading and error states where applicable |
| `patterns/` | `Screen` (safe-area, edge-to-edge, scroll/keyboard behaviour), `Header`, `TabBar`, `QueryBoundary` (loading/error/empty/content), `EmptyState`, `ErrorState`, `FormScreen`, `ActionBar` (bottom, thumb-reach), `PhotoPager`, `GatedPhoto` | compose components into screen-level behaviour |

## Mobile principles encoded as component defaults

- Primary actions sit in a bottom `ActionBar` within thumb reach; destructive actions are never adjacent to primary ones.
- Touch targets ≥ 44×44 pt (48 dp Android) with `hitSlop` on small icons; ≥ 8 pt between adjacent targets.
- Pressed feedback within 100 ms (opacity + subtle surface change; no layout shift).
- Sheets over modals; modals only for confirmations.
- Reduced motion: `useReducedMotion()` from Reanimated switches every transition to a 1-frame fade.
- Accessibility: every `Pressable` requires `accessibilityLabel` or text child (lint rule); icons beside text are `accessibilityElementsHidden`; form fields expose label, hint and error via `accessibilityLabel`/`accessibilityHint`.
- Loading: skeletons that reserve final layout; no spinners inside lists.
- Empty states say what to do next, with one action.
- Icons from `lucide-react-native`, 1.75 stroke, sizes from tokens; no emoji as icons.

## Privacy-aware patterns

- `GatedPhoto`: renders the photo when a URL is present; when gated (no URL) renders a brand-tinted placeholder with the lock glyph and the reason ("Photos visible after your interest is accepted"). It never applies a blur to a real image to fake gating.
- `ContactReveal`: email/phone are rendered only from a `privateWithContact` view, as tappable `tel:`/`mailto:` rows.

## Theming

`ThemeProvider` resolves `preferences.theme` (system default) to a `Theme` object `{ colors, typography, spacing, radii, elevation, motion }` consumed via `useTheme()`. Styles are created with `createStyles((t) => ({...}))`, memoised per theme. No `StyleSheet.create` with literal colours.

## Quality gates (per `ui-ux-pro-max` pro-rules and `antislop`)

Before a component or screen is merged: light and dark checked; 375-pt width and landscape checked; font scale 1.3 checked; reduced motion checked; contrast ≥ 4.5:1 for text and 3:1 for icons/borders; no raw hex outside `tokens/`; `DESIGN.md` direction cited for any decorative choice.
