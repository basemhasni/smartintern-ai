import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { ErrorState } from '@/shared/components/ErrorState';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { useMotivationLetters } from '@/features/motivationLetters/state/MotivationLettersContext';
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge';
import { getApplicationStatusConfig } from '../config/applicationStatusConfig';
import { useApplications } from '../state/ApplicationsContext';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'ApplicationDetail'>>;

export function ApplicationDetailScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { findById, isLoading, isRefreshing, error, refresh } = useApplications();
  const { findByApplication, loadLetters } = useMotivationLetters();
  const application = findById(route.params.applicationId);
  const letter = findByApplication(route.params.applicationId);

  useEffect(() => {
    void loadLetters();
  }, [loadLetters]);

  if (isLoading && !application) return <Screen><LoadingState label="Chargement de la candidature..." /></Screen>;
  if (!application) {
    return (
      <Screen>
        <IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} />
        <ErrorState message={error || 'Cette candidature est introuvable ou n est plus disponible.'} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  const offer = application.offer;
  const status = getApplicationStatusConfig(application.status);
  const hasUpdate = hasMeaningfulUpdate(application.appliedAt, application.updatedAt);

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} tintColor={theme.colors.primary} onRefresh={() => void refresh()} />}>
      <View style={styles.toolbar}>
        <IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} />
        <Text style={styles.toolbarTitle}>Detail de la candidature</Text>
        <View style={styles.toolbarSpacer} />
      </View>

      <GlassCard accent>
        <View style={styles.identity}>
          <View style={styles.logo}><Text style={styles.initial}>{offer?.company.companyName.charAt(0).toUpperCase() || 'S'}</Text></View>
          <View style={styles.flex}>
            <ApplicationStatusBadge status={application.status} />
            <Text style={styles.title}>{offer?.title || 'Offre indisponible'}</Text>
            <Text style={styles.company}>{offer?.company.companyName || 'Entreprise non renseignee'}</Text>
          </View>
        </View>
        <Text style={styles.appliedAt}>{application.appliedAt ? `Candidature envoyee le ${formatDate(application.appliedAt)}` : 'Date de candidature non renseignee'}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeader title="Statut actuel" />
        <View style={styles.statusBlock}>
          <View style={[styles.statusIcon, { backgroundColor: `${toneColor(theme, application.status)}16` }]}><Ionicons color={toneColor(theme, application.status)} name={status.icon} size={22} /></View>
          <View style={styles.flex}><Text style={styles.statusTitle}>{status.label}</Text><Text style={styles.body}>{status.description}</Text></View>
        </View>
        {application.updatedAt ? <Text style={styles.updatedAt}>Derniere mise a jour : {formatDateTime(application.updatedAt)}</Text> : null}
      </GlassCard>

      <GlassCard>
        <SectionHeader title="Suivi" subtitle="Uniquement les dates enregistrees par le backend" />
        <View style={styles.timeline}>
          <TimelineItem date={application.appliedAt} icon="paper-plane-outline" label="Candidature envoyee" />
          {hasUpdate ? <TimelineItem date={application.updatedAt} icon={status.icon} label="Derniere mise a jour du statut" /> : null}
        </View>
      </GlassCard>

      <GlassCard>
        <SectionHeader title="Offre liee" />
        <View style={styles.facts}>
          <Fact icon="location-outline" label="Localisation" value={offer?.location || 'Non renseignee'} />
          <Fact icon="time-outline" label="Duree" value={offer?.duration || 'Non renseignee'} />
          {offer?.status ? <View style={styles.offerStatus}><AppBadge label={offer.status} tone={offer.status === 'PUBLISHED' ? 'success' : 'neutral'} /></View> : null}
        </View>
        {offer?.id ? <GradientButton icon="open-outline" label="Voir l offre" onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })} variant="secondary" /> : null}
      </GlassCard>

      {application.compatibilityScore !== null && application.compatibilityScore !== undefined ? (
        <GlassCard>
          <SectionHeader title="Compatibilite" subtitle="Score enregistre avec la candidature" />
          <Text accessibilityLabel={`Score de compatibilite ${Math.round(application.compatibilityScore)} sur 100`} style={styles.score}>{Math.round(application.compatibilityScore)}%</Text>
        </GlassCard>
      ) : null}

      {application.message ? <GlassCard><SectionHeader title="Message envoye" /><Text style={styles.body}>{application.message}</Text></GlassCard> : null}

      <GlassCard>
        <SectionHeader title="Lettre de motivation" subtitle="Associee uniquement a cette candidature" />
        {letter ? (
          <View style={styles.letterBlock}>
            <Text style={styles.body}>Une lettre est enregistree pour cette candidature.</Text>
            <GradientButton icon="document-text-outline" label="Voir la lettre" onPress={() => navigation.navigate('MotivationLetterDetail', { applicationId: application.id })} variant="secondary" />
          </View>
        ) : (
          <View style={styles.letterBlock}>
            <Text style={styles.body}>Aucune lettre n est encore associee a cette candidature.</Text>
            <GradientButton icon="sparkles" label="Generer une lettre" onPress={() => navigation.navigate('MotivationLetterGenerator', { applicationId: application.id, offerId: application.offerId })} variant="secondary" />
          </View>
        )}
      </GlassCard>
    </Screen>
  );
}

