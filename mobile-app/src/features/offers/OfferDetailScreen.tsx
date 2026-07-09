import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'OfferDetail'>;

export function OfferDetailScreen({ navigation }: Props) {
  // TODO Step 3: connect offers API.
  return (
    <Screen>
      <Pressable accessibilityLabel="Retour" onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons color={theme.colors.textPrimary} name="arrow-back" size={22} />
      </Pressable>
      <View style={styles.hero}>
        <AppBadge label="94% de compatibilité" tone="success" />
        <Text style={styles.title}>Stage Frontend Engineer</Text>
        <Text style={styles.company}>Nexa Labs · Tunis · Hybride</Text>
      </View>
      <GlassCard>
        <SectionHeader title="La mission" />
        <Text style={styles.body}>Contribuer à une plateforme SaaS moderne, construire des interfaces accessibles et collaborer avec une équipe produit expérimentée.</Text>
      </GlassCard>
      <GlassCard>
        <SectionHeader title="Compétences clés" />
        <View style={styles.skills}>
          {['React', 'TypeScript', 'REST API', 'Git'].map((skill) => <AppBadge key={skill} label={skill} tone="violet" />)}
        </View>
      </GlassCard>
      <GlassCard accent>
        <View style={styles.aiTitle}>
          <Ionicons color={theme.colors.cyan} name="sparkles" size={22} />
          <Text style={styles.aiHeading}>Lecture IA du profil</Text>
        </View>
        <Text style={styles.body}>Votre expérience React et vos projets TypeScript soutiennent fortement ce match. Analyse complète disponible à une étape ultérieure.</Text>
      </GlassCard>
      <GradientButton disabled icon="paper-plane-outline" label="Postuler bientôt" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
  hero: { gap: theme.spacing.sm, paddingVertical: theme.spacing.md },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  company: { color: theme.colors.textSecondary, ...theme.typography.body },
  body: { color: theme.colors.textSecondary, ...theme.typography.body, marginTop: theme.spacing.md },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.md },
  aiTitle: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  aiHeading: { color: theme.colors.textPrimary, ...theme.typography.heading },
});
