import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';

const applications = [
  { company: 'Nexa Labs', role: 'Frontend Engineer', date: '12 juin', status: 'Entretien', tone: 'success' as const },
  { company: 'DataPulse', role: 'AI Software Engineer', date: '8 juin', status: 'En étude', tone: 'warning' as const },
  { company: 'CloudNova', role: 'DevOps & Cloud', date: '2 juin', status: 'Envoyée', tone: 'info' as const },
];

export function ApplicationsScreen() {
  // TODO Step 4: connect applications API.
  return (
    <Screen title="Mes candidatures" subtitle="Un suivi clair de chaque opportunité.">
      <View style={styles.summary}>
        <GlassCard style={styles.stat}><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>Actives</Text></GlassCard>
        <GlassCard style={styles.stat}><Text style={styles.statValue}>1</Text><Text style={styles.statLabel}>Entretien</Text></GlassCard>
        <GlassCard style={styles.stat}><Text style={styles.statValue}>67%</Text><Text style={styles.statLabel}>Réponse</Text></GlassCard>
      </View>
      {applications.map((item) => (
        <GlassCard key={item.company} style={styles.application}>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.role}>{item.role}</Text>
              <Text style={styles.company}>{item.company} · {item.date}</Text>
            </View>
            <AppBadge label={item.status} tone={item.tone} />
          </View>
          <View style={styles.track}><View style={[styles.progress, { width: item.status === 'Entretien' ? '82%' : item.status === 'En étude' ? '58%' : '32%' }]} /></View>
        </GlassCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: theme.spacing.sm },
  stat: { flex: 1, alignItems: 'center', padding: theme.spacing.md },
  statValue: { color: theme.colors.cyan, fontSize: 22, lineHeight: 28, fontWeight: '800' },
  statLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  application: { gap: theme.spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.sm },
  copy: { flex: 1, gap: theme.spacing.xs },
  role: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  company: { color: theme.colors.textSecondary, ...theme.typography.caption },
  track: { height: 5, borderRadius: 3, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 3, backgroundColor: theme.colors.cyan },
});
