import React, { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import {
  type ColorTokens,
  darkColors,
  elevation,
  iconSize,
  lightColors,
  motion,
  radius,
  spacing,
  touchTarget,
  typeScale,
} from '../tokens';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'system' | ThemeMode;

export interface Theme {
  mode: ThemeMode;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  iconSize: typeof iconSize;
  touchTarget: typeof touchTarget;
  motion: typeof motion;
  typeScale: typeof typeScale;
  elevation: typeof elevation;
}

export function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    iconSize,
    touchTarget,
    motion,
    typeScale,
    elevation,
  };
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

export function ThemeProvider({
  preference = 'system',
  children,
}: PropsWithChildren<{ preference?: ThemePreference }>) {
  const system = useColorScheme();
  const mode: ThemeMode =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Memoises a style factory per theme so screens never create styles with literal values. */
export function createStyles<T extends Record<string, object>>(factory: (t: Theme) => T): () => T {
  const cache = new WeakMap<Theme, T>();
  return function useStyles() {
    const theme = useTheme();
    let s = cache.get(theme);
    if (!s) {
      s = factory(theme);
      cache.set(theme, s);
    }
    return s;
  };
}
