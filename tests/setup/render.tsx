import React, { type PropsWithChildren, type ReactElement } from 'react';
import { type Metrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';

import { type ThemePreference, ThemeProvider } from '@/design-system';

const metrics: Metrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function renderWithProviders(
  ui: ReactElement,
  { theme = 'light', ...options }: RenderOptions & { theme?: ThemePreference } = {},
) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: PropsWithChildren) => (
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>
        <ThemeProvider preference={theme}>
          <NavigationContainer>{children}</NavigationContainer>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}
