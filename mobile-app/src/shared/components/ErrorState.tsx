import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';

export function ErrorState({ message = 'Une erreur est survenue.', onRetry }: { message?: string; onRetry?: () => void }) {
  const { theme } = useAppTheme();
  return <View style={styles.root}><View style={[styles.icon, { backgroundColor: `${theme.colors.danger}14` }]}><Ionicons color={theme.colors.danger} name="alert-circle-outline" size={28} /></View><Text style={[theme.typography.subheading, { color: theme.colors.textPrimary }]}>Impossible de continuer</Text><Text style={[styles.text, theme.typography.body, { color: theme.colors.textSecondary }]}>{message}</Text>{onRetry ? <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.action, { backgroundColor: theme.colors.surfaceMuted }, pressed && styles.pressed]}><Ionicons color={theme.colors.primary} name="refresh" size={17} /><Text style={[theme.typography.label, { color: theme.colors.primary }]}>Réessayer</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({ root: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }, icon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }, text: { maxWidth: 320, textAlign: 'center' }, action: { minHeight: 42, marginTop: 8, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, pressed: { opacity: 0.72 } });
