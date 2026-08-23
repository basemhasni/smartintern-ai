import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { useApplications } from '@/features/applications/state/ApplicationsContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { LetterEvidenceCard } from '../components/LetterEvidenceCard';
import { LetterPreviewCard } from '../components/LetterPreviewCard';
import { LetterQualityCard } from '../components/LetterQualityCard';
import { LetterToneSelector } from '../components/LetterToneSelector';
import { LetterWarningsCard } from '../components/LetterWarningsCard';
import type { MotivationLetter, MotivationLetterTone } from '../models/motivationLetter';
import { useMotivationLetters } from '../state/MotivationLettersContext';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'MotivationLetterGenerator'>>;

export function MotivationLetterGeneratorScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { applications, findById, findForOffer } = useApplications();
  const { profile, latestCv } = useStudentDashboard();
  const { findByApplication, loadLetters, generateLetter, clearError, isGenerating, generationError } = useMotivationLetters();
  const initialApplication = route.params?.applicationId ? findById(route.params.applicationId) : route.params?.offerId ? findForOffer(route.params.offerId) : undefined;
  const [applicationId, setApplicationId] = useState(initialApplication?.id ?? null);
  const [tone, setTone] = useState<MotivationLetterTone>('PROFESSIONAL');
  const [generated, setGenerated] = useState<MotivationLetter | null>(null);
  const selectedApplicationId = applicationId ?? applications[0]?.id ?? null;
  const application = useMemo(() => applications.find((item) => item.id === selectedApplicationId), [selectedApplicationId, applications]);
  const existing = selectedApplicationId ? findByApplication(selectedApplicationId) : undefined;

  useEffect(() => { void loadLetters(); }, [loadLetters]);

  const canGenerate = Boolean(application && profile && latestCv?.status === 'ANALYZED');
  const generate = async () => {
    if (!application) return;
    const result = await generateLetter(application.id, tone);
    if (result) setGenerated(result);
  };
  const result = generated ?? existing;

  return <Screen>
    <View style={styles.toolbar}><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><Text style={styles.toolbarTitle}>Generer une lettre</Text><IconButton icon="folder-open-outline" label="Mes lettres" onPress={() => navigation.navigate('MotivationLetters')} /></View>

    <GlassCard accent><Text style={styles.eyebrow}>MOTIVATION LETTER V2</Text><Text style={styles.heroTitle}>Une lettre fondee sur vos preuves</Text><Text style={styles.body}>Le backend utilise votre CV analyse, l offre et le matching. Aucune experience ni competence n est creee dans l application mobile.</Text></GlassCard>

    <GlassCard><SectionHeader title="Candidature et offre" subtitle="Une candidature existante est requise par le backend" />{applications.length ? <ScrollView horizontal contentContainerStyle={styles.selector} showsHorizontalScrollIndicator={false}>{applications.map((item) => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: item.id === selectedApplicationId }} onPress={() => { setApplicationId(item.id); setGenerated(null); clearError(); }} style={[styles.offerOption, item.id === selectedApplicationId && styles.offerSelected]}><Text numberOfLines={2} style={styles.offerTitle}>{item.offer?.title ?? 'Offre indisponible'}</Text><Text numberOfLines={1} style={styles.company}>{item.offer?.company.companyName ?? 'Entreprise non renseignee'}</Text></Pressable>)}</ScrollView> : <StatusMessage tone="info" message="Vous devez d abord postuler a une offre. La generation ne cree ni n envoie automatiquement aucune candidature." />}{application ? <View style={styles.offerSummary}><View style={styles.offerIcon}><Ionicons color={theme.colors.violet} name="briefcase-outline" size={22} /></View><View style={styles.flex}><Text style={styles.selectedLabel}>Offre selectionnee</Text><Text style={styles.selectedTitle}>{application.offer?.title ?? 'Offre indisponible'}</Text><Text style={styles.company}>{application.offer?.company.companyName ?? 'Entreprise non renseignee'}</Text></View></View> : null}</GlassCard>

    <GlassCard><SectionHeader title="Prerequis" /><View style={styles.requirements}><Requirement label="Profil etudiant" ready={Boolean(profile)} /><Requirement label="CV analyse" ready={latestCv?.status === 'ANALYZED'} /><Requirement label="Candidature existante" ready={Boolean(application)} /></View>{!canGenerate ? <StatusMessage tone="warning" message="Completez votre profil et ajoutez un CV analyse avant de generer une lettre personnalisee." /> : null}{!latestCv ? <GradientButton icon="document-text-outline" label="Ajouter mon CV" variant="secondary" onPress={() => navigation.navigate('CvManagement')} /> : null}</GlassCard>

    <GlassCard><SectionHeader title="Ton de la lettre" subtitle="Le francais est la seule langue actuellement prise en charge" /><View style={styles.tone}><LetterToneSelector disabled={isGenerating} value={tone} onChange={setTone} /></View></GlassCard>
    {generationError ? <StatusMessage tone="error" message={generationError} /> : null}
    <GradientButton disabled={!canGenerate} icon="sparkles" label={result ? 'Regenerer ma lettre' : 'Generer ma lettre'} loading={isGenerating} onPress={() => void generate()} />

    {result ? <><StatusMessage tone="success" message="La lettre est enregistree et associee a cette candidature." /><LetterPreviewCard content={result.content} />{result.v2 ? <><LetterQualityCard metadata={result.v2} /><LetterEvidenceCard metadata={result.v2} /><LetterWarningsCard warnings={result.v2.warnings} /></> : <StatusMessage tone="info" message="Les metadonnees V2 ne sont pas conservees apres rechargement. Regenerer la lettre permet de les consulter a nouveau." />}<GradientButton icon="open-outline" label="Ouvrir la lettre complete" onPress={() => navigation.navigate('MotivationLetterDetail', { applicationId: result.applicationId })} variant="secondary" /></> : null}
  </Screen>;
}

function Requirement({ label, ready }: Readonly<{ label: string; ready: boolean }>) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <View style={styles.requirement}><Ionicons color={ready ? theme.colors.success : theme.colors.warning} name={ready ? 'checkmark-circle' : 'alert-circle'} size={19} /><Text style={styles.requirementLabel}>{label}</Text><AppBadge label={ready ? 'Pret' : 'Requis'} tone={ready ? 'success' : 'warning'} /></View>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  eyebrow: { color: theme.colors.violet, ...theme.typography.overline },
  heroTitle: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary, ...theme.typography.heading },
  body: { marginTop: theme.spacing.md, color: theme.colors.textSecondary, ...theme.typography.body },
  selector: { paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.sm, gap: theme.spacing.sm },
  offerOption: { width: 210, minHeight: 88, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted, gap: theme.spacing.xs },
  offerSelected: { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` },
  offerTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  company: { color: theme.colors.textSecondary, ...theme.typography.caption },
  offerSummary: { marginTop: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  offerIcon: { width: 46, height: 46, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: `${theme.colors.violet}14` },
  flex: { flex: 1, minWidth: 0 },
  selectedLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  selectedTitle: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  requirements: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  requirement: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  requirementLabel: { flex: 1, color: theme.colors.textPrimary, ...theme.typography.label },
  tone: { marginTop: theme.spacing.lg },
});
