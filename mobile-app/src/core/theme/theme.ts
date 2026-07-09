import { colors, gradients } from './colors';
import { radius, spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  gradients,
  spacing,
  radius,
  typography,
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export type AppTheme = typeof theme;
