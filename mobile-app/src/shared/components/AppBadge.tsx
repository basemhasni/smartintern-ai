import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'violet';

const tones: Record<Tone, { backgroundColor: string; color: string }> = {
  info: { backgroundColor: 'rgba(56, 189, 248, 0.14)', color: theme.colors.info },
  success: { backgroundColor: 'rgba(52, 211, 153, 0.14)', color: theme.colors.success },
  warning: { backgroundColor: 'rgba(251, 191, 36, 0.14)', color: theme.colors.warning },
  danger: { backgroundColor: 'rgba(251, 113, 133, 0.14)', color: theme.colors.danger },
  violet: { backgroundColor: 'rgba(139, 92, 246, 0.16)', color: '#C4B5FD' },
};

export function AppBadge({ label, tone = 'info' }: { label: string; tone?: Tone }) {
  return (
    <View style={[styles.badge, { backgroundColor: tones[tone].backgroundColor }]}>
      <Text style={[styles.label, { color: tones[tone].color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
  },
  label: { ...theme.typography.caption, fontWeight: '700' },
});
