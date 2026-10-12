import React, { useState } from 'react';

import * as api from '@/api';
import { isApiError } from '@/api';
import { useContainer } from '@/app/ContainerContext';
import { Box, Button, Screen, Text, TextField } from '@/design-system';

/** Foundation sign-in: exercises the api → session → navigation path. Full UX lands in Phase 1. */
export function SignInScreen() {
  const { session } = useContainer();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await api.auth.signIn(identifier.trim(), password);
      await session.signIn(
        { accessToken: result.accessToken, refreshToken: result.refreshToken },
        result.needsProfileCompletion,
      );
    } catch (e) {
      setError(isApiError(e) ? e.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen testID="signin-screen">
      <Box gap={5} pt={6}>
        <Text variant="title">Welcome back</Text>
        <TextField
          label="Email or phone"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoComplete="username"
          keyboardType="email-address"
          testID="signin-identifier"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          testID="signin-password"
          error={error ?? undefined}
        />
        <Button
          label="Sign in"
          onPress={() => void submit()}
          loading={busy}
          disabled={!identifier || !password}
          testID="signin-submit"
        />
      </Box>
    </Screen>
  );
}
