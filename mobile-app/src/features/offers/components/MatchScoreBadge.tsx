import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import type { OfferMatch } from '../models/offerMatch';

const decisionCopy: Record<string, string> = {
  STRONG_MATCH: 'Forte compatibilité',
  GOOD_MATCH: 'Bonne compatibilité',
  PARTIAL_MATCH: 'Compatibilité partielle',
  LOW_MATCH: 'Compatibilité faible',
  VERY_LOW_MATCH: 'Compatibilité très faible',
  INSUFFICIENT_DATA: 'Données insuffisantes',
};

const getTone = (match: OfferMatch, theme: AppTheme) => {
  switch (match.decisionLabel) {
    case 'STRONG_MATCH':
      return { color: theme.colors.success, backgroundColor: `${theme.colors.success}16` };
    case 'GOOD_MATCH':
      return { color: theme.colors.info, backgroundColor: `${theme.colors.info}16` };
    case 'PARTIAL_MATCH':
    case 'LOW_MATCH':
    case 'VERY_LOW_MATCH':
      return { color: theme.colors.warning, backgroundColor: `${theme.colors.warning}16` };
    default:
      return { color: theme.colors.textSecondary, backgroundColor: theme.colors.surfaceMuted };
  }
};

export const getDecisionLabel = (match?: OfferMatch) => {
  if (!match?.isAvailable) return 'Analyse non disponible';
  if (match.decisionLabel) return decisionCopy[match.decisionLabel] ?? match.decisionLabel;
  return 'Analyse disponible';
};

export function MatchScoreBadge({ match, compact = false }: { match?: OfferMatch; compact?: boolean }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  if (!match?.isAvailable || match.score === undefined) {
    return (
      <View style={[styles.badge, styles.unavailable]}>
        <Ionicons color={theme.colors.textMuted} name="sparkles-outline" size={13} />
        <Text style={styles.unavailableText}>Analyse non disponible</Text>
      </View>
    );
  }

  const tone = getTone(match, theme);
  return (
    <View
      accessibilityLabel={`${match.score} pour cent. ${getDecisionLabel(match)}`}
      style={[styles.badge, { backgroundColor: tone.backgroundColor }]}
    >
      <Ionicons color={tone.color} name="sparkles" size={13} />
      <Text style={[styles.score, { color: tone.color }]}>{match.score}%</Text>
      {!compact ? <Text numberOfLines={1} style={[styles.decision, { color: tone.color }]}>{getDecisionLabel(match)}</Text> : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    minHeight: 30,
    maxWidth: '100%',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  unavailable: { backgroundColor: theme.colors.surfaceMuted },
  unavailableText: { color: theme.colors.textMuted, ...theme.typography.caption },
  score: { ...theme.typography.caption, fontWeight: '800' },
  decision: { flexShrink: 1, ...theme.typography.caption, fontWeight: '600' },
});
