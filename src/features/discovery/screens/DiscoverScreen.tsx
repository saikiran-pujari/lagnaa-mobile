import React from 'react';

import { EmptyState, Screen } from '@/design-system';

export function DiscoverScreen() {
  return (
    <Screen scroll={false} testID="discover-screen">
      <EmptyState title="Discover" body="This screen is implemented in Phase 1." />
    </Screen>
  );
}
