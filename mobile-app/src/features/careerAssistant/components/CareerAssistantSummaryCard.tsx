import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { readinessLabels } from '../config/careerIntentConfig';
import type { CareerAdviceResult } from '../models/careerAdvice';

export function CareerAssistantSummaryCard({ advice, onPress }: { advice?: CareerAdviceResult; onPress: () => void }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  return <GlassCard accent style={styles.card}><View style={styles.header}><View style={styles.icon}><Ionicons color={theme.colors.emerald} name="compass-outline" size={23} /></View><View style={styles.copy}><Text style={styles.eyebrow}>Career Assistant V2</Text><Text style={styles.title}>{advice?.readinessLevel ? readinessLabels[advice.readinessLevel] ?? advice.readinessLevel : 'Conseils personnalises pour cette offre'}</Text></View></View>{advice ? <View style={styles.metrics}><Metric label="Priorites" value={advice.priorityFocus.length} /><Metric label="Etapes" value={advice.learningRoadmap.length} /><Metric label="Projets" value={advice.recommendedProjects.length} /></View> : <Text style={styles.text}>Obtenez un plan fonde sur les preuves de votre CV et le matching actuel.</Text>}<GradientButton icon="compass-outline" label="Ouvrir l assistant carriere" onPress={onPress} variant="secondary" /></GlassCard>;
}

function Metric({ label, value }: { label: string; value: number }) { const { theme } = useAppTheme(); const styles = createStyles(theme); return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
const createStyles = (theme: AppTheme) => StyleSheet.create({ card: { gap: theme.spacing.lg }, header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }, icon: { width: 46, height: 46, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: `${theme.colors.emerald}16` }, copy: { flex: 1, minWidth: 0, gap: 2 }, eyebrow: { color: theme.colors.emerald, ...theme.typography.overline }, title: { color: theme.colors.textPrimary, ...theme.typography.subheading }, text: { color: theme.colors.textSecondary, ...theme.typography.body }, metrics: { flexDirection: 'row', gap: theme.spacing.sm }, metric: { flex: 1, minWidth: 0, padding: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted }, metricValue: { color: theme.colors.textPrimary, ...theme.typography.subheading }, metricLabel: { color: theme.colors.textMuted, ...theme.typography.caption } });
