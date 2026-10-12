import React from 'react';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '../theme';
import type { TextTone } from './Text';

export interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: TextTone;
  /** Decorative icons beside visible text are hidden from assistive tech. */
  decorative?: boolean;
  accessibilityLabel?: string;
}

export function Icon({
  icon: Glyph,
  size = 'lg',
  tone = 'primary',
  decorative = true,
  accessibilityLabel,
}: IconProps) {
  const t = useTheme();
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
    <Glyph
      size={t.iconSize[size]}
      color={color}
      strokeWidth={1.75}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
    />
  );
}
