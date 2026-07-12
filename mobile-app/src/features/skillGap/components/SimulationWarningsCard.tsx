import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { ScoreCap } from '../models/skillSimulation';
export function SimulationWarningsCard({ warnings, assumptions, caps }: {
    warnings: string[];
    assumptions: string[];
    caps: ScoreCap[];
}) {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    const capReasons = caps.map((cap) => cap.reason).filter((reason): reason is string => Boolean(reason));
    return <GlassCard><SectionHeader title="Limites de la simulation"/><View style={styles.list}><Text style={styles.disclaimer}>Cette simulation est un outil pedagogique. Elle ne garantit pas une candidature, un recrutement ou un score futur.</Text>{warnings.map((item, index) => <Text key={`warning-${index}`} style={styles.warning}>• {item}</Text>)}{assumptions.map((item, index) => <Text key={`assumption-${index}`} style={styles.text}>Hypothese: {item}</Text>)}{capReasons.map((item, index) => <Text key={`cap-${index}`} style={styles.text}>Limite appliquee: {item}</Text>)}</View></GlassCard>;
}
const createStyles = (theme: AppTheme) => StyleSheet.create({
    list: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    disclaimer: { color: theme.colors.warning, ...theme.typography.caption, fontWeight: '700' },
    warning: { color: theme.colors.textSecondary, ...theme.typography.caption },
    text: { color: theme.colors.textMuted, ...theme.typography.caption },
});
