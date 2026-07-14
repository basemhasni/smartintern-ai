import { StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { SectionHeader } from '@/shared/components/SectionHeader';

export function LetterPreviewCard({ content, title = 'Votre lettre' }: { content: string; title?: string }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <GlassCard accent><SectionHeader title={title} subtitle="Relisez toujours le contenu avant de l utiliser" /><Text selectable style={styles.content}>{content}</Text></GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  content: { marginTop: theme.spacing.lg, color: theme.colors.textPrimary, ...theme.typography.body, lineHeight: 26 },
});

