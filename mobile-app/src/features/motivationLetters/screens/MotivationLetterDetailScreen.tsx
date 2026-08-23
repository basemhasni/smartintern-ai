import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

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
import { StatusMessage } from '@/shared/components/StatusMessage';
import { getLetterToneLabel } from '../config/letterToneConfig';
import { LetterActions } from '../components/LetterActions';
import { LetterEvidenceCard } from '../components/LetterEvidenceCard';
import { LetterPreviewCard } from '../components/LetterPreviewCard';
import { LetterQualityCard } from '../components/LetterQualityCard';
import { LetterWarningsCard } from '../components/LetterWarningsCard';
import { useMotivationLetters } from '../state/MotivationLettersContext';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'MotivationLetterDetail'>>;

export function MotivationLetterDetailScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { findByApplication, loadLetter, updateLetter, isLoadingLetter, isUpdating, error } = useMotivationLetters();
  const letter = findByApplication(route.params.applicationId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(letter?.content ?? '');
  const [copied, setCopied] = useState(false);
  const dirty = editing && Boolean(letter) && draft !== letter?.content;

  useEffect(() => {
    if (!letter) void loadLetter(route.params.applicationId);
  }, [letter, loadLetter, route.params.applicationId]);

  usePreventRemove(dirty, ({ data }) => {
    Alert.alert('Modifications non enregistrees', 'Quitter sans enregistrer cette version ?', [
      { text: 'Continuer l edition', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  if (isLoadingLetter && !letter) return <Screen><LoadingState label="Chargement de la lettre..." /></Screen>;
  if (!letter) return <Screen><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><ErrorState message={error || 'Cette lettre est introuvable.'} onRetry={() => void loadLetter(route.params.applicationId, true)} /></Screen>;

  const save = async () => {
    const updated = await updateLetter(letter.applicationId, draft);
    if (updated) setEditing(false);
  };

  return <Screen>
    <View style={styles.toolbar}><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><Text style={styles.toolbarTitle}>Lettre de motivation</Text><IconButton icon={editing ? 'close' : 'create-outline'} label={editing ? 'Annuler' : 'Modifier'} onPress={() => { setDraft(letter.content); setEditing((value) => !value); }} /></View>
    <GlassCard accent><View style={styles.badges}><AppBadge label={getLetterToneLabel(letter.tone)} tone="violet" /><AppBadge label={letter.generatedByAI ? 'Generee par IA' : 'Modifiee manuellement'} tone={letter.generatedByAI ? 'info' : 'neutral'} /></View><Text style={styles.title}>{letter.offer?.title ?? 'Offre indisponible'}</Text><Text style={styles.company}>{letter.offer?.company.companyName ?? 'Entreprise non renseignee'}</Text>{letter.updatedAt ? <Text style={styles.date}>Mise a jour le {formatDate(letter.updatedAt)}</Text> : null}</GlassCard>
    {copied ? <StatusMessage tone="success" message="Lettre copiee dans le presse-papiers." /> : null}
    {error ? <StatusMessage tone="error" message={error} /> : null}
    {editing ? <GlassCard><SectionHeader title="Modifier le texte" subtitle="Les controles IA ne s appliquent pas automatiquement a vos changements" /><TextInput accessibilityLabel="Contenu de la lettre" maxLength={10_000} multiline onChangeText={setDraft} selectionColor={theme.colors.primary} style={styles.editor} textAlignVertical="top" value={draft} /><Text style={styles.counter}>{draft.length} / 10 000 caracteres</Text><View style={styles.editActions}><GradientButton disabled={!draft.trim() || !dirty} icon="save-outline" label="Enregistrer" loading={isUpdating} onPress={() => void save()} /><GradientButton icon="close" label="Annuler" onPress={() => { setDraft(letter.content); setEditing(false); }} variant="secondary" /></View></GlassCard> : <LetterPreviewCard content={letter.content} title="Contenu complet" />}
    {!editing ? <LetterActions content={letter.content} onCopied={() => setCopied(true)} /> : null}
    {!letter.generatedByAI ? <StatusMessage tone="info" message="Cette lettre a ete modifiee manuellement. Les controles qualite eventuels correspondent uniquement a la version generee initialement." /> : null}
    {letter.v2 && letter.generatedByAI ? <><LetterQualityCard metadata={letter.v2} /><LetterEvidenceCard metadata={letter.v2} /><LetterWarningsCard warnings={letter.v2.warnings} /></> : null}
    {letter.offerId ? <GradientButton icon="briefcase-outline" label="Voir l offre" onPress={() => navigation.navigate('OfferDetail', { offerId: letter.offerId! })} variant="secondary" /> : null}
  </Screen>;
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const createStyles = (theme: AppTheme) => StyleSheet.create({
  toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  title: { marginTop: theme.spacing.lg, color: theme.colors.textPrimary, ...theme.typography.heading },
  company: { marginTop: theme.spacing.xs, color: theme.colors.textSecondary, ...theme.typography.body },
  date: { marginTop: theme.spacing.md, color: theme.colors.textMuted, ...theme.typography.caption },
  editor: { minHeight: 340, marginTop: theme.spacing.lg, padding: theme.spacing.lg, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.input, color: theme.colors.textPrimary, ...theme.typography.body, lineHeight: 25 },
  counter: { marginTop: theme.spacing.sm, color: theme.colors.textMuted, ...theme.typography.caption, textAlign: 'right' },
  editActions: { marginTop: theme.spacing.lg, gap: theme.spacing.sm },
});
