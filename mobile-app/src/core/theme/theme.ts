import { darkColors, darkGradients, lightColors, lightGradients } from './colors';
import { radius, spacing } from './spacing';
import { typography } from './typography';

const createTheme = (isDark: boolean) => ({
  isDark,
  colors: isDark ? darkColors : lightColors,
  gradients: isDark ? darkGradients : lightGradients,
  spacing,
  radius,
  typography,
  shadow: isDark
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.26,
        shadowRadius: 24,
        elevation: 8,
      }
    : {
        shadowColor: '#172033',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
      },
  shadowSmall: isDark
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 3,
      }
    : {
        shadowColor: '#172033',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
      },
} as const);

export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);

// Kept for non-visual legacy files; active UI uses useAppTheme().
export const theme = darkTheme;

export type AppTheme = typeof lightTheme | typeof darkTheme;
export type ThemePreference = 'system' | 'light' | 'dark';
