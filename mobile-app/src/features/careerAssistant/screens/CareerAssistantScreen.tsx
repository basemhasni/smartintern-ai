import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { OfferAnalysisSelector } from '@/features/aiInsights/components/OfferAnalysisSelector';
import { useOffers } from '@/features/offers/state/OffersContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { ProfileRequirementsCard } from '@/features/profile/components/ProfileRequirementsCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { Screen } from '@/shared/components/Screen';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { CareerProjectsCard, CareerSourcesCard, CvImprovementCard, InterviewPreparationCard, LearningRoadmapTimeline } from '../components/CareerPlanCards';
import { CareerAnswerHistory, CareerQuestionForm } from '../components/CareerQuestionForm';
import { CriticalGapsCard, PriorityFocusCard } from '../components/PriorityCards';
import { ReadinessCard } from '../components/ReadinessCard';
import { useCareerAssistant } from '../state/CareerAssistantContext';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'CareerAssistant'>>;

export function CareerAssistantScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  const offersState = useOffers(); const { latestCv, profile } = useStudentDashboard(); const assistant = useCareerAssistant();
  const offers = useMemo(() => [...new Map([...offersState.recommendedOffers, ...offersState.offers].map((offer) => [offer.id, offer])).values()], [offersState.offers, offersState.recommendedOffers]);
  const [manualOfferId, setOfferId] = useState<string | null>(route.params?.offerId ?? null);
  const offerId = manualOfferId ?? route.params?.offerId ?? offers[0]?.id ?? null;
  const offer = offerId ? offersState.findOffer(offerId) : undefined;
  const advice = offerId ? assistant.getAdvice(offerId) : undefined;
  const answers = offerId ? assistant.getAnswers(offerId) : [];

  return <Screen>
    <View style={styles.toolbar}><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><Text style={styles.toolbarTitle}>Assistant carriere</Text><View style={styles.spacer} /></View>
    {offers.length ? <View style={styles.selector}><Text style={styles.sectionTitle}>Choisir une offre</Text><OfferAnalysisSelector offers={offers} selectedId={offerId} onSelect={(id) => { assistant.clearError(); setOfferId(id); }} /></View> : <GlassCard><EmptyState icon="briefcase-outline" title="Aucune offre disponible" message="Une offre publiee est necessaire pour generer des conseils personnalises." /></GlassCard>}
    {offer ? <GlassCard accent><Text style={styles.eyebrow}>Conseils pour</Text><Text style={styles.offerTitle}>{offer.title}</Text><Text style={styles.company}>{offer.company.companyName}</Text><Text style={styles.intro}>Career Assistant V2 s appuie sur votre CV analyse, le matching et les sources autorisees. Ses conseils ne garantissent pas un recrutement.</Text></GlassCard> : null}
    {!latestCv ? <ProfileRequirementsCard hasProfile={Boolean(profile)} hasAnalyzedCv={false} onManageCv={() => navigation.navigate('CvManagement')} /> : null}
    {assistant.error ? <StatusMessage tone="error" message={assistant.error} /> : null}
    {offerId && latestCv ? <GradientButton icon="compass-outline" label={advice ? 'Actualiser mes recommandations' : 'Generer mes recommandations'} loading={assistant.isGenerating} onPress={() => void assistant.generate(offerId)} /> : null}
    {advice ? <View style={styles.results}>
      <ReadinessCard advice={advice} generatedAt={offerId ? assistant.getGeneratedAt(offerId) : undefined} />
      {advice.directAnswer ? <StatusMessage tone="info" message={advice.directAnswer} /> : null}
      {advice.priorityFocus.length ? <PriorityFocusCard items={advice.priorityFocus} /> : null}
      {advice.criticalGaps.length ? <CriticalGapsCard items={advice.criticalGaps} /> : null}
      {advice.learningRoadmap.length ? <LearningRoadmapTimeline items={advice.learningRoadmap} /> : null}
      {advice.cvImprovementTips.length ? <CvImprovementCard tips={advice.cvImprovementTips} /> : null}
      {advice.recommendedProjects.length ? <CareerProjectsCard projects={advice.recommendedProjects} /> : null}
      {advice.interviewPreparationTips.length ? <InterviewPreparationCard tips={advice.interviewPreparationTips} /> : null}
      {advice.sources.length ? <CareerSourcesCard sources={advice.sources} /> : null}
      {[...advice.warnings, ...advice.ragWarnings].map((warning) => <StatusMessage key={warning} tone="warning" message={warning} />)}
    </View> : offerId && latestCv ? <GlassCard><EmptyState icon="compass-outline" title="Recommandations non generees" message="Lancez une analyse uniquement lorsque vous souhaitez actualiser votre plan de progression." /></GlassCard> : null}
    {offerId ? <GradientButton icon="document-text-outline" label="Rediger ma lettre de motivation" onPress={() => navigation.navigate('MotivationLetterGenerator', { offerId })} variant="secondary" /> : null}
    {offerId && latestCv ? <CareerQuestionForm loading={assistant.isSubmittingQuestion} onSubmit={(question) => assistant.ask(offerId, question)} /> : null}
    <CareerAnswerHistory answers={answers} onClear={() => offerId && assistant.clearAnswers(offerId)} />
  </Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({ toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label }, spacer: { width: 44 }, selector: { gap: theme.spacing.md }, sectionTitle: { color: theme.colors.textPrimary, ...theme.typography.heading }, eyebrow: { color: theme.colors.primary, ...theme.typography.overline }, offerTitle: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary, ...theme.typography.heading }, company: { marginTop: theme.spacing.xs, color: theme.colors.textSecondary, ...theme.typography.label }, intro: { marginTop: theme.spacing.md, color: theme.colors.textSecondary, ...theme.typography.body }, results: { gap: theme.spacing.lg } });
