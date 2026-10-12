import React from 'react';

import { EmptyState, Screen } from '@/design-system';

export function ConnectionsScreen() {
  return (
    <Screen scroll={false} testID="connections-screen">
      <EmptyState title="Connections" body="This screen is implemented in Phase 1." />
    </Screen>
  );
}
