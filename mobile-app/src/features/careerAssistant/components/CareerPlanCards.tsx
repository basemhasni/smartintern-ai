import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { CareerProject, CareerRagSource, InterviewPreparationTip, LearningRoadmapStep } from '../models/careerAdvice';

export function LearningRoadmapTimeline({ items }: { items: LearningRoadmapStep[] }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  return <GlassCard><SectionHeader title="Feuille de route" subtitle="Etapes retournees par Career Assistant V2" /><View style={styles.list}>{items.map((item, index) => <View key={`${item.period}-${index}`} style={styles.timeline}><View style={styles.marker}><Text style={styles.markerText}>{index + 1}</Text></View><View style={styles.flex}>{item.period ? <Text style={styles.eyebrow}>{item.period}</Text> : null}{item.objective ? <Text style={styles.title}>{item.objective}</Text> : null}{item.targetSkills.length ? <View style={styles.badges}>{item.targetSkills.map((skill) => <AppBadge key={skill} label={skill} tone="info" />)}</View> : null}{item.actions.map((action) => <Text key={action} style={styles.text}>• {action}</Text>)}{item.expectedOutcome ? <Text style={styles.outcome}>{item.expectedOutcome}</Text> : null}</View></View>)}</View></GlassCard>;
}

export function CvImprovementCard({ tips }: { tips: string[] }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  return <GlassCard><SectionHeader title="Ameliorer mon CV" /><View style={styles.list}>{tips.map((tip) => <View key={tip} style={styles.inline}><Ionicons color={theme.colors.primary} name="document-text-outline" size={18} /><Text style={styles.flexText}>{tip}</Text></View>)}</View><Text style={styles.warning}>Les ameliorations doivent rester fideles a votre experience reelle.</Text></GlassCard>;
}

export function CareerProjectsCard({ projects }: { projects: CareerProject[] }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  return <GlassCard><SectionHeader title="Projets recommandes" subtitle="Preuves pratiques suggerees pour cette offre" /><View style={styles.list}>{projects.map((project, index) => <View key={`${project.title}-${index}`} style={styles.item}><Text style={styles.title}>{project.title}</Text><View style={styles.badges}>{project.difficulty ? <AppBadge label={project.difficulty} tone="violet" /> : null}{project.estimatedTime ? <AppBadge label={project.estimatedTime} tone="neutral" /> : null}</View>{project.description ? <Text style={styles.text}>{project.description}</Text> : null}{project.skillsCovered.length ? <View style={styles.badges}>{project.skillsCovered.map((skill) => <AppBadge key={skill} label={skill} tone="success" />)}</View> : null}{project.deliverables.length ? <Text style={styles.text}>Livrables: {project.deliverables.join(', ')}</Text> : null}{project.portfolioValue ? <Text style={styles.outcome}>{project.portfolioValue}</Text> : null}</View>)}</View></GlassCard>;
}

export function InterviewPreparationCard({ tips }: { tips: InterviewPreparationTip[] }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  return <GlassCard><SectionHeader title="Preparation entretien" /><View style={styles.list}>{tips.map((tip, index) => <View key={`${tip.topic}-${index}`} style={styles.item}>{tip.topic ? <Text style={styles.title}>{tip.topic}</Text> : null}{tip.tip ? <Text style={styles.text}>{tip.tip}</Text> : null}{tip.basedOn ? <Text style={styles.outcome}>Base sur: {tip.basedOn}</Text> : null}</View>)}</View></GlassCard>;
}

export function CareerSourcesCard({ sources }: { sources: CareerRagSource[] }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  return <GlassCard><SectionHeader title="Sources utilisees" /><View style={styles.list}>{sources.map((source, index) => <View key={`${source.title}-${index}`} style={styles.item}><Text style={styles.title}>{source.title}</Text>{source.sourceType || source.ownerType ? <AppBadge label={source.sourceType ?? source.ownerType ?? 'Document'} tone="neutral" /> : null}{source.snippet ? <Text numberOfLines={4} style={styles.text}>{source.snippet}</Text> : null}</View>)}</View></GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  list: { marginTop: theme.spacing.lg, gap: theme.spacing.md }, timeline: { flexDirection: 'row', gap: theme.spacing.md }, marker: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }, markerText: { color: theme.colors.white, ...theme.typography.label }, flex: { flex: 1, minWidth: 0, gap: theme.spacing.xs }, flexText: { flex: 1, color: theme.colors.textSecondary, ...theme.typography.caption }, eyebrow: { color: theme.colors.primary, ...theme.typography.overline }, title: { color: theme.colors.textPrimary, ...theme.typography.label }, text: { color: theme.colors.textSecondary, ...theme.typography.caption }, outcome: { color: theme.colors.emerald, ...theme.typography.caption }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }, inline: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }, item: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, gap: theme.spacing.sm }, warning: { marginTop: theme.spacing.lg, color: theme.colors.warning, ...theme.typography.caption, fontWeight: '700' },
});
