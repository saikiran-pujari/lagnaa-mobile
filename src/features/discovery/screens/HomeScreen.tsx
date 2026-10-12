import React from 'react';

import { EmptyState, Screen } from '@/design-system';

export function HomeScreen() {
  return (
    <Screen scroll={false} testID="home-screen">
      <EmptyState title="Home" body="This screen is implemented in Phase 1." />
    </Screen>
  );
}
