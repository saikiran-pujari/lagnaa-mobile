# Repository structure

```
lagnaa-mobile/
├── android/                      # owned native project (Gradle, manifest, flavors, signing config)
├── ios/                          # owned native project (Xcode workspace, schemes, xcconfig, entitlements)
├── src/
│   ├── app/                      # composition root: App.tsx, providers.tsx, bootstrap.ts
│   ├── core/                     # deep infrastructure modules (env, http, session, storage, logger,
│   │                             #   monitoring, updates, notifications, deeplinks, query)
│   ├── api/                      # backend contract: one module per server domain + schemas/
│   ├── design-system/
│   │   ├── tokens/               # colour, typography, spacing, radius, elevation, motion, icon sizes
│   │   ├── theme/                # light/dark resolution, ThemeProvider, useTheme
│   │   ├── primitives/           # Box, Text, Pressable, Icon, Image (RemotePhoto)
│   │   ├── components/           # Button, Input, Avatar, Badge, Card, ListItem, Sheet, Toast, ...
│   │   └── patterns/             # Screen, Header, QueryBoundary, EmptyState, ErrorState, FormScreen
│   ├── navigation/               # route types, navigators, linking, guards, useAppNavigation
│   ├── features/
│   │   ├── auth/                 # sign in, register, OTP, Google
│   │   ├── onboarding/           # profile completion steps, strength checklist
│   │   ├── profile/              # own profile, edit sections, photos, other member's profile
│   │   ├── discovery/            # home feed, search, filters, recommendations
│   │   ├── connections/          # interests, contact requests, shortlist, views, block, report
│   │   ├── chat/                 # conversations, thread
│   │   ├── notifications/        # permission, token lifecycle UI, inbox routing
│   │   └── settings/             # account, privacy, notifications, blocked, password, about
│   ├── shared/                   # cross-feature hooks, formatters, types (kept small)
│   └── types/                    # global ambient types (react-native-config, svg modules)
├── assets/
│   ├── fonts/
│   ├── icons/                    # app icon source artwork
│   └── images/
├── env/                          # .env.development / .env.staging / .env.production (public config)
├── web/                          # developer preview of screens in a browser (Vite + react-native-web + shims);
│                             #   a dev tool, NOT a client: excluded from lint/typecheck, never shipped
├── tests/
│   ├── unit/                     # pure modules (api schemas, core, utils)
│   ├── component/                # RNTL tests for design-system and feature components
│   ├── e2e/                      # Maestro flows (YAML)
│   └── setup/                    # jest setup, fakes, test utils
├── scripts/                      # icon generation, version bump, env check, release helpers
├── docs/                         # architecture docs (this folder) and adr/
├── skills/                       # vendor-grouped agent skills; .claude/skills/* symlink here
├── .claude/skills/               # Claude Code skill discovery (symlinks)
├── .github/workflows/            # ci.yml, android-release.yml, ios-release.yml, ota-release.yml
├── AGENTS.md                     # agent entry point; CLAUDE.md imports it
├── CONTEXT.md                    # shared product vocabulary
├── GLOSSARY.md                   # domain terms
├── DESIGN.md                     # brand and design direction
├── CONTRIBUTING.md
├── README.md
├── package.json · pnpm-lock.yaml · .npmrc
├── tsconfig.json · babel.config.js · metro.config.js · jest.config.js
├── eslint.config.mjs · prettier.config.mjs
└── .gitignore
```

## Placement rules

- A file goes in `features/<x>/` if only that feature imports it. It goes in `shared/` when a second feature needs it. It goes in `design-system/` when it is visual and feature-agnostic. It goes in `core/` when it is infrastructure.
- Tests for `core/` and `api/` live in `tests/unit/`; component tests in `tests/component/`; both mirror the `src/` path. Colocated `*.test.ts` next to the source is also accepted for small modules.
- `android/` and `ios/` are committed in full except generated build output and signing material (`.gitignore`).
- No folder exists without at least one real file; empty scaffolding is removed.
