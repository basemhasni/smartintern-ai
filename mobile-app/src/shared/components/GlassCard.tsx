import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { theme } from '@/core/theme/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  accent?: boolean;
};

export function GlassCard({ children, style, accent = false }: Props) {
  return (
    <View style={[styles.card, accent && styles.accent, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  accent: {
    borderColor: theme.colors.borderBright,
    backgroundColor: 'rgba(23, 37, 78, 0.88)',
  },
});
