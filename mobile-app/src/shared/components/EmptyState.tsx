import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/core/theme/theme';

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <Ionicons color={theme.colors.cyan} name="sparkles-outline" size={28} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.xl },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    marginBottom: theme.spacing.sm,
  },
  title: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  message: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
});
