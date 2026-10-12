import React from 'react';

import { EmptyState, Screen } from '@/design-system';

export function MessagesScreen() {
  return (
    <Screen scroll={false} testID="messages-screen">
      <EmptyState title="Messages" body="This screen is implemented in Phase 2." />
    </Screen>
  );
}
