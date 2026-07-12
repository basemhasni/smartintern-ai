import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { SkillImpact } from '../models/skillImpact';
export function HighImpactGapsCard({ items }: {
    items: SkillImpact[];
}) { const { theme } = useAppTheme(); const s = styles(theme); return <GlassCard><SectionHeader title="Competences a fort impact" subtitle="Priorites calculees par le simulateur"/>{items.length ? <View style={s.list}>{items.map(i => <View key={i.skill} style={s.item}><View style={s.row}><Text style={s.skill}>{i.skill}</Text>{i.priority ? <AppBadge label={i.priority} tone={i.priority === 'HIGH' ? 'danger' : 'warning'}/> : null}</View><View style={s.badges}>{i.gapType ? <AppBadge label={i.gapType} tone="neutral"/> : null}{i.currentEvidenceLevel ? <AppBadge label={`Preuve ${i.currentEvidenceLevel}`} tone={i.currentEvidenceLevel === 'MISSING' ? 'danger' : 'warning'}/> : null}{i.estimatedScoreGain !== undefined ? <AppBadge label={`+${i.estimatedScoreGain} pts estimes`} tone="info"/> : null}</View>{i.reason ? <Text style={s.reason}>{i.reason}</Text> : null}</View>)}</View> : <Text style={s.empty}>Aucun gap prioritaire n a ete identifie.</Text>}</GlassCard>; }
;
const styles = (t: AppTheme) => StyleSheet.create({ list: { marginTop: t.spacing.lg, gap: t.spacing.md }, item: { padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: t.colors.surfaceMuted, gap: t.spacing.sm }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: t.spacing.md }, skill: { flex: 1, color: t.colors.textPrimary, ...t.typography.label }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs }, reason: { color: t.colors.textSecondary, ...t.typography.caption }, empty: { marginTop: t.spacing.lg, color: t.colors.textMuted, ...t.typography.body } });
