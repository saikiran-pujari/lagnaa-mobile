import { palette } from './primitives';

/** Semantic colour roles. Every screen colour comes from one of these; see DESIGN.md. */
export interface ColorTokens {
  surface: { base: string; raised: string; sunken: string; overlay: string };
  text: { primary: string; secondary: string; muted: string; inverse: string; link: string };
  brand: {
    primary: string;
    primaryPressed: string;
    onPrimary: string;
    accent: string;
    onAccent: string;
    primarySubtle: string;
  };
  border: { subtle: string; strong: string; focus: string };
  status: {
    success: { bg: string; fg: string };
    warning: { bg: string; fg: string };
    danger: { bg: string; fg: string };
    info: { bg: string; fg: string };
  };
  privacy: { locked: string; lockedBg: string };
  skeleton: string;
}

export const lightColors: ColorTokens = {
  surface: {
    base: palette.warm[50],
    raised: palette.warm[0],
    sunken: palette.warm[100],
    overlay: 'rgba(31, 20, 22, 0.45)',
  },
  text: {
    primary: palette.warm[800],
    secondary: palette.warm[600],
    muted: palette.warm[500],
    inverse: palette.warm[0],
    link: palette.maroon[600],
  },
  brand: {
    primary: palette.maroon[600],
    primaryPressed: palette.maroon[700],
    onPrimary: palette.warm[0],
    accent: palette.gold[400],
    onAccent: palette.warm[900],
    primarySubtle: palette.maroon[50],
  },
  border: { subtle: palette.warm[200], strong: palette.warm[300], focus: palette.maroon[600] },
  status: {
    success: { bg: palette.green[50], fg: palette.green[600] },
    warning: { bg: palette.amber[50], fg: palette.amber[600] },
    danger: { bg: palette.red[50], fg: palette.red[600] },
    info: { bg: palette.maroon[50], fg: palette.maroon[700] },
  },
  privacy: { locked: palette.rose[500], lockedBg: palette.maroon[50] },
  skeleton: palette.warm[200],
};

export const darkColors: ColorTokens = {
  surface: {
    base: palette.plum[900],
    raised: palette.plum[850],
    sunken: palette.plum[950],
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
  text: {
    primary: '#F5EDE9',
    secondary: '#CDB9BD',
    muted: '#9A868A',
    inverse: palette.warm[900],
    link: palette.rose[400],
  },
  brand: {
    primary: palette.rose[400],
    primaryPressed: palette.maroon[400],
    onPrimary: palette.warm[0],
    accent: palette.gold[300],
    onAccent: palette.warm[900],
    primarySubtle: palette.plum[800],
  },
  border: { subtle: palette.plum[800], strong: palette.plum[700], focus: palette.rose[400] },
  status: {
    success: { bg: '#163524', fg: palette.green[300] },
    warning: { bg: '#3A2A12', fg: palette.amber[300] },
    danger: { bg: '#3F1512', fg: palette.red[300] },
    info: { bg: palette.plum[800], fg: palette.maroon[200] },
  },
  privacy: { locked: '#C9A0AD', lockedBg: palette.plum[800] },
  skeleton: palette.plum[800],
};
