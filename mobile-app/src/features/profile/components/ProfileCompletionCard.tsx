import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import type { ProfileCompletion } from '@/features/student/models/studentProfile';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';

export function ProfileCompletionCard({ completion }: { completion: ProfileCompletion }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <GlassCard><SectionHeader title="Progression du profil" subtitle="Indicateur UI base uniquement sur les champs disponibles" /><View style={styles.row}><Text style={styles.value}>{completion.completed}/{completion.total}</Text><Text style={styles.label}>elements renseignes</Text><Text style={styles.percent}>{completion.percentage}%</Text></View><View style={styles.track}><View style={[styles.progress, { width: `${completion.percentage}%` }]} /></View></GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  row: { marginTop: theme.spacing.lg, flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm },
  value: { color: theme.colors.textPrimary, ...theme.typography.heading },
  label: { flex: 1, color: theme.colors.textSecondary, ...theme.typography.caption },
  percent: { color: theme.colors.success, ...theme.typography.label },
  track: { height: 7, marginTop: theme.spacing.md, borderRadius: 4, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: theme.colors.success },
});

