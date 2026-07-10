const shared = {
  primary: '#4F46E5',
  primaryStrong: '#3730A3',
  violet: '#7C3AED',
  emerald: '#059669',
  cyan: '#0891B2',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export const lightColors = {
  ...shared,
  navy: '#F6F7FB',
  navySoft: '#FFFFFF',
  background: '#F6F7FB',
  backgroundElevated: '#FFFFFF',
  surface: 'rgba(255, 255, 255, 0.92)',
  surfaceStrong: '#FFFFFF',
  surfaceMuted: '#F0F2F7',
  surfaceSubtle: '#EAECF4',
  border: 'rgba(15, 23, 42, 0.09)',
  borderBright: 'rgba(79, 70, 229, 0.30)',
  textPrimary: '#121826',
  textSecondary: '#536078',
  textMuted: '#8490A5',
  overlay: 'rgba(15, 23, 42, 0.48)',
  tabBar: 'rgba(255, 255, 255, 0.96)',
  input: '#F7F8FB',
} as const;

export const darkColors = {
  ...shared,
  primary: '#818CF8',
  primaryStrong: '#6366F1',
  violet: '#A78BFA',
  emerald: '#34D399',
  cyan: '#22D3EE',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#FB7185',
  info: '#60A5FA',
  navy: '#090B12',
  navySoft: '#11141D',
  background: '#090B12',
  backgroundElevated: '#11141D',
  surface: 'rgba(20, 24, 35, 0.92)',
  surfaceStrong: '#171B27',
  surfaceMuted: '#1D2230',
  surfaceSubtle: '#252B3B',
  border: 'rgba(255, 255, 255, 0.09)',
  borderBright: 'rgba(129, 140, 248, 0.34)',
  textPrimary: '#F8FAFC',
  textSecondary: '#AAB3C5',
  textMuted: '#727E94',
  overlay: 'rgba(0, 0, 0, 0.68)',
  tabBar: 'rgba(17, 20, 29, 0.97)',
  input: '#151924',
} as const;

export const lightGradients = {
  background: ['#F8F9FD', '#F2F4FA', '#F7FAFC'] as const,
  primary: ['#4F46E5', '#6D28D9'] as const,
  premium: ['#312E81', '#4F46E5', '#0F766E'] as const,
  success: ['#047857', '#059669'] as const,
  subtle: ['rgba(79,70,229,0.10)', 'rgba(5,150,105,0.03)'] as const,
};

export const darkGradients = {
  background: ['#090B12', '#0D1019', '#090B12'] as const,
  primary: ['#6366F1', '#7C3AED'] as const,
  premium: ['#312E81', '#5B21B6', '#0F766E'] as const,
  success: ['#047857', '#059669'] as const,
  subtle: ['rgba(99,102,241,0.18)', 'rgba(5,150,105,0.02)'] as const,
};

// Backward-compatible aliases for files outside the active mobile UI.
export const colors = darkColors;
export const gradients = darkGradients;

export type AppColors = typeof lightColors | typeof darkColors;
