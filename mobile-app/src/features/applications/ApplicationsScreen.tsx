import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { RootStackParamList, StudentTabParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBackground } from '@/shared/components/AppBackground';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { GradientButton } from '@/shared/components/GradientButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { SearchField } from '@/shared/components/SearchField';
import { ApplicationCard } from './components/ApplicationCard';
import { ApplicationSummaryCard } from './components/ApplicationSummaryCard';
import { getApplicationStatusConfig } from './config/applicationStatusConfig';
import { applicationStatuses, type ApplicationStatusFilter } from './models/applicationStatus';
import { useApplications } from './state/ApplicationsContext';

type Props = BottomTabScreenProps<StudentTabParamList, 'Applications'>;

export function ApplicationsScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const {
    applications,
    filteredApplications,
    searchQuery,
    selectedStatus,
    isLoading,
    isRefreshing,
    error,
    refresh,
    setSearchQuery,
    setStatusFilter,
  } = useApplications();
  const counts = Object.fromEntries(applicationStatuses.map((status) => [
    status,
    applications.filter((application) => application.status === status).length,
  ]));

  if (isLoading && !applications.length) {
    return <AppBackground><LoadingState label="Chargement des candidatures..." /></AppBackground>;
  }

  if (error && !applications.length) {
    return <AppBackground><ErrorState message={error} onRetry={() => void refresh()} /></AppBackground>;
  }

  const filters: { label: string; value: ApplicationStatusFilter }[] = [
    { label: 'Toutes', value: 'ALL' },
    ...applicationStatuses.map((status) => ({
      label: getApplicationStatusConfig(status).shortLabel,
      value: status,
    })),
  ];

  const header = (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>SUIVI</Text>
        <Text style={styles.title}>Mes candidatures</Text>
        <Text style={styles.subtitle}>Retrouvez les decisions et les offres auxquelles vous avez postule.</Text>
      </View>

      {applications.length ? (
        <ScrollView contentContainerStyle={styles.summaries} horizontal showsHorizontalScrollIndicator={false}>
          <ApplicationSummaryCard icon="documents-outline" label="Total" value={applications.length} />
          <ApplicationSummaryCard icon="paper-plane-outline" label="Envoyees" value={counts.SENT ?? 0} />
          <ApplicationSummaryCard color={theme.colors.warning} icon="hourglass-outline" label="En etude" value={counts.PENDING ?? 0} />
          <ApplicationSummaryCard color={theme.colors.success} icon="checkmark-circle-outline" label="Acceptees" value={counts.ACCEPTED ?? 0} />
          <ApplicationSummaryCard color={theme.colors.danger} icon="close-circle-outline" label="Refusees" value={counts.REJECTED ?? 0} />
        </ScrollView>
      ) : null}

      {applications.length ? (
        <>
          <SearchField onChangeText={setSearchQuery} placeholder="Offre, entreprise ou localisation" returnKeyType="search" value={searchQuery} />
          <ScrollView accessibilityRole="tablist" contentContainerStyle={styles.filters} horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => {
              const active = selectedStatus === filter.value;
              return (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  key={filter.value}
                  onPress={() => setStatusFilter(filter.value)}
                  style={[styles.filter, active && styles.filterActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.resultRow}>
            <Text style={styles.resultCount}>{filteredApplications.length} resultat{filteredApplications.length > 1 ? 's' : ''}</Text>
            <Pressable accessibilityLabel="Rafraichir les candidatures" accessibilityRole="button" onPress={() => void refresh()} style={styles.refreshButton}>
              <Ionicons color={theme.colors.primary} name="refresh" size={18} />
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );

  const hasFilters = Boolean(searchQuery.trim()) || selectedStatus !== 'ALL';

  return (
    <AppBackground>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredApplications}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(application) => application.id || application.offerId}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={(
          <View style={styles.empty}>
            <EmptyState
              icon={hasFilters ? 'search-outline' : 'paper-plane-outline'}
              message={hasFilters ? 'Modifiez votre recherche ou choisissez un autre statut.' : 'Decouvrez les offres correspondant a votre profil et postulez directement depuis l application.'}
              title={hasFilters ? 'Aucun resultat' : 'Aucune candidature pour le moment'}
            />
            {hasFilters ? (
              <GradientButton label="Reinitialiser les filtres" onPress={() => { setSearchQuery(''); setStatusFilter('ALL'); }} variant="secondary" />
            ) : (
              <GradientButton icon="briefcase-outline" label="Decouvrir les offres" onPress={() => navigation.navigate('Offers')} />
            )}
          </View>
        )}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={isRefreshing} tintColor={theme.colors.primary} onRefresh={() => void refresh()} />}
        renderItem={({ item }) => <ApplicationCard application={item} onPress={() => rootNavigation?.navigate('ApplicationDetail', { applicationId: item.id })} />}
        showsVerticalScrollIndicator={false}
      />
    </AppBackground>
  );
}

const createStyles = (theme: AppTheme, width: number) => StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: width < 380 ? theme.spacing.md : theme.spacing.lg, paddingTop: theme.spacing.xl, paddingBottom: 116, flexGrow: 1 },
  header: { gap: theme.spacing.lg, marginBottom: theme.spacing.lg },
  titleBlock: { gap: theme.spacing.xs },
  eyebrow: { color: theme.colors.primary, ...theme.typography.overline },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  subtitle: { color: theme.colors.textSecondary, ...theme.typography.body },
  summaries: { gap: theme.spacing.sm, paddingRight: theme.spacing.lg },
  filters: { gap: theme.spacing.sm, paddingRight: theme.spacing.lg },
  filter: { minHeight: 40, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border },
  filterActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { color: theme.colors.textSecondary, ...theme.typography.caption, fontWeight: '600' },
  filterTextActive: { color: theme.colors.white },
  resultRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
  resultCount: { color: theme.colors.textPrimary, ...theme.typography.label },
  refreshButton: { width: 40, height: 40, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  separator: { height: theme.spacing.md },
  empty: { gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
});
