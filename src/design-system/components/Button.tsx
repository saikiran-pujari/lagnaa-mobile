import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Icon, Pressable, Text } from '../primitives';
import { useTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  testID,
}: ButtonProps) {
  const t = useTheme();
  const inactive = disabled || loading;
  const colors = {
    primary: {
      bg: t.colors.brand.primary,
      pressed: t.colors.brand.primaryPressed,
      fg: t.colors.brand.onPrimary,
      border: 'transparent',
    },
    secondary: {
      bg: t.colors.surface.raised,
      pressed: t.colors.surface.sunken,
      fg: t.colors.text.primary,
      border: t.colors.border.strong,
    },
    ghost: {
      bg: 'transparent',
      pressed: t.colors.surface.sunken,
      fg: t.colors.brand.primary,
      border: 'transparent',
    },
    danger: {
      bg: t.colors.status.danger.bg,
      pressed: t.colors.status.danger.bg,
      fg: t.colors.status.danger.fg,
      border: 'transparent',
    },
  }[variant];
  const tone =
    variant === 'primary'
      ? 'inverse'
      : variant === 'danger'
        ? 'danger'
        : variant === 'ghost'
          ? 'brand'
          : 'primary';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      pressedOpacity={1}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? colors.pressed : colors.bg,
          borderColor: colors.border,
          borderRadius: t.radius.md,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.fg} />
        ) : icon ? (
          <Icon icon={icon} size="md" tone={tone} />
        ) : null}
        <Text variant="bodyStrong" tone={tone}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, paddingHorizontal: 20, height: 48, alignItems: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
