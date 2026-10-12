import React, { type PropsWithChildren } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

export interface ScreenProps {
  /** Scrollable content (default) or a fixed layout that owns its own list. */
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  testID?: string;
}

/** Every screen renders inside this: safe areas, surface colour, status bar style, gutters. */
export function Screen({
  scroll = true,
  padded = true,
  edges = ['top', 'bottom'],
  testID,
  children,
}: PropsWithChildren<ScreenProps>) {
  const t = useTheme();
  const content = padded ? { paddingHorizontal: t.spacing[4] } : undefined;
  return (
    <SafeAreaView
      testID={testID}
      edges={edges}
      style={[styles.flex, { backgroundColor: t.colors.surface.base }]}
    >
      <StatusBar barStyle={t.mode === 'dark' ? 'light-content' : 'dark-content'} />
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, content]}
          contentInsetAdjustmentBehavior="automatic"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingVertical: 16 },
});
