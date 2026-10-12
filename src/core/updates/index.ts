import type { OtaChannel } from '@/core/env';

export type UpdateTrigger = 'launch' | 'foreground' | 'manual';

export type UpdateResult =
  | { kind: 'none' }
  | { kind: 'staged'; bundleId: string; forceRestart: boolean }
  | { kind: 'error'; reason: string };

export interface CurrentBundle {
  /** Content hash of the active OTA bundle, or the sentinel 'embedded'. */
  bundleId: string;
  channel: OtaChannel;
  fingerprint: string;
}

/**
 * The OTA seam. The app only ever talks to this interface; the provider behind it is
 * `NoopUpdateProvider` today and `HotUpdaterProvider` in Phase 2 (see docs/OTA_ARCHITECTURE.md).
 * The native-side bundle selection happens before JS starts and is not represented here.
 */
export interface UpdateProvider {
  checkAndApply(trigger: UpdateTrigger): Promise<UpdateResult>;
  /** Called once the first screen has rendered; the provider commits or reverts the bundle. */
  healthCheck(): Promise<void>;
  current(): CurrentBundle;
  /** Support escape hatch: drop staged/downloaded bundles and return to the embedded one. */
  reset(): Promise<void>;
}

export function createNoopUpdateProvider(channel: OtaChannel, fingerprint: string): UpdateProvider {
  return {
    checkAndApply: () => Promise.resolve({ kind: 'none' }),
    healthCheck: () => Promise.resolve(),
    current: () => ({ bundleId: 'embedded', channel, fingerprint }),
    reset: () => Promise.resolve(),
  };
}
