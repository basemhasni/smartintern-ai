import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';

export function LetterWarningsCard({ warnings }: { warnings: string[] }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  if (!warnings.length) return null;
  return <GlassCard variant="soft"><SectionHeader title="Points d attention" subtitle="Ces avertissements ne bloquent pas la consultation" /><View style={styles.list}>{warnings.map((warning) => <Text key={warning} style={styles.warning}>• {warning}</Text>)}</View></GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  list: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
  warning: { color: theme.colors.warning, ...theme.typography.body },
});

