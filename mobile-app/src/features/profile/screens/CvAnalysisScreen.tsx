import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { ErrorState } from '@/shared/components/ErrorState';
import { GlassCard } from '@/shared/components/GlassCard';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { StatusMessage } from '@/shared/components/StatusMessage';
import type { CvDocument } from '../models/cvDocument';
import { useStudentProfile } from '../state/StudentProfileContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CvAnalysis'>;

export function CvAnalysisScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  const { cvs, loadCv } = useStudentProfile();
  const [cv, setCv] = useState<CvDocument | null>(() => cvs.find((item) => item.id === route.params.cvId) ?? null);
  const [loading, setLoading] = useState(!cv?.analysis);

  useEffect(() => {
    let active = true;
    if (cv?.analysis) return;
    void loadCv(route.params.cvId).then((result) => { if (active) { setCv(result); setLoading(false); } });
    return () => { active = false; };
  }, [cv?.analysis, loadCv, route.params.cvId]);

  if (loading) return <Screen><LoadingState label="Chargement de l analyse..." /></Screen>;
  if (!cv) return <Screen><ErrorState message="Analyse du CV introuvable." onRetry={() => void loadCv(route.params.cvId).then(setCv)} /></Screen>;
  const analysis = cv.analysis;

  return <Screen>
    <View style={styles.toolbar}><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><Text style={styles.toolbarTitle}>Analyse du CV</Text><View style={styles.spacer} /></View>
    <GlassCard accent><View style={styles.hero}><View style={styles.heroIcon}><Ionicons color={theme.colors.primary} name="analytics-outline" size={27} /></View><View style={styles.flex}><Text numberOfLines={2} style={styles.fileName}>{cv.fileName}</Text><Text style={styles.meta}>Analyse automatique du contenu professionnel</Text></View><AppBadge label={cv.status === 'ANALYZED' ? 'Disponible' : 'Incomplete'} tone={cv.status === 'ANALYZED' ? 'success' : 'warning'} /></View></GlassCard>
    {!analysis ? <StatusMessage tone="info" message="Aucune analyse structuree n est disponible pour ce document." /> : null}
    {analysis?.error ? <StatusMessage tone="warning" message="L analyse IA n a pas pu etre terminee. Le CV reste enregistre." /> : null}
    {analysis?.summary ? <GlassCard><SectionHeader title="Resume professionnel" /><Text style={styles.body}>{analysis.summary}</Text></GlassCard> : null}
    <TagSection title="Competences detectees" values={cv.skills} empty="Aucune competence detectee." />
    <View style={styles.columns}><FactCard icon="trending-up-outline" label="Experience" value={analysis?.experienceLevelV2 || analysis?.experienceLevel} /><FactCard icon="school-outline" label="Formation" value={analysis?.educationLevel} /></View>
    <TagSection title="Competences techniques" values={analysis?.technicalSkills ?? []} />
    <TagSection title="Competences humaines" values={analysis?.softSkills ?? []} />
    <TagSection title="Outils" values={analysis?.tools ?? []} />
    <TagSection title="Langues" values={analysis?.languages ?? []} />
    <TagSection title="Domaines identifies" values={analysis?.domainSignals ?? []} />
    <TagSection title="Signaux de projets" values={analysis?.projectSignals ?? []} />
    {analysis?.rawTextQuality ? <GlassCard><SectionHeader title="Qualite de lecture" subtitle="Indicateurs techniques de l extraction" /><View style={styles.facts}><Text style={styles.body}>Qualite : {analysis.rawTextQuality.quality || 'Non estimee'}</Text>{analysis.rawTextQuality.wordCount != null ? <Text style={styles.muted}>{analysis.rawTextQuality.wordCount} mots detectes</Text> : null}</View></GlassCard> : null}
    {analysis?.warnings.length ? <GlassCard><SectionHeader title="Points d attention" />{analysis.warnings.map((warning, index) => <View key={`${warning}-${index}`} style={styles.warning}><Ionicons color={theme.colors.warning} name="alert-circle-outline" size={18} /><Text style={styles.warningText}>{warning}</Text></View>)}</GlassCard> : null}
    <StatusMessage tone="info" message="Ces informations sont extraites automatiquement du CV. Elles peuvent etre partielles selon la qualite du document." />
  </Screen>;
}

function TagSection({ title, values, empty }: { title: string; values: string[]; empty?: string }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  if (!values.length && !empty) return null;
  return <GlassCard><SectionHeader title={title} /><View style={styles.tags}>{values.length ? values.map((value) => <AppBadge key={value} label={value} tone="violet" />) : <Text style={styles.muted}>{empty}</Text>}</View></GlassCard>;
}

function FactCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | null }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  return <GlassCard style={styles.factCard}><Ionicons color={theme.colors.primary} name={icon} size={22} /><Text style={styles.factLabel}>{label}</Text><Text numberOfLines={3} style={styles.factValue}>{value || 'Non detecte'}</Text></GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({ toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label }, spacer: { width: 44 }, hero: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }, heroIcon: { width: 52, height: 52, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted }, flex: { flex: 1, minWidth: 0 }, fileName: { color: theme.colors.textPrimary, ...theme.typography.subheading }, meta: { marginTop: 3, color: theme.colors.textMuted, ...theme.typography.caption }, body: { marginTop: theme.spacing.md, color: theme.colors.textSecondary, ...theme.typography.body }, muted: { color: theme.colors.textMuted, ...theme.typography.body }, tags: { marginTop: theme.spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }, columns: { flexDirection: 'row', gap: theme.spacing.md }, factCard: { flex: 1, minWidth: 0 }, factLabel: { marginTop: theme.spacing.md, color: theme.colors.textMuted, ...theme.typography.caption }, factValue: { marginTop: 3, color: theme.colors.textPrimary, ...theme.typography.label }, facts: { marginTop: theme.spacing.sm, gap: theme.spacing.xs }, warning: { marginTop: theme.spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }, warningText: { flex: 1, color: theme.colors.textSecondary, ...theme.typography.body } });
