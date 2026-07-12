import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { RecommendedProject } from '../models/recommendedProject';
export function RecommendedProjectsCard({ projects }: {
    projects: RecommendedProject[];
}) {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);
    return <GlassCard><SectionHeader title="Projets pour progresser" subtitle="Idees de preuves concretes a ajouter a votre profil"/>{projects.length ? <View style={styles.list}>{projects.map((project, index) => <View key={`${project.title}-${index}`} style={styles.project}><View style={styles.header}><View style={styles.icon}><Ionicons color={theme.colors.primary} name="code-working-outline" size={20}/></View><View style={styles.copy}><Text style={styles.title}>{project.title}</Text><View style={styles.meta}>{project.difficulty ? <AppBadge label={project.difficulty} tone="info"/> : null}{project.estimatedTime ? <AppBadge label={project.estimatedTime} tone="neutral"/> : null}</View></View></View>{project.description ? <Text style={styles.description}>{project.description}</Text> : null}{project.skillsCovered.length ? <View style={styles.skills}>{project.skillsCovered.map((skill) => <AppBadge key={skill} label={skill} tone="success"/>)}</View> : null}{project.deliverables.length ? <Text style={styles.deliverables}>Livrables: {project.deliverables.join(', ')}</Text> : null}</View>)}</View> : <Text style={styles.empty}>Aucun projet recommande disponible.</Text>}</GlassCard>;
}
const createStyles = (theme: AppTheme) => StyleSheet.create({
    list: { marginTop: theme.spacing.lg, gap: theme.spacing.md },
    project: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, gap: theme.spacing.sm },
    header: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-start' },
    icon: { width: 38, height: 38, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceStrong },
    copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
    title: { color: theme.colors.textPrimary, ...theme.typography.label },
    meta: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
    description: { color: theme.colors.textSecondary, ...theme.typography.caption },
    skills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
    deliverables: { color: theme.colors.textMuted, ...theme.typography.caption },
    empty: { marginTop: theme.spacing.lg, color: theme.colors.textMuted, ...theme.typography.body },
});
