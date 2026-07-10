import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
  variant?: 'elevated' | 'soft' | 'outline';
};

export function GlassCard({ children, style, accent = false, variant = 'elevated' }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <View style={[styles.card, styles[variant], accent && styles.accent, style]}>{children}</View>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  elevated: { backgroundColor: theme.colors.surface, ...theme.shadowSmall },
  soft: { backgroundColor: theme.colors.surfaceMuted },
  outline: { backgroundColor: theme.colors.transparent },
  accent: {
    borderColor: theme.colors.borderBright,
    backgroundColor: theme.isDark ? 'rgba(32, 35, 55, 0.94)' : 'rgba(250, 250, 255, 0.98)',
  },
});