function TimelineItem({ icon, label, date }: Readonly<{ icon: keyof typeof Ionicons.glyphMap; label: string; date?: string | null }>) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <View style={styles.timelineItem}><View style={styles.timelineIcon}><Ionicons color={theme.colors.primary} name={icon} size={17} /></View><View style={styles.flex}><Text style={styles.timelineLabel}>{label}</Text><Text style={styles.timelineDate}>{date ? formatDateTime(date) : 'Date non renseignee'}</Text></View></View>;
}

function Fact({ icon, label, value }: Readonly<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string }>) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <View style={styles.fact}><Ionicons color={theme.colors.primary} name={icon} size={18} /><View style={styles.flex}><Text style={styles.factLabel}>{label}</Text><Text numberOfLines={2} style={styles.factValue}>{value}</Text></View></View>;
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
const formatDateTime = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const hasMeaningfulUpdate = (appliedAt?: string | null, updatedAt?: string | null) => Boolean(appliedAt && updatedAt && Math.abs(new Date(updatedAt).getTime() - new Date(appliedAt).getTime()) > 1000);
const toneColor = (theme: AppTheme, status: string) => status === 'ACCEPTED' ? theme.colors.success : status === 'REJECTED' ? theme.colors.danger : status === 'PENDING' ? theme.colors.warning : theme.colors.primary;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  toolbarSpacer: { width: 44 },
  identity: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.lg },
  logo: { width: 58, height: 58, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border },
  initial: { color: theme.colors.primary, fontSize: 22, lineHeight: 27, fontWeight: '800' },
  flex: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  title: { color: theme.colors.textPrimary, ...theme.typography.title, marginTop: theme.spacing.sm },
  company: { color: theme.colors.textSecondary, ...theme.typography.body },
  appliedAt: { marginTop: theme.spacing.lg, color: theme.colors.textMuted, ...theme.typography.caption },
  statusBlock: { marginTop: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  statusIcon: { width: 46, height: 46, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  body: { marginTop: theme.spacing.sm, color: theme.colors.textSecondary, ...theme.typography.body },
  updatedAt: { marginTop: theme.spacing.lg, color: theme.colors.textMuted, ...theme.typography.caption },
  timeline: { marginTop: theme.spacing.lg, gap: theme.spacing.md },
  timelineItem: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  timelineIcon: { width: 38, height: 38, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border },
  timelineLabel: { color: theme.colors.textPrimary, ...theme.typography.label },
  timelineDate: { color: theme.colors.textMuted, ...theme.typography.caption },
  facts: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  fact: { flexGrow: 1, flexBasis: 190, minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted },
  factLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  factValue: { color: theme.colors.textPrimary, ...theme.typography.label },
  offerStatus: { width: '100%' },
  score: { marginTop: theme.spacing.md, color: theme.colors.primary, fontSize: 36, lineHeight: 42, fontWeight: '800' },
  letterBlock: { marginTop: theme.spacing.md, gap: theme.spacing.md },
});
