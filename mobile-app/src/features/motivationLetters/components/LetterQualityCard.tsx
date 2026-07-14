import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { MotivationLetterV2 } from '../models/motivationLetter';

export function LetterQualityCard({ metadata }: { metadata: MotivationLetterV2 }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const score = metadata.personalizationScore;
  return <GlassCard><SectionHeader title="Qualite et personnalisation" subtitle="Controles effectues sur la version generee" />{score !== null && score !== undefined ? <View style={styles.scoreRow}><Text accessibilityLabel={`Score de personnalisation ${Math.round(score * 100)} sur 100`} style={styles.score}>{Math.round(score * 100)}%</Text><Text style={styles.scoreLabel}>Personnalisation</Text></View> : <Text style={styles.unavailable}>Score de personnalisation non disponible</Text>} {metadata.qualityChecks.length ? <View style={styles.checks}>{metadata.qualityChecks.map((check) => <View key={check.code} style={styles.check}><Ionicons color={check.passed ? theme.colors.success : theme.colors.warning} name={check.passed ? 'checkmark-circle' : 'alert-circle'} size={19} /><View style={styles.flex}><Text style={styles.checkLabel}>{check.label}</Text>{check.detail ? <Text style={styles.detail}>{check.detail}</Text> : null}</View></View>)}</View> : <Text style={styles.unavailable}>Controles qualite non disponibles</Text>}</GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  scoreRow: { marginTop: theme.spacing.lg, flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm },
  score: { color: theme.colors.primary, fontSize: 34, lineHeight: 40, fontWeight: '800' },
  scoreLabel: { color: theme.colors.textSecondary, ...theme.typography.label },
  checks: { marginTop: theme.spacing.lg, gap: theme.spacing.sm },
  check: { minHeight: 42, flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm, padding: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted },
  flex: { flex: 1, minWidth: 0 },
  checkLabel: { color: theme.colors.textPrimary, ...theme.typography.label },
  detail: { marginTop: 2, color: theme.colors.textMuted, ...theme.typography.caption },
  unavailable: { marginTop: theme.spacing.lg, color: theme.colors.textMuted, ...theme.typography.body },
});

