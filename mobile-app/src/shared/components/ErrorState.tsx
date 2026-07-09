import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/core/theme/theme';

export function ErrorState({
  message = 'Une erreur est survenue.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.root}>
      <Ionicons color={theme.colors.danger} name="alert-circle-outline" size={34} />
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry}>
          <Text style={styles.action}>Réessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  text: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
  action: { color: theme.colors.cyan, ...theme.typography.subheading },
});
