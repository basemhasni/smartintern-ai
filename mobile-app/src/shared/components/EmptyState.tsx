import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';

export function EmptyState({ title, message, icon = 'folder-open-outline' }: { title: string; message: string; icon?: keyof typeof Ionicons.glyphMap }) {
  const { theme } = useAppTheme();
  return <View style={styles.root}><View style={[styles.icon, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}><Ionicons color={theme.colors.primary} name={icon} size={27} /></View><Text style={[theme.typography.subheading, { color: theme.colors.textPrimary }]}>{title}</Text><Text style={[styles.message, theme.typography.body, { color: theme.colors.textSecondary }]}>{message}</Text></View>;
}

const styles = StyleSheet.create({ root: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 9, padding: 24 }, icon: { width: 58, height: 58, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }, message: { maxWidth: 320, textAlign: 'center' } });
