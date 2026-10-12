---
version: alpha
name: Lagnaa
description: Mobile design direction for the Lagnaa matrimonial app, inherited from the web brand and adapted for touch.
colors:
  brand-primary: "#7A1F3A"
  brand-primary-pressed: "#5E1730"
  brand-accent: "#D9A441"
  background-base: "#FAF7F4"
  background-raised: "#FFFFFF"
  background-sunken: "#F3EDE8"
  foreground-primary: "#1F1416"
  foreground-secondary: "#5C4A4E"
  foreground-muted: "#8A777B"
  border-subtle: "#E7DDD9"
  border-strong: "#CDBFBA"
  status-success: "#2E7D4F"
  status-warning: "#A6611A"
  status-danger: "#B3261E"
  privacy-locked: "#9A6B78"
typography:
  display:
    fontFamily: Playfair Display
    fontSize: 32px
    lineHeight: 40px
    fontWeight: 600
  title:
    fontFamily: Playfair Display
    fontSize: 24px
    lineHeight: 32px
    fontWeight: 600
  heading:
    fontFamily: Inter
    fontSize: 20px
    lineHeight: 28px
    fontWeight: 600
  body:
    fontFamily: Inter
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 400
  label:
    fontFamily: Inter
    fontSize: 14px
    lineHeight: 20px
    fontWeight: 500
  caption:
    fontFamily: Inter
    fontSize: 13px
    lineHeight: 18px
    fontWeight: 400
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
---

## Overview

Lagnaa helps Kshatriya families find a marriage partner with dignity. The interface should feel like a well-kept family home: warm, calm, trustworthy, unhurried. Maroon is the colour of the occasion and appears where commitment happens (primary actions, the brand mark); gold is reserved for moments of recognition (verified, accepted, new); everything else is warm neutral so photographs and names carry the page. The web brand defines these colours and the Playfair Display + Inter pairing; the mobile app inherits that identity and changes only what touch requires.

Identity check (antislop): swap the logo and name, and the warm maroon-and-cream palette with serif display headings and generous list rhythm should still read as Lagnaa, not as a generic dating app.

## Colors

- Maroon is the single accent for commitment: primary buttons, selected tab, the interest action. It is not used for large surfaces except the splash and the icon.
- Gold marks recognition only: verified badge, accepted state, "new" indicators. Never on buttons, never as a background.
- Neutrals are warm, never pure grey. Dark theme keeps the warmth (deep plum-black surfaces, cream text) rather than switching to neutral black.
- `privacy-locked` is the one colour for gated content (photos not yet visible, contact not unlocked), so the state is learnable.

## Themes

| Token | Light | Dark |
|---|---|---|
| brand-primary | #7A1F3A | #C9506E |
| brand-accent | #D9A441 | #E2B65A |
| background-base | #FAF7F4 | #15090D |
| background-raised | #FFFFFF | #1F1216 |
| background-sunken | #F3EDE8 | #0F0609 |
| foreground-primary | #1F1416 | #F5EDE9 |
| foreground-secondary | #5C4A4E | #CDB9BD |
| foreground-muted | #8A777B | #9A868A |
| border-subtle | #E7DDD9 | #33232A |
| border-strong | #CDBFBA | #4A3740 |

## Typography

Playfair Display for display and title sizes only (names on profile detail, screen titles). Everything that is read at length, every label, every button is Inter. Headings are set sentence case. Numbers in stats use tabular figures.

## Layout

Lists breathe: 16 pt gutters, 12 pt between cards, 24 pt between sections. Primary actions live in a bottom action bar. Content never touches system bars.

## Shapes

Cards 16, inputs and buttons 12, chips and avatars full. One radius per element class; no pill-shaped everything.

## Elevation & Depth

Flat by default. Elevation only for the bottom sheet, the action bar and the active card while dragging. No glow, no glass.

## Do's and Don'ts

- Do show a photo placeholder with the lock glyph and a one-line reason when a photo is gated. Don't blur a real photo to simulate gating.
- Do write actions as verbs in the member's voice ("Send interest", "Request contact"). Don't use "Like", "Match", "Swipe".
- Don't use emoji as icons, gradients as backgrounds, or testimonials/statistics that are not real.
