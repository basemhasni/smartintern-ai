import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StudentTabParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { getUserDisplayName, getUserInitials } from '@/features/auth/models/userModel';
import { useAuth } from '@/features/auth/state/AuthContext';
import { AppBadge } from '@/shared/components/AppBadge';
import { OfferCard } from '@/shared/components/OfferCard';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';

type Props = BottomTabScreenProps<StudentTabParamList, 'StudentHome'>;
const shortcuts = [
  { icon: 'briefcase-outline', label: 'Explorer', hint: 'Offres', route: 'Offers' },
  { icon: 'documents-outline', label: 'Suivre', hint: 'Candidatures', route: 'Applications' },
  { icon: 'sparkles-outline', label: 'Comprendre', hint: 'Insights IA', route: 'AiInsights' },
] as const;

export function ConnectedStudentHomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const displayName = getUserDisplayName(user);

  return (
    <Screen eyebrow="Votre espace" title={`Bonjour, ${displayName}`} subtitle="Voici les signaux utiles pour faire avancer votre recherche aujourd’hui." rightAccessory={<Pressable accessibilityLabel="Ouvrir le profil" onPress={() => navigation.navigate('Profile')} style={styles.avatar}><Text style={styles.avatarText}>{getUserInitials(user)}</Text></Pressable>}>
      <LinearGradient colors={theme.gradients.premium} style={styles.scoreCard}>
        <View style={styles.scoreTop}><AppBadge icon="sparkles" label="Score de préparation" tone="success" /><View style={styles.trend}><Ionicons color="#6EE7B7" name="trending-up" size={16} /><Text style={styles.trendText}>+6 ce mois</Text></View></View>
        <View style={styles.scoreRow}><View><Text style={styles.score}>82<Text style={styles.scoreUnit}>/100</Text></Text><Text style={styles.scoreCopy}>Votre profil est prêt à être remarqué.</Text></View><View style={styles.ring}><Ionicons color={theme.colors.white} name="checkmark" size={25} /></View></View>
        <View style={styles.nextStep}><View style={styles.nextIcon}><Ionicons color={theme.colors.white} name="document-text-outline" size={17} /></View><Text style={styles.nextText}>Prochaine action : enrichir vos preuves de compétences</Text><Ionicons color="rgba(255,255,255,0.7)" name="chevron-forward" size={17} /></View>
      </LinearGradient>

      <SectionHeader title="Accès rapides" subtitle="Les actions les plus utiles" />
      <View style={styles.shortcuts}>{shortcuts.map((item) => <Pressable accessibilityRole="button" key={item.label} onPress={() => navigation.navigate(item.route)} style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}><View style={styles.shortcutIcon}><Ionicons color={theme.colors.primary} name={item.icon} size={22} /></View><Text style={styles.shortcutLabel}>{item.label}</Text><Text style={styles.shortcutHint}>{item.hint}</Text></Pressable>)}</View>

      <SectionHeader action="Tout voir" onPress={() => navigation.navigate('Offers')} title="Sélection pour vous" subtitle="Basée sur votre profil actuel" />
      <OfferCard company="Nexa Labs" location="Tunis · Hybride" match={94} skills={['React', 'TypeScript']} title="Stage Frontend Engineer" onPress={() => navigation.navigate('Offers')} />
      <OfferCard company="DataPulse" location="Ariana · Sur site" match={88} skills={['Python', 'FastAPI']} title="Stage AI Software Engineer" onPress={() => navigation.navigate('Offers')} />
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  avatar: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryStrong, ...theme.shadowSmall },
  avatarText: { color: theme.colors.white, ...theme.typography.label, fontWeight: '800' },
  scoreCard: { borderRadius: theme.radius.xl, padding: theme.spacing.xl, gap: theme.spacing.xl, overflow: 'hidden', ...theme.shadow },
  scoreTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trendText: { color: '#A7F3D0', ...theme.typography.caption },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.lg },
  score: { color: theme.colors.white, fontSize: 46, lineHeight: 52, fontWeight: '800', letterSpacing: 0 },
  scoreUnit: { color: 'rgba(255,255,255,0.58)', fontSize: 17, lineHeight: 23 },
  scoreCopy: { color: 'rgba(255,255,255,0.78)', ...theme.typography.caption },
  ring: { width: 58, height: 58, borderRadius: 29, borderWidth: 6, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)' },
  nextStep: { minHeight: 46, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: 'rgba(255,255,255,0.10)' },
  nextIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)' },
  nextText: { flex: 1, color: 'rgba(255,255,255,0.88)', ...theme.typography.caption },
  shortcuts: { flexDirection: 'row', gap: theme.spacing.sm },
  shortcut: { flex: 1, minWidth: 0, minHeight: 112, borderRadius: theme.radius.lg, padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, gap: 4, ...theme.shadowSmall },
  shortcutIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, marginBottom: 4 },
  shortcutLabel: { color: theme.colors.textPrimary, ...theme.typography.label },
  shortcutHint: { color: theme.colors.textMuted, ...theme.typography.caption },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
