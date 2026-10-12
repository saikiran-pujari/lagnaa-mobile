# Performance standards

Measured, not assumed. Budgets are enforced in review; numbers come from release builds on a mid-range Android device (reference: 4 GB RAM, Snapdragon 6-series class) and an iPhone 12.

| Metric | Budget | How measured |
|---|---|---|
| Cold start to first screen interactive | ≤ 2.0 s Android mid-range, ≤ 1.2 s iPhone 12 | bootsplash hide timestamp, Sentry app-start |
| Navigation transition | ≤ 100 ms to start, 60 fps during | Reanimated/screens profiling |
| List scroll (Discover, Messages) | no dropped frames at 60 fps with 500 items | FlashList metrics, Perf Monitor |
| Image memory | ≤ 150 MB resident on Discover with 20 visible photos | Xcode Instruments / Android Profiler |
| JS bundle (release, Hermes bytecode) | ≤ 3 MB initial; OTA bundle ≤ 3 MB | CI reports size; > budget needs justification |
| Network | ≤ 4 requests for Home first paint; no duplicate in-flight requests (query dedupe) | request log in dev |
| Re-renders | no screen re-renders on unrelated store changes (selector discipline) | React DevTools profiler in review |
| Memory pressure | no crash on `didReceiveMemoryWarning` / `onTrimMemory`; image cache evicts | manual test |

## Rules

- Virtualise every list with FlashList; `estimatedItemSize` set; items memoised; no inline closures creating new props per render.
- Images: request the size you render (server provides single-size objects today; thumbnails are a backend ticket); `RemotePhoto` resizes on decode with `resizeMode` and caps decode size. Presigned URLs are memoised per `objectKey` until `expiresAt` so the OS HTTP cache hits instead of re-downloading on every presign.
- Prefetch the next page of Discover when 70% scrolled; prefetch conversation list when Messages tab becomes visible.
- Defer non-critical work (Sentry breadcrumb flush, OTA check, token registration) with `InteractionManager`/`requestIdleCallback` equivalents after first paint.
- Reanimated worklets for gestures; no JS-thread animation.
- Hermes: avoid `Proxy` in hot paths; keep Zod parsing off the render path (parse once in `api`).
- Avoid `console.log` in render paths even in dev (perf skew).

## Startup budget breakdown (target)

native init 300 ms → JS bundle load 250 ms (Hermes bytecode) → providers 100 ms → session restore ≤ 150 ms (Keychain read + JWT decode, no network) → first screen render 200 ms.
