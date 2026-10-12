import React from 'react';

import { useContainer } from '@/app/ContainerContext';
import { Box, Button, Screen, Text } from '@/design-system';
import { useAppNavigation } from '@/navigation';

export function MeScreen() {
  const nav = useAppNavigation();
  const { session } = useContainer();
  return (
    <Screen testID="me-screen">
      <Box gap={4} pt={4}>
        <Text variant="title">Me</Text>
        <Button
          label="About Lagnaa"
          variant="secondary"
          onPress={() => nav.navigate('About')}
          testID="me-about"
        />
        <Button
          label="Sign out"
          variant="ghost"
          onPress={() => void session.signOut('user')}
          testID="me-signout"
        />
      </Box>
    </Screen>
  );
}
