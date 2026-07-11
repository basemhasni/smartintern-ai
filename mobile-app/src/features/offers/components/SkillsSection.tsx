import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';

type Props = { required: string[]; optional: string[] };

export function SkillsSection({ required, optional }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return (
    <GlassCard>
      <SectionHeader title="Competences" subtitle="Criteres renseignes par l entreprise" />
      <Text style={styles.label}>REQUISES</Text>
      {required.length ? <SkillList skills={required} tone="info" /> : <Text style={styles.empty}>Aucune competence requise renseignee.</Text>}
      {optional.length ? <><Text style={styles.label}>OPTIONNELLES</Text><SkillList skills={optional} tone="neutral" /></> : null}
    </GlassCard>
  );
}

function SkillList({ skills, tone }: { skills: string[]; tone: 'info' | 'neutral' }) {
  return <View style={stylesShared.list}>{skills.map((skill) => <AppBadge key={skill} label={skill} tone={tone} />)}</View>;
}

const stylesShared = StyleSheet.create({ list: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } });
const createStyles = (theme: AppTheme) => StyleSheet.create({
  label: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, color: theme.colors.textMuted, ...theme.typography.overline },
  empty: { marginTop: theme.spacing.sm, color: theme.colors.textSecondary, ...theme.typography.body },
});
