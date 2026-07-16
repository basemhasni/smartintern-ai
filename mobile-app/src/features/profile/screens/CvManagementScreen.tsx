import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { confirmAction } from '@/shared/utils/confirmAction';
import { CvStatusCard } from '../components/CvStatusCard';
import { CvUploadProgress } from '../components/CvUploadProgress';
import type { CvDocument } from '../models/cvDocument';
import { useStudentProfile } from '../state/StudentProfileContext';
import { formatFileSize } from '../utils/validateCvFile';

type Props = NativeStackScreenProps<RootStackParamList, 'CvManagement'>;

export function CvManagementScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const profile = useStudentProfile();

  const confirmUpload = () => {
    if (!profile.selectedFile || profile.uploadError) return;
    const title = profile.latestCv ? 'Ajouter un nouveau CV ?' : 'Envoyer ce CV ?';
    const message = profile.latestCv
      ? 'Ce document deviendra le CV le plus recent pour les prochaines analyses. Votre ancien CV restera dans l historique jusqu a sa suppression.'
      : 'Le document sera enregistre puis analyse automatiquement par SmartIntern AI.';
    confirmAction({ title, message, onConfirm: uploadAndOpen });
  };

  const uploadAndOpen = async () => {
    const cv = await profile.uploadCv();
    if (cv) navigation.navigate('CvAnalysis', { cvId: cv.id });
  };

  const confirmDelete = (cv: CvDocument) => confirmAction({
    title: 'Supprimer ce CV ?',
    message: 'Le document et son analyse seront supprimes. Cette action est definitive.',
    confirmLabel: 'Supprimer',
    destructive: true,
    onConfirm: () => profile.deleteCv(cv.id).then(() => undefined),
  });

  if (profile.isLoading && !profile.cvs.length) {
    return <Screen><LoadingState label="Chargement de vos CV..." /></Screen>;
  }

  return (
    <Screen>
      <View style={styles.toolbar}>
        <IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} />
        <Text style={styles.toolbarTitle}>Mes CV</Text><View style={styles.spacer} />
      </View>
      <GlassCard accent>
        <SectionHeader title="Curriculum vitae" subtitle="Le CV le plus recent alimente vos prochaines analyses IA." />
        <View style={styles.rules}>
          <Rule icon="document-outline" text="PDF ou DOCX uniquement" />
          <Rule icon="archive-outline" text="Taille maximale : 5 Mo" />
          <Rule icon="sparkles-outline" text="Analyse automatique apres envoi" />
        </View>
      </GlassCard>

      {profile.error ? <StatusMessage tone="error" message={profile.error} /> : null}
      {profile.successMessage ? <StatusMessage tone="success" message={profile.successMessage} /> : null}
      <CvStatusCard cv={profile.latestCv} />
      {profile.latestCv?.analysis ? <GradientButton icon="analytics-outline" label="Consulter la derniere analyse" variant="secondary" onPress={() => navigation.navigate('CvAnalysis', { cvId: profile.latestCv!.id })} /> : null}

      <GlassCard>
        <SectionHeader title="Ajouter un CV" subtitle="Selectionnez le document avant de confirmer son envoi." />
        <View style={styles.uploadActions}>
          <GradientButton icon="folder-open-outline" label={profile.selectedFile ? 'Choisir un autre fichier' : 'Choisir un fichier'} loading={profile.isSelectingFile} variant="secondary" onPress={() => void profile.selectCvFile()} />
          {profile.selectedFile ? (
            <View style={styles.selection}>
              <View style={styles.fileIcon}><Ionicons color={theme.colors.primary} name="document-text-outline" size={22} /></View>
              <View style={styles.flex}><Text numberOfLines={2} style={styles.fileName}>{profile.selectedFile.name}</Text><Text style={styles.meta}>{formatFileSize(profile.selectedFile.size)}</Text></View>
              <IconButton icon="close" label="Retirer le fichier" onPress={profile.clearSelectedFile} />
            </View>
          ) : null}
          {profile.uploadError ? <StatusMessage tone="error" message={profile.uploadError} /> : null}
          {profile.isUploading && profile.selectedFile ? <CvUploadProgress fileName={profile.selectedFile.name} /> : null}
          <GradientButton disabled={!profile.selectedFile || Boolean(profile.uploadError)} icon="cloud-upload-outline" label="Envoyer et analyser" loading={profile.isUploading} onPress={confirmUpload} />
        </View>
      </GlassCard>

      <SectionHeader title="Historique" subtitle={`${profile.cvs.length} document${profile.cvs.length > 1 ? 's' : ''}`} />
      {profile.cvs.length ? profile.cvs.map((cv, index) => (
        <GlassCard key={cv.id} variant="soft">
          <View style={styles.historyRow}>
            <View style={styles.fileIcon}><Ionicons color={theme.colors.primary} name="document-text-outline" size={22} /></View>
            <View style={styles.flex}>
              <View style={styles.badgeRow}>{index === 0 ? <AppBadge label="Plus recent" tone="success" /> : null}<AppBadge label={cv.status === 'ANALYZED' ? 'Analyse disponible' : cv.status === 'ANALYSIS_FAILED' ? 'Analyse incomplete' : 'Importe'} tone={cv.status === 'ANALYZED' ? 'success' : 'warning'} /></View>
              <Text numberOfLines={2} style={styles.fileName}>{cv.fileName}</Text>
              <Text style={styles.meta}>{formatFileSize(cv.fileSize)}{cv.uploadedAt ? ` - ${formatDate(cv.uploadedAt)}` : ''}</Text>
            </View>
          </View>
          <View style={styles.rowActions}>
            <GradientButton disabled={!cv.analysis} icon="analytics-outline" label="Analyse" variant="secondary" onPress={() => navigation.navigate('CvAnalysis', { cvId: cv.id })} />
            <Pressable accessibilityLabel={`Supprimer ${cv.fileName}`} accessibilityRole="button" disabled={profile.isDeleting} onPress={() => confirmDelete(cv)} style={styles.deleteButton}>
              <Ionicons color={theme.colors.danger} name="trash-outline" size={19} /><Text style={styles.deleteText}>Supprimer</Text>
            </Pressable>
          </View>
        </GlassCard>
      )) : <GlassCard variant="soft"><Text style={styles.empty}>Aucun document enregistre pour le moment.</Text></GlassCard>}
    </Screen>
  );
}

function Rule({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const { theme } = useAppTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}><Ionicons color={theme.colors.emerald} name={icon} size={18} /><Text style={{ flex: 1, color: theme.colors.textSecondary, ...theme.typography.caption }}>{text}</Text></View>;
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
const createStyles = (theme: AppTheme) => StyleSheet.create({
  toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label }, spacer: { width: 44 },
  rules: { marginTop: theme.spacing.lg, gap: theme.spacing.sm }, uploadActions: { marginTop: theme.spacing.lg, gap: theme.spacing.md },
  selection: { minHeight: 68, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  fileIcon: { width: 44, height: 44, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted }, flex: { flex: 1, minWidth: 0, gap: theme.spacing.xs }, fileName: { color: theme.colors.textPrimary, ...theme.typography.label }, meta: { color: theme.colors.textMuted, ...theme.typography.caption },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }, badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }, rowActions: { marginTop: theme.spacing.lg, gap: theme.spacing.sm },
  deleteButton: { minHeight: 48, borderRadius: theme.radius.md, borderWidth: 1, borderColor: `${theme.colors.danger}40`, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }, deleteText: { color: theme.colors.danger, ...theme.typography.label }, empty: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
});
