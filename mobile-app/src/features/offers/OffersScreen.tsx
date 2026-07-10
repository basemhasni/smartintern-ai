import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList, StudentTabParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { OfferCard } from '@/shared/components/OfferCard';
import { Screen } from '@/shared/components/Screen';
import { SearchField } from '@/shared/components/SearchField';

type Props = BottomTabScreenProps<StudentTabParamList, 'Offers'>;
const offers = [
  { id: 'nexa', company: 'Nexa Labs', title: 'Stage Frontend Engineer', location: 'Tunis · Hybride', match: 94, skills: ['React', 'TypeScript'] },
  { id: 'data', company: 'DataPulse', title: 'Stage AI Software Engineer', location: 'Ariana · Sur site', match: 88, skills: ['Python', 'FastAPI'] },
  { id: 'cloud', company: 'CloudNova', title: 'Stage DevOps & Cloud', location: 'Lac 2 · Hybride', match: 81, skills: ['Docker', 'CI/CD'] },
];

export function OffersScreen({ navigation }: Props) {
  // TODO Step 3: connect offers API.
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  return <Screen eyebrow="Opportunités" title="Offres recommandées" subtitle="Une sélection classée selon la compatibilité avec votre profil."><SearchField placeholder="Métier, compétence ou entreprise" /><View style={styles.filters}>{['Pour vous', 'Hybride', '80%+ match'].map((filter, index) => <Pressable key={filter} style={[styles.filter, index === 0 && styles.filterActive]}><Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{filter}</Text></Pressable>)}</View><View style={styles.resultRow}><Text style={styles.resultCount}>3 opportunités</Text><Text style={styles.sort}>Pertinence</Text></View>{offers.map((offer) => <OfferCard key={offer.id} {...offer} onPress={() => rootNavigation?.navigate('OfferDetail', { offerId: offer.id })} />)}</Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  filter: { minHeight: 38, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border },
  filterActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.textSecondary, ...theme.typography.caption, fontWeight: '600' },
  filterTextActive: { color: theme.colors.white },
  resultRow: { marginTop: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultCount: { color: theme.colors.textPrimary, ...theme.typography.label },
  sort: { color: theme.colors.textMuted, ...theme.typography.caption },
});
