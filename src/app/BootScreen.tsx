import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/design-system';

/** Rendered under the native splash while the session restores; never shows for more than the restore timeout. */
export function BootScreen() {
  const t = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: t.colors.surface.base }]} testID="boot-screen">
      <ActivityIndicator color={t.colors.brand.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
