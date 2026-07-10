import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';

export function LoadingState({ label = 'Chargement...' }: { label?: string }) {
  const { theme } = useAppTheme();
  return <View accessibilityLiveRegion="polite" style={styles.root}><View style={[styles.indicator, { backgroundColor: theme.colors.surfaceMuted }]}><ActivityIndicator color={theme.colors.primary} size="small" /></View><Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({ root: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }, indicator: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' } });
