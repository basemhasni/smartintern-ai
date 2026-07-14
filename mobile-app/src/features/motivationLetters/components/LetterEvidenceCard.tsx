import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';
import type { MotivationLetterV2 } from '../models/motivationLetter';

export function LetterEvidenceCard({ metadata }: { metadata: MotivationLetterV2 }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <GlassCard><SectionHeader title="Preuves utilisees" subtitle="Elements verifiables retenus par Motivation Letter V2" />{metadata.usedSkills.length ? <View style={styles.badges}>{metadata.usedSkills.map((skill) => <AppBadge key={skill} label={skill} tone="success" />)}</View> : <Text style={styles.empty}>Aucune competence utilisee n a ete retournee.</Text>}{metadata.usedEvidence.length ? <View style={styles.list}>{metadata.usedEvidence.map((evidence, index) => <View key={`${evidence.skill ?? evidence.text}-${index}`} style={styles.item}><Text style={styles.itemTitle}>{evidence.skill || 'Preuve du profil'}</Text>{evidence.type || evidence.level ? <Text style={styles.meta}>{[evidence.type, evidence.level].filter(Boolean).join(' · ')}</Text> : null}{evidence.text ? <Text numberOfLines={3} style={styles.text}>{evidence.text}</Text> : null}</View>)}</View> : null}{metadata.missingSkillsHandled.length ? <View style={styles.section}><Text style={styles.sectionTitle}>Competences traitees avec prudence</Text><View style={styles.badges}>{metadata.missingSkillsHandled.map((skill) => <AppBadge key={skill} label={skill} tone="warning" />)}</View></View> : null}{metadata.avoidedClaims.length ? <View style={styles.section}><Text style={styles.sectionTitle}>Affirmations volontairement evitees</Text>{metadata.avoidedClaims.map((claim) => <Text key={claim} style={styles.bullet}>• {claim}</Text>)}</View> : null}</GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  badges: { marginTop: theme.spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  list: { marginTop: theme.spacing.lg, gap: theme.spacing.sm },
  item: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, gap: theme.spacing.xs },
  itemTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  meta: { color: theme.colors.primary, ...theme.typography.caption },
  text: { color: theme.colors.textSecondary, ...theme.typography.caption },
  section: { marginTop: theme.spacing.xl },
  sectionTitle: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  bullet: { marginTop: theme.spacing.sm, color: theme.colors.textSecondary, ...theme.typography.body },
  empty: { marginTop: theme.spacing.md, color: theme.colors.textMuted, ...theme.typography.body },
});

