import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '../theme';
import type { spacing } from '../tokens';

type Space = keyof typeof spacing;

export interface BoxProps extends ViewProps {
  p?: Space;
  px?: Space;
  py?: Space;
  pt?: Space;
  pb?: Space;
  m?: Space;
  mx?: Space;
  my?: Space;
  mt?: Space;
  mb?: Space;
  gap?: Space;
  row?: boolean;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  surface?: 'base' | 'raised' | 'sunken';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  border?: boolean;
  flex?: number;
}

/** Layout primitive that only understands tokens. */
export function Box({
  p,
  px,
  py,
  pt,
  pb,
  m,
  mx,
  my,
  mt,
  mb,
  gap,
  row,
  align,
  justify,
  surface,
  radius,
  border,
  flex,
  style,
  ...rest
}: BoxProps) {
  const t = useTheme();
  const s = t.spacing;
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: row ? 'row' : undefined,
          alignItems: align,
          justifyContent: justify,
          flex,
          padding: p !== undefined ? s[p] : undefined,
          paddingHorizontal: px !== undefined ? s[px] : undefined,
          paddingVertical: py !== undefined ? s[py] : undefined,
          paddingTop: pt !== undefined ? s[pt] : undefined,
          paddingBottom: pb !== undefined ? s[pb] : undefined,
          margin: m !== undefined ? s[m] : undefined,
          marginHorizontal: mx !== undefined ? s[mx] : undefined,
          marginVertical: my !== undefined ? s[my] : undefined,
          marginTop: mt !== undefined ? s[mt] : undefined,
          marginBottom: mb !== undefined ? s[mb] : undefined,
          gap: gap !== undefined ? s[gap] : undefined,
          backgroundColor: surface ? t.colors.surface[surface] : undefined,
          borderRadius: radius ? t.radius[radius] : undefined,
          borderWidth: border ? 1 : undefined,
          borderColor: border ? t.colors.border.subtle : undefined,
        },
        style,
      ]}
    />
  );
}
