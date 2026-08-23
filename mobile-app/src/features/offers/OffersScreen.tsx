import { useMemo, useState } from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { RootStackParamList, StudentTabParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBackground } from '@/shared/components/AppBackground';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { SearchField } from '@/shared/components/SearchField';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { OfferCard } from './components/OfferCard';
import type { Offer } from './models/offer';
import { useOffers } from './state/OffersContext';

type Props = Readonly<BottomTabScreenProps<StudentTabParamList, 'Offers'>>;
type FilterMode = 'all' | 'matched' | 'hybrid';

const filters: { label: string; value: FilterMode }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Analysées', value: 'matched' },
  { label: 'Hybride / distance', value: 'hybrid' },
];

const isHybridOrRemote = (offer: Offer) =>
  /hybride|remote|distance|télétravail/i.test(offer.location ?? '');

const matchesQuery = (offer: Offer, query: string) => {
  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  if (!normalizedQuery) return true;

  return [
    offer.title,
    offer.company.companyName,
    offer.location,
    ...offer.requiredSkills,
    ...offer.optionalSkills,
  ].some((value) => value?.toLocaleLowerCase('fr').includes(normalizedQuery));
};

export function OffersScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const {
    offers,
    isLoading,
    isRefreshing,
    error,
    recommendationsMessage,
    refresh,
  } = useOffers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filteredOffers = useMemo(() => offers.filter((offer) => {
    if (!matchesQuery(offer, searchQuery)) return false;
    if (filterMode === 'matched') return Boolean(offer.match?.isAvailable);
    if (filterMode === 'hybrid') return isHybridOrRemote(offer);
    return true;
  }), [filterMode, offers, searchQuery]);

  const header = (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>OPPORTUNITÉS</Text>
        <Text style={styles.title}>Offres disponibles</Text>
        <Text style={styles.subtitle}>Toutes les offres publiées par les entreprises SmartIntern AI.</Text>
      </View>
      <SearchField
        onChangeText={setSearchQuery}
        placeholder="Métier, entreprise, lieu ou compétence"
        returnKeyType="search"
        value={searchQuery}
      />
      <View accessibilityRole="tablist" style={styles.filters}>
        {filters.map((filter) => {
          const active = filterMode === filter.value;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={filter.value}
              onPress={() => setFilterMode(filter.value)}
              style={[styles.filter, active && styles.filterActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {recommendationsMessage ? <StatusMessage message={recommendationsMessage} tone="info" /> : null}
      <View style={styles.resultRow}>
        <Text style={styles.resultCount}>{filteredOffers.length} offre{filteredOffers.length > 1 ? 's' : ''}</Text>
        <Text style={styles.sortCopy}>Plus récentes d’abord</Text>
      </View>
    </View>
  );

  if (isLoading && !offers.length) {
    return <AppBackground><LoadingState label="Chargement des offres publiées..." /></AppBackground>;
  }

  if (error && !offers.length) {
    return <AppBackground><ErrorState message={error} onRetry={() => void refresh()} /></AppBackground>;
  }

  return (
    <AppBackground>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredOffers}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(offer) => offer.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={(
          <EmptyState
            icon={searchQuery || filterMode !== 'all' ? 'search-outline' : 'briefcase-outline'}
            message={searchQuery || filterMode !== 'all'
              ? 'Modifiez votre recherche ou retirez un filtre.'
              : 'Aucune entreprise n’a publié d’offre pour le moment.'}
            title={searchQuery || filterMode !== 'all' ? 'Aucun résultat' : 'Aucune offre disponible'}
          />
        )}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={isRefreshing} tintColor={theme.colors.primary} onRefresh={() => void refresh()} />}
        renderItem={({ item }) => (
          <OfferCard
            offer={item}
            onPress={() => rootNavigation?.navigate('OfferDetail', { offerId: item.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </AppBackground>
  );
}

const createStyles = (theme: AppTheme, width: number) => StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: width < 380 ? theme.spacing.md : theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: 116,
    flexGrow: 1,
  },
  header: { gap: theme.spacing.lg, marginBottom: theme.spacing.lg },
  titleBlock: { gap: theme.spacing.xs },
  eyebrow: { color: theme.colors.primary, ...theme.typography.overline },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  subtitle: { color: theme.colors.textSecondary, ...theme.typography.body },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  filter: { minHeight: 40, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border },
  filterActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.textSecondary, ...theme.typography.caption, fontWeight: '600' },
  filterTextActive: { color: theme.colors.white },
  resultRow: { marginTop: theme.spacing.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
  resultCount: { color: theme.colors.textPrimary, ...theme.typography.label },
  sortCopy: { color: theme.colors.textMuted, ...theme.typography.caption },
  separator: { height: theme.spacing.md },
});
