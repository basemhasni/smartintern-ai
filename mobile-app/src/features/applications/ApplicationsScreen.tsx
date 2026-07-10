import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge, type BadgeTone } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';

const applications: { company: string; role: string; date: string; status: string; tone: BadgeTone; progress: number }[] = [
  { company: 'Nexa Labs', role: 'Frontend Engineer', date: '12 juin', status: 'Entretien', tone: 'success', progress: 82 },
  { company: 'DataPulse', role: 'AI Software Engineer', date: '8 juin', status: 'En étude', tone: 'warning', progress: 58 },
  { company: 'CloudNova', role: 'DevOps & Cloud', date: '2 juin', status: 'Envoyée', tone: 'info', progress: 32 },
];

export function ApplicationsScreen() {
  // TODO Step 4: connect applications API.
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <Screen eyebrow="Suivi" title="Mes candidatures" subtitle="Chaque étape, chaque réponse, au même endroit."><View style={styles.summary}>{[{ icon: 'paper-plane-outline', value: '3', label: 'Actives' }, { icon: 'calendar-outline', value: '1', label: 'Entretien' }, { icon: 'pulse-outline', value: '67%', label: 'Réponse' }].map((stat) => <GlassCard key={stat.label} style={styles.stat}><Ionicons color={theme.colors.primary} name={stat.icon as keyof typeof Ionicons.glyphMap} size={18} /><Text style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text></GlassCard>)}</View><Text style={styles.sectionTitle}>Activité récente</Text>{applications.map((item, index) => <GlassCard key={item.company} style={styles.application}><View style={styles.timeline}><View style={[styles.dot, { backgroundColor: index === 0 ? theme.colors.emerald : theme.colors.primary }]} />{index < applications.length - 1 ? <View style={styles.line} /> : null}</View><View style={styles.content}><View style={styles.row}><View style={styles.copy}><Text style={styles.role}>{item.role}</Text><Text style={styles.company}>{item.company} · {item.date}</Text></View><AppBadge label={item.status} tone={item.tone} /></View><View style={styles.track}><View style={[styles.progress, { width: `${item.progress}%` }]} /></View><Text style={styles.stage}>{item.progress >= 80 ? 'Prochaine étape : préparer votre entretien' : 'Votre candidature est en cours de traitement'}</Text></View></GlassCard>)}</Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  summary: { flexDirection: 'row', gap: theme.spacing.sm },
  stat: { flex: 1, minWidth: 0, alignItems: 'center', gap: 3, padding: theme.spacing.md },
  statValue: { color: theme.colors.textPrimary, fontSize: 22, lineHeight: 27, fontWeight: '800' },
  statLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  sectionTitle: { marginTop: theme.spacing.sm, color: theme.colors.textPrimary, ...theme.typography.heading },
  application: { flexDirection: 'row', gap: theme.spacing.md },
  timeline: { width: 14, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  line: { width: 2, flex: 1, marginTop: 6, backgroundColor: theme.colors.border },
  content: { flex: 1, gap: theme.spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.sm },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  role: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  company: { color: theme.colors.textSecondary, ...theme.typography.caption },
  track: { height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 3, backgroundColor: theme.colors.emerald },
  stage: { color: theme.colors.textMuted, ...theme.typography.caption },
});
