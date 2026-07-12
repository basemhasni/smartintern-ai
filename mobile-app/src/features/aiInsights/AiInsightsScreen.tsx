import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList, StudentTabParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { EmptyState } from '@/shared/components/EmptyState';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { Screen } from '@/shared/components/Screen';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { SkillGapSummaryCard } from '@/features/skillGap/components/SkillGapSummaryCard';
import { useSkillGap } from '@/features/skillGap/state/SkillGapContext';
import { CareerAssistantSummaryCard } from '@/features/careerAssistant/components/CareerAssistantSummaryCard';
import { useCareerAssistant } from '@/features/careerAssistant/state/CareerAssistantContext';
import { AiMatchScoreCard } from './components/AiMatchScoreCard';
import { AiQualityCard, AiWarningsCard } from './components/AiQualityCards';
import { CareerSignalMapCard } from './components/CareerSignalMapCard';
import { DecisionTraceTimeline } from './components/DecisionTraceTimeline';
import { OfferAnalysisSelector } from './components/OfferAnalysisSelector';
import { ScoreBreakdownCard } from './components/ScoreBreakdownCard';
import { MatchedSkillsCard, MissingSkillsCard } from './components/SkillsInsightCards';
import { SkillEvidenceMapCard } from './components/SkillEvidenceMapCard';
import { useAiInsights } from './state/useAiInsights';

type Props = BottomTabScreenProps<StudentTabParamList, 'AiInsights'>;

export function AiInsightsScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const insights = useAiInsights(route.params?.offerId);
  const skillGap = useSkillGap();
  const careerAssistant = useCareerAssistant();
  const selectOffer = insights.selectOffer;
  const selectorOffers = useMemo(() => {
    const ordered = [...insights.recommendedOffers, ...insights.offers];
    return [...new Map(ordered.map((offer) => [offer.id, offer])).values()];
  }, [insights.offers, insights.recommendedOffers]);

  useEffect(() => {
    if (route.params?.offerId) selectOffer(route.params.offerId);
  }, [route.params?.offerId, selectOffer]);

  return (
    <Screen eyebrow="Intelligence carriere" subtitle="Comprenez les preuves et limites derriere chaque compatibilite." title="Mon analyse IA" rightAccessory={insights.analysis ? <Pressable accessibilityLabel="Relancer l analyse" accessibilityRole="button" disabled={insights.isAnalyzing} onPress={() => void insights.analyze()} style={styles.refresh}><Ionicons color={theme.colors.primary} name="refresh" size={20} /></Pressable> : null}>
      {selectorOffers.length ? <View style={styles.selector}><Text style={styles.sectionTitle}>Choisir une offre</Text><OfferAnalysisSelector offers={selectorOffers} selectedId={insights.selectedOfferId} onSelect={insights.selectOffer} /></View> : (
        <GlassCard><EmptyState icon="briefcase-outline" message="Aucune offre publiee n est disponible pour une analyse." title="Aucune offre" /><GradientButton label="Voir les offres" onPress={() => navigation.navigate('Offers')} /></GlassCard>
      )}

      {!insights.selectedOfferId && selectorOffers.length ? (
        <GlassCard accent><EmptyState icon="sparkles-outline" message="Selectionnez une offre pour analyser la compatibilite avec votre profil." title="Choisissez une offre" /></GlassCard>
      ) : null}

      {insights.selectedOffer && !insights.canAnalyze && !insights.analysis ? (
        <GlassCard accent style={styles.actionCard}><StatusMessage message="Completez votre profil et ajoutez un CV analyse pour obtenir une analyse explicable." tone="info" /><GradientButton icon="person-outline" label="Ouvrir mon profil" onPress={() => navigation.navigate('Profile')} /></GlassCard>
      ) : null}

      {insights.selectedOffer && insights.canAnalyze && !insights.analysis ? (
        <GlassCard accent style={styles.actionCard}><View style={styles.actionHeader}><View style={styles.actionIcon}><Ionicons color={theme.colors.primary} name="sparkles" size={23} /></View><View style={styles.flex}><Text style={styles.actionTitle}>Analyse non lancee</Text><Text style={styles.actionText}>Le matching sera calcule par le backend avec votre CV analyse.</Text></View></View>{insights.error ? <StatusMessage message={insights.error} tone="error" /> : null}<GradientButton icon="sparkles-outline" label="Analyser cette offre" loading={insights.isAnalyzing} onPress={() => void insights.analyze()} /></GlassCard>
      ) : null}

      {insights.analysis ? (
        <View style={styles.analysis}>
          {insights.error ? <StatusMessage message={insights.error} tone="error" /> : null}
          <AiMatchScoreCard analysis={insights.analysis} analyzedAt={insights.lastAnalyzedAt} />
          <View style={styles.columns}><MatchedSkillsCard skills={insights.analysis.matchedSkills} /><MissingSkillsCard critical={insights.analysis.criticalMissingSkills} skills={insights.analysis.missingSkills} /></View>
          <ScoreBreakdownCard breakdown={insights.analysis.scoreBreakdown} />
          <SkillEvidenceMapCard items={insights.analysis.skillEvidence} />
          <CareerSignalMapCard map={insights.analysis.careerSignalMap} />
          <DecisionTraceTimeline items={insights.analysis.decisionTrace} />
          <AiWarningsCard warnings={insights.analysis.warnings} />
          <AiQualityCard checks={insights.analysis.qualityChecks} method={insights.analysis.matchingMethod} />
          {insights.selectedOffer ? <SkillGapSummaryCard result={skillGap.getResult(insights.selectedOffer.id, 'REALISTIC')} onPress={() => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('SkillGapSimulator', { offerId: insights.selectedOffer!.id })} /> : null}
          {insights.selectedOffer ? <CareerAssistantSummaryCard advice={careerAssistant.getAdvice(insights.selectedOffer.id)} onPress={() => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('CareerAssistant', { offerId: insights.selectedOffer!.id })} /> : null}
          <GradientButton icon="refresh" label="Relancer l analyse" loading={insights.isAnalyzing} onPress={() => void insights.analyze()} variant="secondary" />
        </View>
      ) : null}
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  refresh: { width: 44, height: 44, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  selector: { gap: theme.spacing.md },
  sectionTitle: { color: theme.colors.textPrimary, ...theme.typography.heading },
  actionCard: { gap: theme.spacing.lg },
  actionHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  actionIcon: { width: 46, height: 46, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  flex: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  actionTitle: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  actionText: { color: theme.colors.textSecondary, ...theme.typography.caption },
  analysis: { gap: theme.spacing.lg },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
});
