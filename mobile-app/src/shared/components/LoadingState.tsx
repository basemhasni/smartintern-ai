import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/core/theme/theme';

export function LoadingState({ label = 'Chargement...' }: { label?: string }) {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={theme.colors.cyan} size="large" />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  text: { color: theme.colors.textSecondary, ...theme.typography.body },
});
