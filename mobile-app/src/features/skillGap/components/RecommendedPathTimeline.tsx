import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { RecommendedPathStep } from '../models/recommendedPathStep';
export function RecommendedPathTimeline({ steps }: {
    steps: RecommendedPathStep[];
}) {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    return <GlassCard><SectionHeader title="Parcours recommande" subtitle="Un ordre de progression calcule selon votre impact attendu"/>{steps.length ? <View style={styles.list}>{steps.map((step, index) => <View key={`${step.skill}-${index}`} style={styles.step}><View style={styles.marker}><Text style={styles.markerText}>{step.order ?? index + 1}</Text></View><View style={styles.content}><Text style={styles.skill}>{step.skill ?? 'Etape de progression'}</Text>{step.whyFirst ? <Text style={styles.text}>{step.whyFirst}</Text> : null}{step.recommendedEvidence ? <View style={styles.evidence}><Ionicons color={theme.colors.emerald} name="checkmark-circle-outline" size={17}/><Text style={styles.evidenceText}>{step.recommendedEvidence}</Text></View> : null}{step.expectedGain !== undefined ? <Text style={styles.gain}>Gain estime: +{step.expectedGain} pts</Text> : null}</View></View>)}</View> : <Text style={styles.empty}>Aucun parcours detaille disponible.</Text>}</GlassCard>;
}
const createStyles = (theme: AppTheme) => StyleSheet.create({
    list: { marginTop: theme.spacing.lg, gap: theme.spacing.lg },
    step: { flexDirection: 'row', gap: theme.spacing.md },
    marker: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary },
    markerText: { color: theme.colors.white, ...theme.typography.label },
    content: { flex: 1, minWidth: 0, gap: theme.spacing.xs, paddingBottom: theme.spacing.sm },
    skill: { color: theme.colors.textPrimary, ...theme.typography.subheading },
    text: { color: theme.colors.textSecondary, ...theme.typography.caption },
    evidence: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.xs, marginTop: theme.spacing.xs },
    evidenceText: { flex: 1, color: theme.colors.emerald, ...theme.typography.caption },
    gain: { color: theme.colors.primary, ...theme.typography.caption, fontWeight: '700' },
    empty: { marginTop: theme.spacing.lg, color: theme.colors.textMuted, ...theme.typography.body },
});
