import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { getLetterToneLabel } from '../config/letterToneConfig';
import type { MotivationLetter } from '../models/motivationLetter';

export function LetterCard({ letter, onPress }: { letter: MotivationLetter; onPress: () => void }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <Pressable accessibilityLabel={`Ouvrir la lettre pour ${letter.offer?.title ?? 'une offre'}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={styles.icon}><Ionicons color={theme.colors.violet} name="document-text-outline" size={23} /></View><View style={styles.copy}><Text numberOfLines={2} style={styles.title}>{letter.offer?.title ?? 'Offre indisponible'}</Text><Text numberOfLines={1} style={styles.company}>{letter.offer?.company.companyName ?? 'Entreprise non renseignee'}</Text><View style={styles.meta}><AppBadge label={getLetterToneLabel(letter.tone)} tone="violet" /><AppBadge label={letter.generatedByAI ? 'Version IA' : 'Modifiee'} tone={letter.generatedByAI ? 'info' : 'neutral'} /></View>{letter.updatedAt ? <Text style={styles.date}>Mise a jour le {formatDate(letter.updatedAt)}</Text> : null}</View><Ionicons color={theme.colors.textMuted} name="chevron-forward" size={20} /></Pressable>;
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: { minHeight: 124, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.lg, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, ...theme.shadowSmall },
  icon: { width: 48, height: 48, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: `${theme.colors.violet}14` },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  title: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  company: { color: theme.colors.textSecondary, ...theme.typography.body },
  meta: { marginTop: theme.spacing.xs, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  date: { color: theme.colors.textMuted, ...theme.typography.caption },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});

