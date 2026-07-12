import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import type { SkillGapSimulationResult } from '../models/skillGapSimulation';
export function SkillGapSummaryCard({ result, onPress }: {
    result?: SkillGapSimulationResult;
    onPress: () => void;
}) {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    return <GlassCard accent style={styles.card}><View style={styles.header}><View style={styles.icon}><Ionicons color={theme.colors.emerald} name="trending-up-outline" size={22}/></View><View style={styles.copy}><Text style={styles.eyebrow}>Skill Gap Simulator</Text><Text style={styles.title}>{result ? 'Votre potentiel de progression' : 'Identifiez vos axes de progression'}</Text></View></View>{result ? <View style={styles.metrics}><Metric label="Actuel" value={result.currentScore === undefined ? 'N/A' : `${Math.round(result.currentScore)}%`}/><Metric label="Potentiel" value={result.potentialBestScore === undefined ? 'N/A' : `${Math.round(result.potentialBestScore)}%`}/><Metric label="Priorites" value={String(result.highImpactGaps.length)}/></View> : <Text style={styles.text}>Simulez les effets de competences acquises et demontrees, sans modifier votre matching actuel.</Text>}<GradientButton icon="analytics-outline" label={result ? 'Voir ma simulation' : 'Lancer le simulateur'} onPress={onPress} variant="secondary"/></GlassCard>;
}
function Metric({ label, value }: {
    label: string;
    value: string;
}) {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}
const createStyles = (theme: AppTheme) => StyleSheet.create({
    card: { gap: theme.spacing.lg },
    header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    icon: { width: 46, height: 46, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: `${theme.colors.emerald}16` },
    copy: { flex: 1, minWidth: 0, gap: 2 },
    eyebrow: { color: theme.colors.emerald, ...theme.typography.overline },
    title: { color: theme.colors.textPrimary, ...theme.typography.subheading },
    text: { color: theme.colors.textSecondary, ...theme.typography.body },
    metrics: { flexDirection: 'row', gap: theme.spacing.sm },
    metric: { flex: 1, minWidth: 0, padding: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted },
    metricValue: { color: theme.colors.textPrimary, ...theme.typography.subheading },
    metricLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
});
