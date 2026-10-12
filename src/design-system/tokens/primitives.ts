/** Raw values. Nothing outside design-system/tokens imports this file. */
export const palette = {
  maroon: {
    50: '#FBF1F3',
    100: '#F4DCE2',
    200: '#E6B5C1',
    300: '#D1869A',
    400: '#B85673',
    500: '#9A3453',
    600: '#7A1F3A',
    700: '#5E1730',
    800: '#431024',
    900: '#2A0916',
  },
  gold: {
    50: '#FCF6E8',
    100: '#F6E6BF',
    200: '#EDD08C',
    300: '#E2B65A',
    400: '#D9A441',
    500: '#C08C2A',
    600: '#9A6F1F',
    700: '#745217',
    800: '#4D360F',
    900: '#2B1E08',
  },
  warm: {
    0: '#FFFFFF',
    50: '#FAF7F4',
    100: '#F3EDE8',
    200: '#E7DDD9',
    300: '#CDBFBA',
    400: '#A89599',
    500: '#8A777B',
    600: '#5C4A4E',
    700: '#3B2C31',
    800: '#1F1416',
    900: '#15090D',
    950: '#0F0609',
  },
  plum: { 800: '#33232A', 850: '#1F1216', 900: '#15090D', 950: '#0F0609', 700: '#4A3740' },
  green: { 50: '#EAF5EE', 500: '#2E7D4F', 600: '#246640', 300: '#7FC79C' },
  amber: { 50: '#FBF1E6', 500: '#A6611A', 600: '#854E15', 300: '#E0A86B' },
  red: { 50: '#FBEAE9', 500: '#B3261E', 600: '#8F1E18', 300: '#E68A85' },
  rose: { 400: '#C9506E', 500: '#9A6B78' },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;
export const radius = { none: 0, sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
export const iconSize = { sm: 16, md: 20, lg: 24, xl: 32 } as const;
export const touchTarget = { min: 44 } as const;
export const motion = {
  duration: { fast: 120, base: 200, slow: 320 },
  easing: { standard: [0.2, 0, 0, 1] as const, emphasized: [0.3, 0, 0, 1] as const },
} as const;

export const fontFamily = {
  display: 'PlayfairDisplay-SemiBold',
  displayRegular: 'PlayfairDisplay-Regular',
  sans: 'Inter-Regular',
  sansMedium: 'Inter-Medium',
  sansSemiBold: 'Inter-SemiBold',
} as const;

export const typeScale = {
  display: { fontSize: 32, lineHeight: 40, family: fontFamily.display },
  title: { fontSize: 24, lineHeight: 32, family: fontFamily.display },
  heading: { fontSize: 20, lineHeight: 28, family: fontFamily.sansSemiBold },
  body: { fontSize: 16, lineHeight: 24, family: fontFamily.sans },
  bodyStrong: { fontSize: 16, lineHeight: 24, family: fontFamily.sansSemiBold },
  label: { fontSize: 14, lineHeight: 20, family: fontFamily.sansMedium },
  caption: { fontSize: 13, lineHeight: 18, family: fontFamily.sans },
} as const;

export type TypeVariant = keyof typeof typeScale;
export const elevation = {
  0: { shadowOpacity: 0, elevation: 0 },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
