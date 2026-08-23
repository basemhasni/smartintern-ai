import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList, StudentTabParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { getUserDisplayName, getUserInitials } from '@/features/auth/models/userModel';
import { useAuth } from '@/features/auth/state/AuthContext';
import { OfferCard } from '@/features/offers/components/OfferCard';
import { useOffers } from '@/features/offers/state/OffersContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { AppBadge } from '@/shared/components/AppBadge';
import { ErrorState } from '@/shared/components/ErrorState';
import { GlassCard } from '@/shared/components/GlassCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { GradientButton } from '@/shared/components/GradientButton';

type Props = Readonly<BottomTabScreenProps<StudentTabParamList, 'StudentHome'>>;

const shortcuts = [
  { icon: 'briefcase-outline', label: 'Offres', route: 'Offers' },
  { icon: 'documents-outline', label: 'Candidatures', route: 'Applications' },
  { icon: 'sparkles-outline', label: 'Insights IA', route: 'AiInsights' },
  { icon: 'person-outline', label: 'Profil et CV', route: 'Profile' },
] as const;

const cvStatusCopy = {
  ABSENT: 'CV absent',
  UPLOADED: 'CV importé',
  ANALYZED: 'CV analysé',
  ANALYSIS_FAILED: 'Analyse CV à relancer',
} as const;

