import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';

export type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'violet' | 'neutral';

export function AppBadge({ label, tone = 'info', icon }: { label: string; tone?: BadgeTone; icon?: keyof typeof Ionicons.glyphMap }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const tones: Record<BadgeTone, { backgroundColor: string; color: string }> = {
    info: { backgroundColor: theme.isDark ? 'rgba(96,165,250,0.14)' : '#EAF2FF', color: theme.colors.info },
    success: { backgroundColor: theme.isDark ? 'rgba(52,211,153,0.14)' : '#E7F8F1', color: theme.colors.success },
    warning: { backgroundColor: theme.isDark ? 'rgba(251,191,36,0.14)' : '#FFF5DF', color: theme.colors.warning },
    danger: { backgroundColor: theme.isDark ? 'rgba(251,113,133,0.14)' : '#FDECEF', color: theme.colors.danger },
    violet: { backgroundColor: theme.isDark ? 'rgba(167,139,250,0.15)' : '#F0ECFF', color: theme.colors.violet },
    neutral: { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.textSecondary },
  };
  const toneStyle = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.backgroundColor }]}>
      {icon ? <Ionicons color={toneStyle.color} name={icon} size={13} /> : null}
      <Text numberOfLines={1} style={[styles.label, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  badge: { alignSelf: 'flex-start', minHeight: 28, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.md, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { ...theme.typography.caption, fontWeight: '700' },
});
