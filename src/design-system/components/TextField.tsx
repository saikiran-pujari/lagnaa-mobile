import React, { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  error?: string;
  testID?: string;
}

/** Labelled input with hint and inline error; the label is always visible (never placeholder-only). */
export function TextField({ label, hint, error, testID, ...input }: TextFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? t.colors.status.danger.fg
    : focused
      ? t.colors.border.focus
      : t.colors.border.strong;
  return (
    <View style={styles.wrap}>
      <Text variant="label" tone="secondary">
        {label}
      </Text>
      <TextInput
        testID={testID}
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={t.colors.text.muted}
        onFocus={(e) => {
          setFocused(true);
          input.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          input.onBlur?.(e);
        }}
        {...input}
        style={[
          styles.input,
          {
            borderColor,
            borderRadius: t.radius.md,
            color: t.colors.text.primary,
            backgroundColor: t.colors.surface.raised,
            fontFamily: t.typeScale.body.family,
            fontSize: t.typeScale.body.fontSize,
          },
        ]}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: { borderWidth: 1, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10 },
});
