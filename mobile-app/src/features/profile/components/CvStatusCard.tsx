import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { CvDocument } from '../models/cvDocument';
import { formatFileSize } from '../utils/validateCvFile';

const statusCopy = {
  UPLOADED: { label: 'Analyse en attente', tone: 'warning' as const },
  ANALYZED: { label: 'Analyse disponible', tone: 'success' as const },
  ANALYSIS_FAILED: { label: 'Analyse incomplete', tone: 'warning' as const },
};

export function CvStatusCard({ cv }: { cv: CvDocument | null }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <GlassCard><SectionHeader title="Curriculum vitae" />{cv ? <View style={styles.content}><View style={styles.fileIcon}><Ionicons color={theme.colors.primary} name="document-text-outline" size={24} /></View><View style={styles.copy}><Text numberOfLines={2} style={styles.name}>{cv.fileName}</Text><Text style={styles.meta}>{formatFileSize(cv.fileSize)}{cv.uploadedAt ? ` · ${formatDate(cv.uploadedAt)}` : ''}</Text><AppBadge label={statusCopy[cv.status].label} tone={statusCopy[cv.status].tone} /></View></View> : <View style={styles.empty}><Ionicons color={theme.colors.warning} name="document-outline" size={25} /><View style={styles.copy}><Text style={styles.name}>Aucun CV</Text><Text style={styles.meta}>Ajoutez un PDF ou DOCX pour activer les analyses IA.</Text></View></View>}</GlassCard>;
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { marginTop: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  empty: { marginTop: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  fileIcon: { width: 52, height: 52, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  name: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  meta: { color: theme.colors.textSecondary, ...theme.typography.caption },
});

