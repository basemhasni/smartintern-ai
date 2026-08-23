import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { useOffers } from '@/features/offers/state/OffersContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { HighImpactGapsCard } from '../components/HighImpactGapsCard';
import { RecommendedPathTimeline } from '../components/RecommendedPathTimeline';
import { RecommendedProjectsCard } from '../components/RecommendedProjectsCard';
import { ScorePotentialCard } from '../components/ScorePotentialCard';
import { CombinationSimulationsCard, SingleSkillSimulationsCard } from '../components/SimulationDetailsCards';
import { SimulationModeSelector } from '../components/SimulationModeSelector';
import { SimulationWarningsCard } from '../components/SimulationWarningsCard';
import type { SimulationMode } from '../models/skillGapSimulation';
import { useSkillGap } from '../state/SkillGapContext';
import { ProfileRequirementsCard } from '@/features/profile/components/ProfileRequirementsCard';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'SkillGapSimulator'>>;

export function SkillGapSimulatorScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { findOffer } = useOffers();
  const { latestCv, profile } = useStudentDashboard();
  const simulator = useSkillGap();
  const [mode, setMode] = useState<SimulationMode>('REALISTIC');
  const offer = findOffer(route.params.offerId);
  const result = simulator.getResult(route.params.offerId, mode);
  const simulatedAt = simulator.getLastSimulationAt(route.params.offerId, mode);

  return <Screen>
    <View style={styles.toolbar}><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><Text style={styles.toolbarTitle}>Skill Gap Simulator</Text><View style={styles.spacer} /></View>
    <GlassCard accent style={styles.intro}><SectionHeader title={offer?.title ?? 'Simulation de progression'} subtitle={offer?.company.companyName ?? 'Offre selectionnee'} /><Text style={styles.introText}>Explorez comment les competences acquises et leurs preuves pourraient faire evoluer votre compatibilite. Aucun score ne sera recalcule sur votre appareil.</Text></GlassCard>
    <GlassCard><SectionHeader title="Mode de simulation" subtitle="Choisissez le niveau des hypotheses utilisees par le moteur IA" /><View style={styles.selector}><SimulationModeSelector value={mode} onChange={(value) => { simulator.clearError(); setMode(value); }} /></View></GlassCard>
    {!latestCv ? <ProfileRequirementsCard hasProfile={Boolean(profile)} hasAnalyzedCv={false} onManageCv={() => navigation.navigate('CvManagement')} /> : null}
    {simulator.error ? <StatusMessage tone="error" message={simulator.error} /> : null}
    <GradientButton icon="sparkles-outline" label={result ? 'Relancer cette simulation' : 'Simuler ma progression'} loading={simulator.isSimulating} disabled={!latestCv} onPress={() => void simulator.simulate(route.params.offerId, mode)} />
    {simulatedAt ? <Text style={styles.timestamp}>Derniere simulation: {new Date(simulatedAt).toLocaleString()}</Text> : null}
    {result ? <View style={styles.results}>
      <ScorePotentialCard result={result} />
      <HighImpactGapsCard items={result.highImpactGaps} />
      <SingleSkillSimulationsCard items={result.singleSkillSimulations} />
      <CombinationSimulationsCard items={result.combinationSimulations} />
      <RecommendedPathTimeline steps={result.recommendedPath} />
      <RecommendedProjectsCard projects={result.recommendedProjects} />
      <SimulationWarningsCard warnings={result.warnings} assumptions={result.assumptions} caps={result.scoreCapsApplied} />
      <GradientButton icon="compass-outline" label="Continuer avec mon plan de carriere" onPress={() => navigation.navigate('CareerAssistant', { offerId: route.params.offerId })} />
    </View> : <GlassCard><Text style={styles.empty}>La simulation reste a lancer pour ce mode. Le traitement peut prendre quelques secondes car il passe par le backend et le service IA.</Text></GlassCard>}
  </Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  spacer: { width: 44 }, intro: { gap: theme.spacing.md },
  introText: { color: theme.colors.textSecondary, ...theme.typography.body },
  selector: { marginTop: theme.spacing.md },
  timestamp: { color: theme.colors.textMuted, ...theme.typography.caption, textAlign: 'center' },
  results: { gap: theme.spacing.lg },
  empty: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
});
