import React from 'react';

import { useContainer } from '@/app/ContainerContext';
import { env } from '@/core/env';
import { Box, Button, Screen, Text } from '@/design-system';
import { useAppNavigation } from '@/navigation';

export function WelcomeScreen() {
  const nav = useAppNavigation();
  const { session } = useContainer();
  return (
    <Screen testID="welcome-screen">
      <Box flex={1} justify="center" gap={6}>
        <Box gap={2}>
          <Text variant="display">Lagnaa</Text>
          <Text variant="body" tone="secondary">
            Find a life partner within the Kshatriya community, with your family beside you.
          </Text>
        </Box>
        <Box gap={3}>
          <Button
            label="Sign in"
            onPress={() => nav.navigate('Auth', { screen: 'SignIn' })}
            testID="welcome-signin"
          />
          <Button
            label="Create an account"
            variant="secondary"
            onPress={() => undefined}
            disabled
          />
          {env.isDevelopment ? (
            <Button
              label="Dev: fake session"
              variant="ghost"
              testID="dev-fake-session"
              onPress={() =>
                void session.signIn(
                  {
                    accessToken:
                      'eyJhbGciOiJIUzI1NiJ9.' +
                      btoa(
                        JSON.stringify({
                          userId: '00000000-0000-4000-8000-000000000001',
                          role: 'USER',
                          exp: Math.floor(Date.now() / 1000) + 3600,
                        }),
                      ) +
                      '.sig',
                    refreshToken: 'dev-refresh',
                  },
                  false,
                )
              }
            />
          ) : null}
        </Box>
      </Box>
    </Screen>
  );
}
