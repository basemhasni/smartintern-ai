import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { readinessLabels } from '../config/careerIntentConfig';
import type { CareerAdviceResult } from '../models/careerAdvice';

export function ReadinessCard({ advice, generatedAt }: { advice: CareerAdviceResult; generatedAt?: string }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const readiness = advice.readinessLevel ? readinessLabels[advice.readinessLevel] ?? advice.readinessLevel : 'Niveau de preparation non disponible';
  return <LinearGradient colors={theme.gradients.premium} style={styles.card}><View style={styles.row}><View style={styles.copy}><Text style={styles.eyebrow}>Niveau de preparation</Text><Text style={styles.title}>{readiness}</Text></View>{advice.confidence ? <AppBadge label={`Confiance ${advice.confidence}`} tone="info" /> : null}</View>{advice.matchingScore !== undefined ? <Text style={styles.score}>Matching actuel: {Math.round(advice.matchingScore)}%</Text> : null}{advice.profileSummary ? <Text style={styles.summary}>{advice.profileSummary}</Text> : null}{advice.strengths.length ? <View style={styles.strengths}>{advice.strengths.slice(0, 3).map((item) => <AppBadge key={item} label={item} tone="success" />)}</View> : null}{generatedAt ? <Text style={styles.date}>Genere le {new Date(generatedAt).toLocaleString()}</Text> : null}</LinearGradient>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: { padding: theme.spacing.xl, borderRadius: theme.radius.xl, gap: theme.spacing.md, ...theme.shadow },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  eyebrow: { color: 'rgba(255,255,255,0.68)', ...theme.typography.overline },
  title: { color: theme.colors.white, ...theme.typography.heading },
  score: { color: theme.colors.white, fontSize: 25, lineHeight: 30, fontWeight: '800' },
  summary: { color: 'rgba(255,255,255,0.82)', ...theme.typography.body },
  strengths: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  date: { color: 'rgba(255,255,255,0.58)', ...theme.typography.caption },
});
