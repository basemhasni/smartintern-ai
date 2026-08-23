import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { ErrorState } from '@/shared/components/ErrorState';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { ApplyActionBar } from './components/ApplyActionBar';
import { OfferHeader } from './components/OfferHeader';
import { OfferMatchSummary } from './components/OfferMatchSummary';
import { SkillsSection } from './components/SkillsSection';
import { useOfferDetail } from './state/useOfferDetail';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'OfferDetail'>>;

export function OfferDetailScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const detail = useOfferDetail(route.params.offerId);

  if (detail.isLoading && !detail.offer) {
    return <Screen><LoadingState label="Chargement de l offre..." /></Screen>;
  }

  if (detail.error && !detail.offer) {
    return (
      <Screen>
        <IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} />
        <ErrorState message={detail.error} onRetry={() => void detail.refresh()} />
      </Screen>
    );
  }

  if (!detail.offer) return null;
  const offer = detail.offer;
  const applicationDisabledReason = !detail.isOfferAvailable
    ? 'Cette offre n est plus ouverte aux candidatures.'
    : null;

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={detail.isLoading} tintColor={theme.colors.primary} onRefresh={() => void detail.refresh()} />}
    >
      <View style={styles.toolbar}>
        <IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} />
        <Text style={styles.toolbarTitle}>Detail de l offre</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <OfferHeader offer={offer} />

      {detail.error ? <StatusMessage message={detail.error} tone="error" /> : null}

      <GlassCard>
        <SectionHeader title="Description" />
        <Text style={styles.description}>{offer.description || 'Description non renseignee par l entreprise.'}</Text>
      </GlassCard>

      <SkillsSection optional={offer.optionalSkills} required={offer.requiredSkills} />

      <GlassCard>
        <SectionHeader title="Informations complementaires" />
        <View style={styles.informationGrid}>
          <Information icon="business-outline" label="Entreprise" value={offer.company.companyName} />
          <Information icon="layers-outline" label="Secteur" value={offer.company.sector || 'Non renseigne'} />
          <Information icon="location-outline" label="Localisation" value={offer.location || 'Non renseignee'} />
          <Information icon="time-outline" label="Duree" value={offer.duration || 'Non renseignee'} />
        </View>
      </GlassCard>

      {!detail.profile || detail.profileCompletion.percentage < 100 ? (
        <StatusMessage message="Votre profil est incomplet. Vous pouvez postuler, mais le completer aidera l entreprise a mieux vous connaitre." tone="info" />
      ) : null}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}><Ionicons color={theme.colors.primary} name="sparkles" size={20} /></View>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>Compatibilite IA</Text>
          <Text style={styles.sectionSubtitle}>Analyse SmartIntern basee sur votre CV</Text>
        </View>
      </View>

      <OfferMatchSummary
        canAnalyze={detail.canAnalyze}
        error={detail.matchError}
        hasCv={Boolean(detail.latestCv)}
        isAnalyzing={detail.isAnalyzing}
        match={detail.match}
        onAnalyze={() => void detail.analyze()}
        onOpenProfile={() => navigation.navigate('StudentTabs', { screen: 'Profile' })}
      />

      {detail.match?.isAvailable ? (
        <View style={styles.aiActions}>
          <GradientButton icon="analytics-outline" label="Voir l analyse complete" onPress={() => navigation.navigate('StudentTabs', { screen: 'AiInsights', params: { offerId: offer.id } })} variant="secondary" />
          <GradientButton icon="trending-up-outline" label="Identifier mes axes de progression" onPress={() => navigation.navigate('SkillGapSimulator', { offerId: offer.id })} variant="secondary" />
          <GradientButton icon="compass-outline" label="Obtenir des conseils personnalises" onPress={() => navigation.navigate('CareerAssistant', { offerId: offer.id })} variant="secondary" />
        </View>
      ) : null}

      <GlassCard>
        <SectionHeader title="Lettre de motivation" subtitle="Generee a partir de votre CV, du matching et de cette offre" />
        {detail.existingApplication ? (
          <View style={styles.letterAction}>
            <StatusMessage message="La lettre sera enregistree et associee a votre candidature existante. Elle ne sera jamais envoyee automatiquement." tone="info" />
            <GradientButton icon="document-text-outline" label="Generer une lettre de motivation" onPress={() => navigation.navigate('MotivationLetterGenerator', { offerId: offer.id, applicationId: detail.existingApplication!.id })} />
          </View>
        ) : (
          <StatusMessage message="La generation devient disponible apres l envoi de votre candidature. Elle ne cree aucune candidature automatiquement." tone="info" />
        )}
      </GlassCard>

      <ApplyActionBar
        disabledReason={applicationDisabledReason}
        error={detail.applyError}
        existingApplication={detail.existingApplication}
        isApplying={detail.isApplying}
        isChecking={detail.isCheckingApplication}
        offerTitle={offer.title}
        onApply={detail.apply}
        success={detail.applySuccess}
      />

      {detail.existingApplication ? (
        <Text accessibilityRole="link" onPress={() => navigation.navigate('ApplicationDetail', { applicationId: detail.existingApplication!.id })} style={styles.applicationsLink}>
          Voir cette candidature
        </Text>
      ) : null}
    </Screen>
  );
}

function Information({ icon, label, value }: Readonly<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string }>) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.informationItem}>
      <Ionicons color={theme.colors.primary} name={icon} size={18} />
      <View style={styles.informationCopy}>
        <Text style={styles.informationLabel}>{label}</Text>
        <Text style={styles.informationValue}>{value}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  toolbarSpacer: { width: 44 },
  description: { marginTop: theme.spacing.md, color: theme.colors.textSecondary, ...theme.typography.body, lineHeight: 25 },
  informationGrid: { marginTop: theme.spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  informationItem: { flexGrow: 1, flexBasis: 220, minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted },
  informationCopy: { flex: 1, minWidth: 0, gap: 2 },
  informationLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  informationValue: { color: theme.colors.textPrimary, ...theme.typography.label },
  sectionHeader: { marginTop: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  sectionIcon: { width: 42, height: 42, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  sectionCopy: { flex: 1, minWidth: 0, gap: 2 },
  sectionTitle: { color: theme.colors.textPrimary, ...theme.typography.heading },
  sectionSubtitle: { color: theme.colors.textSecondary, ...theme.typography.caption },
  applicationsLink: { minHeight: 44, paddingVertical: theme.spacing.md, color: theme.colors.primary, ...theme.typography.label, textAlign: 'center' },
  aiActions: { gap: theme.spacing.sm },
  letterAction: { marginTop: theme.spacing.lg, gap: theme.spacing.md },
});
