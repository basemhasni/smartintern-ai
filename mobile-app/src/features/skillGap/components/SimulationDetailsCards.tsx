import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { CombinationSimulation, SingleSkillSimulation } from '../models/skillSimulation';
export function SingleSkillSimulationsCard({ items }: {
    items: SingleSkillSimulation[];
}) {
    return (<SimulationList title="Simulations par competence" empty="Aucune simulation individuelle disponible.">
      {items.map((item) => (<SimulationItem key={item.skill} title={item.skill} before={item.beforeScore} after={item.afterScore} gain={item.gain} text={item.impactExplanation ?? item.assumption} capped={item.scoreCapsApplied.length > 0}/>))}
    </SimulationList>);
}
export function CombinationSimulationsCard({ items }: {
    items: CombinationSimulation[];
}) {
    return (<SimulationList title="Combinaisons recommandees" empty="Aucune combinaison retournee.">
      {items.map((item, index) => (<SimulationItem key={`${item.skills.join('-')}-${index}`} title={item.skills.join(' + ')} before={item.beforeScore} after={item.afterScore} gain={item.gain} text={item.reason} capped={item.scoreCapsApplied.length > 0}/>))}
    </SimulationList>);
}
function SimulationList({ title, empty, children }: {
    title: string;
    empty: string;
    children: ReactNode;
}) {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
    return <GlassCard><SectionHeader title={title}/>{hasChildren ? <View style={styles.list}>{children}</View> : <Text style={styles.empty}>{empty}</Text>}</GlassCard>;
}
function formatScore(value?: number) {
    return value === undefined ? 'N/A' : `${Math.round(value)}%`;
}
function SimulationItem({ title, before, after, gain, text, capped }: {
    title: string;
    before?: number;
    after?: number;
    gain?: number;
    text?: string | null;
    capped: boolean;
}) {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    return <View style={styles.item}><View style={styles.row}><Text style={styles.title}>{title}</Text>{gain !== undefined ? <AppBadge label={`+${gain} pts`} tone="success"/> : null}</View><Text style={styles.scores}>{formatScore(before)} vers {formatScore(after)}</Text>{text ? <Text style={styles.text}>{text}</Text> : null}{capped ? <Text style={styles.cap}>Le score reste limite par plusieurs criteres essentiels.</Text> : null}</View>;
}
const createStyles = (theme: AppTheme) => StyleSheet.create({
    list: { marginTop: theme.spacing.lg, gap: theme.spacing.md },
    item: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, gap: theme.spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md },
    title: { flex: 1, color: theme.colors.textPrimary, ...theme.typography.label },
    scores: { color: theme.colors.primary, ...theme.typography.subheading },
    text: { color: theme.colors.textSecondary, ...theme.typography.caption },
    cap: { color: theme.colors.warning, ...theme.typography.caption },
    empty: { marginTop: theme.spacing.lg, color: theme.colors.textMuted, ...theme.typography.body },
});
