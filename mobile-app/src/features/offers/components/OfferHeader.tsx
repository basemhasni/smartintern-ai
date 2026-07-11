import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import type { Offer } from '../models/offer';

type Props = { offer: Offer };

export function OfferHeader({ offer }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const facts = [
    { icon: 'location-outline' as const, value: offer.location || 'Non renseignee' },
    { icon: 'time-outline' as const, value: offer.duration || 'Non renseignee' },
    { icon: 'calendar-outline' as const, value: formatDate(offer.startDate) || 'Non renseignee' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <View accessibilityLabel={`Logo ${offer.company.companyName}`} style={styles.logo}>
          <Text style={styles.initial}>{offer.company.companyName.charAt(0).toUpperCase() || 'S'}</Text>
        </View>
        <View style={styles.copy}>
          <AppBadge label="Offre publiee" tone="success" />
          <Text style={styles.title}>{offer.title}</Text>
          <Text style={styles.company}>
            {offer.company.companyName}{offer.company.sector ? ` · ${offer.company.sector}` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.facts}>
        {facts.map((fact) => (
          <View key={fact.icon} style={styles.fact}>
            <Ionicons color={theme.colors.primary} name={fact.icon} size={18} />
            <Text numberOfLines={2} style={styles.factText}>{fact.value}</Text>
          </View>
        ))}
      </View>
      {offer.createdAt ? <Text style={styles.date}>Publiee le {formatDate(offer.createdAt)}</Text> : null}
    </View>
  );
}

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { gap: theme.spacing.lg },
  identity: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.lg },
  logo: { width: 64, height: 64, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderBright, ...theme.shadowSmall },
  initial: { color: theme.colors.primary, fontSize: 25, lineHeight: 30, fontWeight: '800' },
  copy: { flex: 1, minWidth: 0, alignItems: 'flex-start', gap: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  company: { color: theme.colors.textSecondary, ...theme.typography.body },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  fact: { minHeight: 48, flexGrow: 1, flexBasis: 130, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border },
  factText: { flex: 1, minWidth: 0, color: theme.colors.textSecondary, ...theme.typography.caption, fontWeight: '600' },
  date: { color: theme.colors.textMuted, ...theme.typography.caption },
});
