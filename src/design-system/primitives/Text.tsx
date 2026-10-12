import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '../theme';
import type { TypeVariant } from '../tokens';

export type TextTone =
  'primary' | 'secondary' | 'muted' | 'inverse' | 'brand' | 'danger' | 'success' | 'link';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
}

/** The only text component. Supports Dynamic Type up to 1.3x so layouts stay intact. */
export function Text({
  variant = 'body',
  tone = 'primary',
  align,
  style,
  children,
  ...rest
}: TextProps) {
  const t = useTheme();
  const scale = t.typeScale[variant];
  const color = {
    primary: t.colors.text.primary,
    secondary: t.colors.text.secondary,
    muted: t.colors.text.muted,
    inverse: t.colors.text.inverse,
    brand: t.colors.brand.primary,
    danger: t.colors.status.danger.fg,
    success: t.colors.status.success.fg,
    link: t.colors.text.link,
  }[tone];
  return (
    <RNText
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[
        {
          fontFamily: scale.family,
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          color,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
