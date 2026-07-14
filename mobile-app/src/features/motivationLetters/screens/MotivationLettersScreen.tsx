import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBackground } from '@/shared/components/AppBackground';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { LetterCard } from '../components/LetterCard';
import { useMotivationLetters } from '../state/MotivationLettersContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MotivationLetters'>;

export function MotivationLettersScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);
  const { letters, isLoadingLetters, error, loadLetters } = useMotivationLetters();

  useFocusEffect(useCallback(() => {
    void loadLetters();
  }, [loadLetters]));

  return <AppBackground><FlatList
    contentContainerStyle={styles.content}
    data={letters}
    keyExtractor={(item) => item.id}
    refreshControl={<RefreshControl refreshing={isLoadingLetters && letters.length > 0} tintColor={theme.colors.primary} onRefresh={() => void loadLetters(true)} />}
    ListHeaderComponent={<View style={styles.header}><View style={styles.toolbar}><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><GradientButton icon="add" label="Creer" onPress={() => navigation.navigate('MotivationLetterGenerator')} style={styles.createButton} /></View><Text style={styles.eyebrow}>CANDIDATURES</Text><Text style={styles.title}>Mes lettres de motivation</Text><Text style={styles.subtitle}>Retrouvez les lettres enregistrees automatiquement lors de leur generation.</Text></View>}
    ListEmptyComponent={isLoadingLetters ? <LoadingState label="Chargement des lettres..." /> : error ? <ErrorState message={error} onRetry={() => void loadLetters(true)} /> : <View style={styles.empty}><EmptyState icon="document-text-outline" title="Aucune lettre enregistree" message="Choisissez une candidature existante pour generer une lettre fondee sur votre profil reel." /><GradientButton icon="documents-outline" label="Choisir une candidature" onPress={() => navigation.navigate('MotivationLetterGenerator')} /></View>}
    ItemSeparatorComponent={() => <View style={styles.separator} />}
    renderItem={({ item }) => <LetterCard letter={item} onPress={() => navigation.navigate('MotivationLetterDetail', { applicationId: item.applicationId })} />}
    showsVerticalScrollIndicator={false}
  /></AppBackground>;
}

const createStyles = (theme: AppTheme, width: number) => StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: width < 380 ? theme.spacing.md : theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: 80, flexGrow: 1 },
  header: { marginBottom: theme.spacing.xl },
  toolbar: { minHeight: 54, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl },
  createButton: { width: 126 },
  eyebrow: { color: theme.colors.primary, ...theme.typography.overline },
  title: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary, ...theme.typography.title },
  subtitle: { marginTop: theme.spacing.sm, color: theme.colors.textSecondary, ...theme.typography.body },
  empty: { gap: theme.spacing.lg },
  separator: { height: theme.spacing.md },
});
