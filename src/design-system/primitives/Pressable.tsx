import React from 'react';
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';

export interface PressableProps extends Omit<RNPressableProps, 'style'> {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  /** Required unless the child is text: screen readers need a name. */
  accessibilityLabel?: string;
  pressedOpacity?: number;
}

/** Touch primitive: ≥44pt hit area, pressed feedback within a frame, no layout shift. */
export function Pressable({ style, pressedOpacity = 0.7, hitSlop, ...rest }: PressableProps) {
  const t = useTheme();
  return (
    <RNPressable
      accessibilityRole="button"
      hitSlop={hitSlop ?? 8}
      android_ripple={{ color: t.colors.surface.overlay, borderless: false }}
      {...rest}
      style={(state) => [
        {
          minHeight: t.touchTarget.min,
          minWidth: t.touchTarget.min,
          justifyContent: 'center',
          opacity: state.pressed ? pressedOpacity : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    />
  );
}
