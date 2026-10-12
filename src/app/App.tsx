import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { env } from '@/core/env';
import { log } from '@/core/logger';
import { PERSIST_MAX_AGE_MS, shouldDehydrateQuery } from '@/core/query';
import { ThemeProvider, useTheme } from '@/design-system';
import { buildLinking, RootNavigator } from '@/navigation';

import { buildContainer, type Container } from './container';
import { ContainerProvider } from './ContainerContext';
import { ErrorBoundary } from './ErrorBoundary';

function NavigationRoot({ container }: { container: Container }) {
  const t = useTheme();
  const navTheme = useMemo(
    () => ({
      ...(t.mode === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(t.mode === 'dark' ? DarkTheme : DefaultTheme).colors,
        primary: t.colors.brand.primary,
        background: t.colors.surface.base,
        card: t.colors.surface.raised,
        text: t.colors.text.primary,
        border: t.colors.border.subtle,
      },
    }),
    [t],
  );
  const linking = useMemo(() => buildLinking(env.links), []);
  return (
    <NavigationContainer
      theme={navTheme}
      linking={linking}
      onReady={() => {
        void BootSplash.hide({ fade: true });
        void container.updates.healthCheck();
        void container.updates.checkAndApply('launch');
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [container, setContainer] = useState<Container | null>(null);

  useEffect(() => {
    let cancelled = false;
    buildContainer()
      .then(async (c) => {
        await c.session.restore();
        if (!cancelled) setContainer(c);
      })
      .catch((e) => {
        log.error('app.bootstrap_failed', { error: e instanceof Error ? e.message : String(e) });
        void BootSplash.hide();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!container) return null; // native splash is still visible

  return (
    <ErrorBoundary monitoring={container.monitoring}>
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <ContainerProvider container={container}>
            <PersistQueryClientProvider
              client={container.queryClient}
              persistOptions={{
                persister: container.queryPersister,
                maxAge: PERSIST_MAX_AGE_MS,
                dehydrateOptions: { shouldDehydrateQuery },
              }}
            >
              <ThemeProvider preference="system">
                <NavigationRoot container={container} />
              </ThemeProvider>
            </PersistQueryClientProvider>
          </ContainerProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
