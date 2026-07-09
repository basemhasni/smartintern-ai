import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';

const insights = [
  { icon: 'analytics-outline', title: 'Matching Score', text: 'Mesurez votre compatibilité avec chaque offre.', status: '82/100' },
  { icon: 'git-network-outline', title: 'Career Signal Map', text: 'Visualisez vos domaines de force professionnels.', status: 'Bientôt' },
  { icon: 'shield-checkmark-outline', title: 'Skill Evidence', text: 'Reliez chaque compétence à une preuve concrète.', status: 'Bientôt' },
  { icon: 'list-outline', title: 'Decision Trace', text: 'Comprenez les facteurs derrière chaque recommandation.', status: 'Bientôt' },
  { icon: 'flask-outline', title: 'Skill Gap Simulator', text: 'Simulez l’impact d’une nouvelle compétence.', status: 'Bientôt' },
] as const;

export function AiInsightsScreen() {
  // TODO Step 5: connect AI insights API.
  return (
    <Screen title="Career Intelligence" subtitle="Des signaux explicables pour guider vos prochaines décisions.">
      <GlassCard accent style={styles.featured}>
        <View style={styles.featuredIcon}><Ionicons color={theme.colors.white} name="sparkles" size={28} /></View>
        <View style={styles.copy}><Text style={styles.featuredTitle}>Votre potentiel, décodé</Text><Text style={styles.text}>Les modules IA sont présentés ici en mode aperçu. Aucun calcul réel n’est lancé.</Text></View>
      </GlassCard>
      {insights.map((item) => (
        <GlassCard key={item.title} style={styles.card}>
          <View style={styles.icon}><Ionicons color={theme.colors.cyan} name={item.icon} size={23} /></View>
          <View style={styles.copy}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
          <AppBadge label={item.status} tone={item.status === '82/100' ? 'success' : 'violet'} />
        </GlassCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  featured: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
  featuredIcon: { width: 54, height: 54, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.violet },
  featuredTitle: { color: theme.colors.textPrimary, ...theme.typography.heading },
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  icon: { width: 42, height: 42, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,211,238,0.10)' },
  copy: { flex: 1, gap: theme.spacing.xs },
  title: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  text: { color: theme.colors.textSecondary, ...theme.typography.caption },
});
