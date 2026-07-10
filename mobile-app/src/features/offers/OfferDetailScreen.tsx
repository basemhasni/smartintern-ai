import { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { normalizeApiError } from '@/core/api/apiError';
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
import { offersApi } from './api/offersApi';
import { MatchScoreBadge, getDecisionLabel } from './components/MatchScoreBadge';
import type { Offer } from './models/offer';
import { useOffers } from './state/OffersContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OfferDetail'>;

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export function OfferDetailScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { findOffer } = useOffers();
  const cachedOffer = findOffer(route.params.offerId);
  const [offer, setOffer] = useState<Offer | null>(cachedOffer ?? null);
  const [isLoading, setIsLoading] = useState(!cachedOffer);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const loadOffer = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const freshOffer = await offersApi.getOfferById(route.params.offerId);
      if (!mounted.current || currentRequest !== requestId.current) return;
      setOffer({ ...freshOffer, match: findOffer(route.params.offerId)?.match });
    } catch (requestError) {
      if (!mounted.current || currentRequest !== requestId.current) return;
      setError(normalizeApiError(requestError));
    } finally {
      if (mounted.current && currentRequest === requestId.current) setIsLoading(false);
    }
  }, [findOffer, route.params.offerId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOffer();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadOffer]);

  if (isLoading && !offer) {
    return <Screen><LoadingState label="Chargement de l’offre..." /></Screen>;
  }

  if (error && !offer) {
    return <Screen><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><ErrorState message={error} onRetry={() => void loadOffer()} /></Screen>;
  }

  if (!offer) return null;

  const skills = [...offer.requiredSkills, ...offer.optionalSkills];
  const publishedAt = formatDate(offer.createdAt);
  const startDate = formatDate(offer.startDate);

  return (
    <Screen>
      <View style={styles.toolbar}>
        <IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} />
        {offer.status ? <AppBadge label={offer.status === 'PUBLISHED' ? 'Publiée' : offer.status} tone="success" /> : null}
      </View>

      <View style={styles.hero}>
        <View style={styles.companyLogo}>
          <Text style={styles.companyInitial}>{offer.company.companyName.charAt(0).toUpperCase() || 'S'}</Text>
        </View>
        <View style={styles.heroCopy}>
          <MatchScoreBadge match={offer.match} />
          <Text style={styles.title}>{offer.title}</Text>
          <Text style={styles.company}>{offer.company.companyName}{offer.company.sector ? ` · ${offer.company.sector}` : ''}</Text>
        </View>
      </View>

      <View style={styles.quickFacts}>
        <View style={styles.fact}>
          <Ionicons color={theme.colors.primary} name="location-outline" size={19} />
          <Text numberOfLines={2} style={styles.factValue}>{offer.location || 'Non renseignée'}</Text>
          <Text style={styles.factLabel}>Localisation</Text>
        </View>
        <View style={styles.factDivider} />
        <View style={styles.fact}>
          <Ionicons color={theme.colors.primary} name="time-outline" size={19} />
          <Text numberOfLines={2} style={styles.factValue}>{offer.duration || 'Non renseignée'}</Text>
          <Text style={styles.factLabel}>Durée</Text>
        </View>
        <View style={styles.factDivider} />
        <View style={styles.fact}>
          <Ionicons color={theme.colors.primary} name="calendar-outline" size={19} />
          <Text numberOfLines={2} style={styles.factValue}>{startDate || 'Non renseigné'}</Text>
          <Text style={styles.factLabel}>Début</Text>
        </View>
      </View>

      {publishedAt ? <Text style={styles.publishedAt}>Publiée le {publishedAt}</Text> : null}

      <GlassCard>
        <SectionHeader title="La mission" />
        <Text style={styles.body}>{offer.description || 'Description non renseignée par l’entreprise.'}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeader title="Compétences recherchées" subtitle="Informations fournies par l’entreprise" />
        {skills.length ? (
          <View style={styles.skills}>
            {skills.map((skill) => <AppBadge key={skill} label={skill} tone="neutral" />)}
          </View>
        ) : <Text style={styles.body}>Aucune compétence spécifique n’a été renseignée.</Text>}
      </GlassCard>

      {offer.match?.isAvailable ? (
        <LinearGradient colors={theme.gradients.premium} style={styles.aiCard}>
          <View style={styles.aiTitle}>
            <View style={styles.aiIcon}><Ionicons color={theme.colors.white} name="sparkles" size={20} /></View>
            <View style={styles.aiTitleCopy}>
              <Text style={styles.aiEyebrow}>APERÇU DU MATCHING</Text>
              <Text style={styles.aiHeading}>{getDecisionLabel(offer.match)}</Text>
            </View>
            {offer.match.confidence ? <Text style={styles.confidence}>{offer.match.confidence}</Text> : null}
          </View>
          {offer.match.explanation ? <Text style={styles.aiBody}>{offer.match.explanation}</Text> : null}
          <View style={styles.aiSignals}>
            <Text style={styles.aiSignal}>{offer.match.matchedSkills.length} compétence(s) correspondante(s)</Text>
            <Text style={styles.aiSignal}>{offer.match.missingSkills.length} compétence(s) manquante(s)</Text>
          </View>
        </LinearGradient>
      ) : (
        <GlassCard variant="soft" style={styles.unavailableMatch}>
          <Ionicons color={theme.colors.textMuted} name="sparkles-outline" size={24} />
          <View style={styles.aiTitleCopy}>
            <Text style={styles.unavailableTitle}>Analyse non disponible</Text>
            <Text style={styles.unavailableText}>Un CV analysé est nécessaire pour afficher la compatibilité avec cette offre.</Text>
          </View>
        </GlassCard>
      )}

      <GradientButton disabled icon="paper-plane-outline" label="Candidature disponible à l’étape suivante" />
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
  hero: { paddingVertical: theme.spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.lg },
  companyLogo: { width: 58, height: 58, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadowSmall },
  companyInitial: { color: theme.colors.primary, fontSize: 23, lineHeight: 28, fontWeight: '800' },
  heroCopy: { flex: 1, minWidth: 0, gap: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  company: { color: theme.colors.textSecondary, ...theme.typography.body },
  quickFacts: { flexDirection: 'row', borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', ...theme.shadowSmall },
  fact: { flex: 1, minWidth: 0, minHeight: 105, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xs },
  factDivider: { width: 1, height: '55%', alignSelf: 'center', backgroundColor: theme.colors.border },
  factValue: { color: theme.colors.textPrimary, ...theme.typography.caption, fontWeight: '700', textAlign: 'center' },
  factLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  publishedAt: { color: theme.colors.textMuted, ...theme.typography.caption },
  body: { color: theme.colors.textSecondary, ...theme.typography.body, marginTop: theme.spacing.md },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.md },
  aiCard: { borderRadius: theme.radius.xl, padding: theme.spacing.xl, gap: theme.spacing.lg, ...theme.shadow },
  aiTitle: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  aiTitleCopy: { flex: 1, minWidth: 0, gap: 2 },
  aiIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)' },
  aiEyebrow: { color: '#A7F3D0', ...theme.typography.overline },
  aiHeading: { color: theme.colors.white, ...theme.typography.subheading },
  confidence: { color: '#A7F3D0', ...theme.typography.caption, fontWeight: '700' },
  aiBody: { color: 'rgba(255,255,255,0.78)', ...theme.typography.body },
  aiSignals: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  aiSignal: { color: '#A7F3D0', ...theme.typography.caption },
  unavailableMatch: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  unavailableTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  unavailableText: { color: theme.colors.textSecondary, ...theme.typography.caption },
});
