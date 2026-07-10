import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import type { Offer } from '../models/offer';
import type { OfferMatch } from '../models/offerMatch';
import { MatchScoreBadge } from './MatchScoreBadge';

type Props = {
  offer: Offer;
  match?: OfferMatch;
  onPress?: () => void;
  variant?: 'compact' | 'full';
};

const formatPublishedAt = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
};

function OfferCardComponent({ offer, match = offer.match, onPress, variant = 'full' }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const skills = [...offer.requiredSkills, ...offer.optionalSkills].slice(0, variant === 'compact' ? 2 : 3);
  const publishedAt = formatPublishedAt(offer.createdAt);
  const location = offer.location || 'Localisation non renseignée';

  return (
    <Pressable
      accessibilityHint="Ouvre le détail de l'offre"
      accessibilityLabel={`${offer.title}, ${offer.company.companyName}`}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <GlassCard style={[styles.card, variant === 'compact' && styles.compactCard]}>
        <View style={styles.top}>
          <View style={styles.companyIcon}>
            <Text style={styles.companyInitial}>{offer.company.companyName.charAt(0).toUpperCase() || 'S'}</Text>
          </View>
          <View style={styles.heading}>
            <Text numberOfLines={2} style={styles.title}>{offer.title}</Text>
            <Text numberOfLines={1} style={styles.company}>{offer.company.companyName}</Text>
          </View>
          <View style={styles.chevron}>
            <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </View>

        <View style={styles.metaLine}>
          <View style={styles.metaItem}>
            <Ionicons color={theme.colors.textMuted} name="location-outline" size={15} />
            <Text numberOfLines={1} style={styles.meta}>{location}</Text>
          </View>
          {offer.duration ? (
            <View style={styles.metaItem}>
              <Ionicons color={theme.colors.textMuted} name="time-outline" size={15} />
              <Text numberOfLines={1} style={styles.meta}>{offer.duration}</Text>
            </View>
          ) : null}
          {publishedAt && variant === 'full' ? (
            <View style={styles.metaItem}>
              <Ionicons color={theme.colors.textMuted} name="calendar-outline" size={15} />
              <Text style={styles.meta}>{publishedAt}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.matchRow}>
          <MatchScoreBadge compact={variant === 'compact'} match={match} />
          {match?.confidence ? <AppBadge label={`Confiance ${match.confidence.toLowerCase()}`} tone="neutral" /> : null}
        </View>

        {skills.length ? (
          <View style={styles.skills}>
            {skills.map((skill) => <AppBadge key={skill} label={skill} tone="neutral" />)}
          </View>
        ) : variant === 'full' ? (
          <Text style={styles.noSkills}>Compétences non renseignées</Text>
        ) : null}
      </GlassCard>
    </Pressable>
  );
}

export const OfferCard = memo(OfferCardComponent);

const createStyles = (theme: AppTheme) => StyleSheet.create({
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  card: { gap: theme.spacing.md },
  compactCard: { padding: theme.spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  companyIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  companyInitial: { color: theme.colors.primary, fontSize: 18, lineHeight: 22, fontWeight: '800' },
  heading: { flex: 1, minWidth: 0, gap: 3 },
  title: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  company: { color: theme.colors.textSecondary, ...theme.typography.caption },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  metaLine: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  metaItem: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  meta: { maxWidth: 190, color: theme.colors.textMuted, ...theme.typography.caption },
  matchRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing.sm },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  noSkills: { color: theme.colors.textMuted, ...theme.typography.caption },
});
