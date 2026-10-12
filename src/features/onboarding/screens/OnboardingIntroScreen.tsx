import React from 'react';

import { useContainer } from '@/app/ContainerContext';
import { Box, Button, Screen, Text } from '@/design-system';

export function OnboardingIntroScreen() {
  const { session } = useContainer();
  return (
    <Screen testID="onboarding-intro">
      <Box flex={1} justify="center" gap={4}>
        <Text variant="title">Let us set up the profile</Text>
        <Text tone="secondary">Profile completion sections arrive in Phase 1.</Text>
        <Button label="Continue (foundation)" onPress={() => session.markProfileComplete()} />
      </Box>
    </Screen>
  );
}
