import React, { useEffect } from 'react';
import { type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: 'sm' | 'md' | 'lg' | 'full';
}

/** Reserves final layout while loading; pulses unless reduced motion is requested. */
export function Skeleton({ width = '100%', height = 16, radius = 'sm' }: SkeletonProps) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(withTiming(0.5, { duration: 800 }), -1, true);
  }, [opacity, reduced]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      accessibilityElementsHidden
      style={[
        { width, height, borderRadius: t.radius[radius], backgroundColor: t.colors.skeleton },
        animated,
      ]}
    />
  );
}
