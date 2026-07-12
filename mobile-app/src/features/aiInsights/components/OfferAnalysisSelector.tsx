import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import type { Offer } from '@/features/offers/models/offer';
import { AppBadge } from '@/shared/components/AppBadge';

export function OfferAnalysisSelector({ offers, selectedId, onSelect }: { offers: Offer[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  return <ScrollView contentContainerStyle={styles.list} horizontal showsHorizontalScrollIndicator={false}>{offers.map((offer) => { const active = offer.id === selectedId; return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={offer.id} onPress={() => onSelect(offer.id)} style={[styles.card, active && styles.active]}><View style={styles.row}><Text numberOfLines={2} style={styles.title}>{offer.title}</Text>{offer.match?.isAvailable ? <AppBadge label={`${offer.match.score}%`} tone="success" /> : null}</View><Text numberOfLines={1} style={styles.company}>{offer.company.companyName}</Text><Text style={styles.state}>{offer.match?.isAvailable ? 'Analyse disponible' : 'A analyser'}</Text></Pressable>; })}</ScrollView>;
}
const createStyles = (theme: AppTheme) => StyleSheet.create({ list: { gap: theme.spacing.md, paddingRight: theme.spacing.lg }, card: { width: 245, minHeight: 126, padding: theme.spacing.lg, gap: theme.spacing.sm, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }, active: { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceStrong }, row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }, title: { flex: 1, minWidth: 0, color: theme.colors.textPrimary, ...theme.typography.label }, company: { color: theme.colors.textSecondary, ...theme.typography.caption }, state: { color: theme.colors.primary, ...theme.typography.caption, fontWeight: '700' } });
