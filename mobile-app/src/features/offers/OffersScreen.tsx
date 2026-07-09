import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList, StudentTabParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { OfferCard } from '@/shared/components/OfferCard';
import { Screen } from '@/shared/components/Screen';

type Props = BottomTabScreenProps<StudentTabParamList, 'Offers'>;

const offers = [
  { id: 'nexa', company: 'Nexa Labs', title: 'Stage Frontend Engineer', location: 'Tunis · Hybride', match: 94, skills: ['React', 'TypeScript'] },
  { id: 'data', company: 'DataPulse', title: 'Stage AI Software Engineer', location: 'Ariana · Sur site', match: 88, skills: ['Python', 'FastAPI'] },
  { id: 'cloud', company: 'CloudNova', title: 'Stage DevOps & Cloud', location: 'Lac 2 · Hybride', match: 81, skills: ['Docker', 'CI/CD'] },
];

export function OffersScreen({ navigation }: Props) {
  // TODO Step 3: connect offers API.
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen title="Offres recommandées" subtitle="Des opportunités classées selon votre profil fictif.">
      <View style={styles.search}>
        <Ionicons color={theme.colors.textMuted} name="search-outline" size={20} />
        <TextInput placeholder="Métier, compétence, entreprise..." placeholderTextColor={theme.colors.textMuted} style={styles.input} />
      </View>
      <View style={styles.filters}>
        <AppBadge label="Pour vous" tone="info" />
        <AppBadge label="Hybride" tone="violet" />
        <AppBadge label="80%+ match" tone="success" />
      </View>
      {offers.map((offer) => (
        <OfferCard key={offer.id} {...offer} onPress={() => rootNavigation?.navigate('OfferDetail', { offerId: offer.id })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 50, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  input: { flex: 1, color: theme.colors.textPrimary, ...theme.typography.body },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
