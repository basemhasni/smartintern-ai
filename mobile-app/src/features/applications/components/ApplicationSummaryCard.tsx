import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color?: string;
};

export function ApplicationSummaryCard({ icon, label, value, color }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const accent = color ?? theme.colors.primary;
  return (
    <GlassCard style={styles.card} variant="soft">
      <View style={[styles.icon, { backgroundColor: `${accent}16` }]}><Ionicons color={accent} name={icon} size={18} /></View>
      <Text style={styles.value}>{value}</Text>
      <Text numberOfLines={1} style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: { width: 112, minHeight: 112, padding: theme.spacing.md, gap: theme.spacing.xs },
  icon: { width: 32, height: 32, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xs },
  value: { color: theme.colors.textPrimary, fontSize: 22, lineHeight: 26, fontWeight: '800' },
  label: { color: theme.colors.textMuted, ...theme.typography.caption },
});
