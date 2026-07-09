import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';

import type { StudentTabParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { OfferCard } from '@/shared/components/OfferCard';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';

type Props = BottomTabScreenProps<StudentTabParamList, 'StudentHome'>;

const shortcuts = [
  { icon: 'briefcase-outline', label: 'Offres', route: 'Offers' },
  { icon: 'document-text-outline', label: 'Suivi', route: 'Applications' },
  { icon: 'sparkles-outline', label: 'Insights IA', route: 'AiInsights' },
] as const;

export function StudentHomeScreen({ navigation }: Props) {
  return (
    <Screen title="Bonjour, Lina" subtitle="Votre carrière prend forme, une décision à la fois.">
      <GlassCard accent style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.avatarText}>LM</Text></View>
        <View style={styles.profileText}>
          <Text style={styles.name}>Lina Mansour</Text>
          <Text style={styles.role}>Étudiante en génie logiciel</Text>
          <AppBadge label="Profil complété à 78%" tone="info" />
        </View>
      </GlassCard>

      <GlassCard style={styles.aiCard}>
        <View>
          <Text style={styles.eyebrow}>SCORE DE PRÉPARATION IA</Text>
          <Text style={styles.score}>82<Text style={styles.scoreUnit}>/100</Text></Text>
          <Text style={styles.muted}>Excellent potentiel pour les rôles frontend et full-stack.</Text>
        </View>
        <View style={styles.sparkle}><Ionicons color={theme.colors.cyan} name="sparkles" size={28} /></View>
      </GlassCard>

      <SectionHeader title="Accès rapides" />
      <View style={styles.shortcuts}>
        {shortcuts.map((item) => (
          <GlassCard key={item.label} style={styles.shortcut}>
            <Ionicons color={theme.colors.cyan} name={item.icon} size={23} />
            <Text onPress={() => navigation.navigate(item.route)} style={styles.shortcutLabel}>{item.label}</Text>
          </GlassCard>
        ))}
      </View>

      <SectionHeader action="Tout voir" onPress={() => navigation.navigate('Offers')} title="Offres pour vous" />
      <OfferCard company="Nexa Labs" location="Tunis · Hybride" match={94} skills={['React', 'TypeScript']} title="Stage Frontend Engineer" />
      <OfferCard company="DataPulse" location="Ariana · Sur site" match={88} skills={['Python', 'FastAPI']} title="Stage AI Software Engineer" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.violet },
  avatarText: { color: theme.colors.white, ...theme.typography.subheading },
  profileText: { flex: 1, gap: theme.spacing.xs },
  name: { color: theme.colors.textPrimary, ...theme.typography.heading },
  role: { color: theme.colors.textSecondary, ...theme.typography.caption },
  aiCard: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.lg },
  eyebrow: { color: theme.colors.cyan, ...theme.typography.caption, fontWeight: '800' },
  score: { color: theme.colors.textPrimary, fontSize: 38, lineHeight: 46, fontWeight: '800' },
  scoreUnit: { color: theme.colors.textMuted, fontSize: 16 },
  muted: { maxWidth: 260, color: theme.colors.textSecondary, ...theme.typography.caption },
  sparkle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,211,238,0.10)' },
  shortcuts: { flexDirection: 'row', gap: theme.spacing.sm },
  shortcut: { flex: 1, minHeight: 92, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, padding: theme.spacing.sm },
  shortcutLabel: { color: theme.colors.textPrimary, ...theme.typography.caption, textAlign: 'center' },
});
