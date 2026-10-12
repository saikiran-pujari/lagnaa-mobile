import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';

export interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent' | 'info';
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const t = useTheme();
  const c = {
    neutral: { bg: t.colors.surface.sunken, fg: t.colors.text.secondary },
    success: t.colors.status.success,
    warning: t.colors.status.warning,
    danger: t.colors.status.danger,
    info: t.colors.status.info,
    accent: { bg: t.colors.brand.accent, fg: t.colors.brand.onAccent },
  }[tone];
  return (
    <View
      style={[styles.badge, { backgroundColor: c.bg, borderRadius: t.radius.full }]}
      accessibilityRole="text"
    >
      <Text variant="caption" style={{ color: c.fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
});
