import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';

export function CvUploadProgress({ fileName }: { fileName: string }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <GlassCard variant="soft"><View accessibilityLiveRegion="polite" accessibilityRole="progressbar" style={styles.row}><ActivityIndicator color={theme.colors.primary} /><View style={styles.copy}><Text style={styles.title}>Envoi et analyse en cours</Text><Text numberOfLines={1} style={styles.file}>{fileName}</Text><Text style={styles.note}>La progression est indeterminee. Le backend enregistre le fichier puis lance l analyse IA.</Text></View></View></GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }, copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs }, title: { color: theme.colors.textPrimary, ...theme.typography.subheading }, file: { color: theme.colors.primary, ...theme.typography.label }, note: { color: theme.colors.textSecondary, ...theme.typography.caption } });

