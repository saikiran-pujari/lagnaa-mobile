import React from 'react';

import { useContainer } from '@/app/ContainerContext';
import { env, release } from '@/core/env';
import { Box, Screen, Text } from '@/design-system';

/** Release metadata, the one screen support can ask any Member to open. */
export function AboutScreen() {
  const { updates, notifications, monitoring } = useContainer();
  const bundle = updates.current();
  const rows: Array<[string, string]> = [
    ['Version', `${release.appVersion} (${release.buildNumber})`],
    ['Environment', env.name],
    ['Channel', bundle.channel],
    ['Bundle', bundle.bundleId],
    ['Runtime', bundle.fingerprint],
    ['Push', notifications.configured ? 'configured' : 'not configured'],
    ['Monitoring', monitoring.enabled ? 'enabled' : 'disabled'],
  ];
  return (
    <Screen testID="about-screen">
      <Box gap={3} pt={4}>
        {rows.map(([k, v]) => (
          <Box
            key={k}
            row
            justify="space-between"
            py={2}
            style={{ borderBottomWidth: 1, borderBottomColor: 'transparent' }}
          >
            <Text tone="secondary">{k}</Text>
            <Text variant="bodyStrong" testID={`about-${k.toLowerCase()}`}>
              {v}
            </Text>
          </Box>
        ))}
      </Box>
    </Screen>
  );
}