export function ConnectedStudentHomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const {
    profile,
    latestCv,
    profileCompletion,
    activeApplicationCount,
    isLoading: isProfileLoading,
    isRefreshing: isProfileRefreshing,
    error: profileError,
    refresh: refreshProfile,
  } = useStudentDashboard();
  const {
    offers,
    recommendedOffers,
    recommendationsMessage,
    isLoading: areOffersLoading,
    isRefreshing: areOffersRefreshing,
    error: offersError,
    refresh: refreshOffers,
  } = useOffers();

  const displayUser = profile?.user ?? user;
  const firstName = displayUser?.firstName || getUserDisplayName(displayUser ?? null);
  const featuredOffers = (recommendedOffers.length ? recommendedOffers : offers).slice(0, 3);
  const isLoading = isProfileLoading || areOffersLoading;
  const isRefreshing = isProfileRefreshing || areOffersRefreshing;
  const refresh = async () => {
    await Promise.all([refreshProfile(), refreshOffers()]);
  };

  if (isLoading && !profile && !offers.length) {
    return <Screen><LoadingState label="Chargement de votre espace étudiant..." /></Screen>;
  }

  if (profileError && offersError) {
    return <Screen><ErrorState message={profileError} onRetry={() => void refresh()} /></Screen>;
  }

  return (
    <Screen
      eyebrow="Votre espace"
      refreshControl={<RefreshControl refreshing={isRefreshing} tintColor={theme.colors.primary} onRefresh={() => void refresh()} />}
      rightAccessory={(
        <Pressable accessibilityLabel="Ouvrir le profil" onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>{getUserInitials(displayUser ?? null)}</Text>
        </Pressable>
      )}
      subtitle="Vos informations et opportunités, mises à jour depuis SmartIntern AI."
      title={`Bonjour, ${firstName}`}
    >
      {!profile ? (
        <GlassCard accent style={styles.infoCard}>
          <View style={styles.infoIcon}><Ionicons color={theme.colors.primary} name="person-add-outline" size={23} /></View>
          <View style={styles.flexCopy}>
            <Text style={styles.infoTitle}>Profil étudiant introuvable</Text>
            <Text style={styles.infoText}>Complétez votre profil sur la plateforme pour personnaliser votre expérience mobile.</Text>
          </View>
        </GlassCard>
      ) : (
        <GlassCard accent style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.profileCopy}>
              <Text style={styles.profileEyebrow}>PROFIL ÉTUDIANT</Text>
              <Text numberOfLines={1} style={styles.profileTitle}>{profile.targetJob || 'Objectif professionnel non renseigné'}</Text>
              <Text numberOfLines={1} style={styles.profileMeta}>{profile.educationLevel || 'Formation non renseignée'}{profile.location ? ` · ${profile.location}` : ''}</Text>
            </View>
            <AppBadge
              icon={latestCv?.status === 'ANALYZED' ? 'checkmark-circle' : 'document-outline'}
              label={latestCv ? cvStatusCopy[latestCv.status] : cvStatusCopy.ABSENT}
              tone={latestCv?.status === 'ANALYZED' ? 'success' : 'warning'}
            />
          </View>
          <View style={styles.profileIndicators}>
            <View style={styles.profileIndicator}>
              <Text style={styles.indicatorValue}>{latestCv?.skills.length ?? 0}</Text>
              <Text style={styles.indicatorLabel}>Compétences CV</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileIndicator}>
              <Text style={styles.indicatorValue}>{profileCompletion.completed}/{profileCompletion.total}</Text>
              <Text style={styles.indicatorLabel}>Champs complétés</Text>
            </View>
          </View>
          <View style={styles.completionHeader}>
            <Text style={styles.completionLabel}>Complétion indicative du profil</Text>
            <Text style={styles.completionValue}>{profileCompletion.percentage}%</Text>
          </View>
          <View style={styles.completionTrack}>
            <View style={[styles.completionProgress, { width: `${profileCompletion.percentage}%` }]} />
          </View>
        </GlassCard>
      )}

      {(profileCompletion.percentage < 100 || !latestCv || recommendationsMessage) ? (
        <GlassCard variant="soft" style={styles.profilePrompt}>
          <Ionicons color={theme.colors.warning} name="information-circle-outline" size={23} />
          <View style={styles.flexCopy}>
            <Text style={styles.promptTitle}>Améliorez vos recommandations</Text>
            <Text style={styles.promptText}>{recommendationsMessage || 'Complétez les informations manquantes et ajoutez un CV analysé pour obtenir des scores plus pertinents.'}</Text>
          </View>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.promptAction}>Voir</Text>
          </Pressable>
        </GlassCard>
      ) : null}

      {!latestCv ? <GradientButton icon="document-text-outline" label="Ajouter mon CV" onPress={() => rootNavigation?.navigate('CvManagement')} /> : null}

      <SectionHeader title="Vue d’ensemble" subtitle="Données disponibles actuellement" />
      <View style={styles.stats}>
        <GlassCard style={styles.stat}>
          <Ionicons color={theme.colors.primary} name="briefcase-outline" size={19} />
          <Text style={styles.statValue}>{offers.length}</Text>
          <Text style={styles.statLabel}>Offres publiées</Text>
        </GlassCard>
        <GlassCard style={styles.stat}>
          <Ionicons color={theme.colors.emerald} name="sparkles-outline" size={19} />
          <Text style={styles.statValue}>{recommendedOffers.length}</Text>
          <Text style={styles.statLabel}>Analysées</Text>
        </GlassCard>
        <GlassCard style={styles.stat}>
          <Ionicons color={theme.colors.info} name="documents-outline" size={19} />
          <Text style={styles.statValue}>{activeApplicationCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Actives</Text>
        </GlassCard>
      </View>

      <SectionHeader title="Accès rapides" />
      <View style={styles.shortcuts}>
        {shortcuts.map((item) => (
          <Pressable accessibilityRole="button" key={item.label} onPress={() => navigation.navigate(item.route)} style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}>
            <View style={styles.shortcutIcon}><Ionicons color={theme.colors.primary} name={item.icon} size={22} /></View>
            <Text numberOfLines={2} style={styles.shortcutLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader
        action="Voir toutes"
        onPress={() => navigation.navigate('Offers')}
        subtitle={recommendedOffers.length ? 'Classées par le backend' : 'Dernières offres publiées'}
        title={recommendedOffers.length ? 'Meilleures offres' : 'Offres disponibles'}
      />
      {featuredOffers.length ? featuredOffers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onPress={() => rootNavigation?.navigate('OfferDetail', { offerId: offer.id })}
          variant="compact"
        />
      )) : (
        <GlassCard variant="soft" style={styles.emptyOffers}>
          <Ionicons color={theme.colors.textMuted} name="briefcase-outline" size={26} />
          <Text style={styles.emptyTitle}>Aucune offre publiée</Text>
          <Text style={styles.emptyText}>Les nouvelles opportunités apparaîtront ici dès leur publication.</Text>
        </GlassCard>
      )}
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  avatar: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryStrong, ...theme.shadowSmall },
  avatarText: { color: theme.colors.white, ...theme.typography.label, fontWeight: '800' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  infoIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  flexCopy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  infoTitle: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  infoText: { color: theme.colors.textSecondary, ...theme.typography.caption },
  profileCard: { gap: theme.spacing.lg },
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md },
  profileCopy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  profileEyebrow: { color: theme.colors.primary, ...theme.typography.overline },
  profileTitle: { color: theme.colors.textPrimary, ...theme.typography.heading },
  profileMeta: { color: theme.colors.textSecondary, ...theme.typography.caption },
  profileIndicators: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted },
  profileIndicator: { flex: 1, alignItems: 'center', gap: 2 },
  profileDivider: { width: 1, height: 34, backgroundColor: theme.colors.border },
  indicatorValue: { color: theme.colors.textPrimary, fontSize: 20, lineHeight: 25, fontWeight: '800' },
  indicatorLabel: { color: theme.colors.textMuted, ...theme.typography.caption, textAlign: 'center' },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md },
  completionLabel: { color: theme.colors.textSecondary, ...theme.typography.caption },
  completionValue: { color: theme.colors.emerald, ...theme.typography.caption, fontWeight: '700' },
  completionTrack: { height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: theme.colors.surfaceMuted },
  completionProgress: { height: '100%', borderRadius: 3, backgroundColor: theme.colors.emerald },
  profilePrompt: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  promptTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  promptText: { color: theme.colors.textSecondary, ...theme.typography.caption },
  promptAction: { color: theme.colors.primary, ...theme.typography.label },
  stats: { flexDirection: 'row', gap: theme.spacing.sm },
  stat: { flex: 1, minWidth: 0, padding: theme.spacing.md, alignItems: 'center', gap: 3 },
  statValue: { color: theme.colors.textPrimary, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  statLabel: { color: theme.colors.textMuted, ...theme.typography.caption, textAlign: 'center' },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  shortcut: { width: '48%', flexGrow: 1, minHeight: 78, borderRadius: theme.radius.lg, padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, ...theme.shadowSmall },
  shortcutIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  shortcutLabel: { flex: 1, color: theme.colors.textPrimary, ...theme.typography.label },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  emptyOffers: { minHeight: 170, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
  emptyTitle: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  emptyText: { maxWidth: 330, color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
});
