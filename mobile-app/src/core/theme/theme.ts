import { Platform } from 'react-native';

import { darkColors, darkGradients, lightColors, lightGradients } from './colors';
import { radius, spacing } from './spacing';
import { typography } from './typography';

const createShadow = (isDark: boolean, small: boolean) => Platform.select({
  web: {
    boxShadow: isDark
      ? small ? '0 4px 10px rgba(0, 0, 0, 0.18)' : '0 12px 24px rgba(0, 0, 0, 0.26)'
      : small ? '0 4px 12px rgba(23, 32, 51, 0.06)' : '0 10px 24px rgba(23, 32, 51, 0.08)',
  },
  default: isDark
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: small ? 4 : 12 },
        shadowOpacity: small ? 0.18 : 0.26,
        shadowRadius: small ? 10 : 24,
        elevation: small ? 3 : 8,
      }
    : {
        shadowColor: '#172033',
        shadowOffset: { width: 0, height: small ? 4 : 10 },
        shadowOpacity: small ? 0.06 : 0.08,
        shadowRadius: small ? 12 : 24,
        elevation: small ? 2 : 4,
      },
})!;

const createTheme = (isDark: boolean) => ({
  isDark,
  colors: isDark ? darkColors : lightColors,
  gradients: isDark ? darkGradients : lightGradients,
  spacing,
  radius,
  typography,
  shadow: createShadow(isDark, false),
  shadowSmall: createShadow(isDark, true),
} as const);

export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);

// Kept for non-visual legacy files; active UI uses useAppTheme().
export const theme = darkTheme;

export type AppTheme = typeof lightTheme | typeof darkTheme;
export type ThemePreference = 'system' | 'light' | 'dark';
