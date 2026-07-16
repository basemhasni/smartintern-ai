import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { CvDocument } from '../models/cvDocument';

export function CvAnalysisSummaryCard({ cv }: { cv: CvDocument }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const analysis = cv.analysis;
  return <GlassCard accent><SectionHeader title="Analyse du CV" subtitle="Informations detectees automatiquement" />{analysis?.summary ? <Text style={styles.summary}>{analysis.summary}</Text> : <Text style={styles.summary}>Aucun resume IA disponible.</Text>}<View style={styles.badges}>{cv.skills.slice(0, 8).map((skill) => <AppBadge key={skill} label={skill} tone="violet" />)}</View>{analysis ? <View style={styles.facts}><Text style={styles.fact}>Experience : {analysis.experienceLevelV2 || analysis.experienceLevel || 'Non estimee'}</Text><Text style={styles.fact}>Formation : {analysis.educationLevel || 'Non detectee'}</Text></View> : null}</GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({ summary: { marginTop: theme.spacing.lg, color: theme.colors.textSecondary, ...theme.typography.body }, badges: { marginTop: theme.spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }, facts: { marginTop: theme.spacing.lg, gap: theme.spacing.xs }, fact: { color: theme.colors.textMuted, ...theme.typography.caption } });

