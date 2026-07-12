import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge, type BadgeTone } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { CareerPriority } from '../models/careerAdvice';

export function PriorityFocusCard({ items }: { items: CareerPriority[] }) {
  return <PriorityList title="Priorites principales" subtitle="Ordre determine par Career Assistant V2" items={items} />;
}

export function CriticalGapsCard({ items }: { items: CareerPriority[] }) {
  return <PriorityList title="Competences critiques" subtitle="Ecarts critiques detectes dans le matching" items={items} critical />;
}

function PriorityList({ title, subtitle, items, critical }: { title: string; subtitle: string; items: CareerPriority[]; critical?: boolean }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <GlassCard><SectionHeader title={title} subtitle={subtitle} /><View style={styles.list}>{items.map((item, index) => <View key={`${item.skill}-${index}`} style={styles.item}><View style={styles.row}><Text style={styles.skill}>{item.skill ?? 'Competence non renseignee'}</Text>{item.priority ? <AppBadge label={item.priority} tone={priorityTone(item.priority, critical)} /> : null}</View><View style={styles.badges}>{item.gapType ? <AppBadge label={item.gapType} tone={item.gapType === 'CRITICAL' || item.gapType === 'MISSING' ? 'danger' : 'warning'} /> : null}{item.currentEvidence.length ? <AppBadge label={`${item.currentEvidence.length} preuve(s)`} tone="neutral" /> : null}</View>{item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}{item.impactOnMatching ? <Text style={styles.impact}>{item.impactOnMatching}</Text> : null}{item.suggestedActions.map((action) => <Text key={action} style={styles.action}>• {action}</Text>)}</View>)}</View></GlassCard>;
}

const priorityTone = (priority: string, critical?: boolean): BadgeTone => critical || priority === 'HIGH' ? 'danger' : priority === 'MEDIUM' ? 'warning' : 'neutral';
const createStyles = (theme: AppTheme) => StyleSheet.create({
  list: { marginTop: theme.spacing.lg, gap: theme.spacing.md },
  item: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, gap: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md },
  skill: { flex: 1, color: theme.colors.textPrimary, ...theme.typography.label },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  reason: { color: theme.colors.textSecondary, ...theme.typography.caption },
  impact: { color: theme.colors.primary, ...theme.typography.caption, fontWeight: '700' },
  action: { color: theme.colors.textMuted, ...theme.typography.caption },
});
