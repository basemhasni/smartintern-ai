import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';

type Props = { title: string; subtitle?: string; action?: string; onPress?: () => void };

export function SectionHeader({ title, subtitle, action, onPress }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.row}>
      <View style={styles.copy}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>
      {action ? <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>{action}</Text><Ionicons color={theme.colors.primary} name="arrow-forward" size={15} /></Pressable> : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.md },
  copy: { flex: 1, gap: 2 },
  title: { color: theme.colors.textPrimary, ...theme.typography.heading },
  subtitle: { color: theme.colors.textMuted, ...theme.typography.caption },
  action: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: theme.spacing.sm },
  actionText: { color: theme.colors.primary, ...theme.typography.caption, fontWeight: '700' },
  pressed: { opacity: 0.65 },
});
