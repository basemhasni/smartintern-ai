import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StudentTabParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';

type Props = BottomTabScreenProps<StudentTabParamList, 'Profile'>;

const rows = [
  { icon: 'school-outline', label: 'Formation', value: 'Génie logiciel · 4e année' },
  { icon: 'code-slash-outline', label: 'Compétences', value: 'React, TypeScript, Python' },
  { icon: 'location-outline', label: 'Localisation', value: 'Tunis, Tunisie' },
] as const;

export function ProfileScreen({ navigation }: Props) {
  return (
    <Screen title="Mon profil" subtitle="La vitrine de votre potentiel professionnel.">
      <GlassCard accent style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>LM</Text></View>
        <Text style={styles.name}>Lina Mansour</Text>
        <Text style={styles.email}>lina.mansour@example.com</Text>
        <AppBadge label="Profil étudiant" tone="violet" />
      </GlassCard>
      <GlassCard style={styles.details}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Ionicons color={theme.colors.cyan} name={row.icon} size={21} />
            <View style={styles.copy}><Text style={styles.label}>{row.label}</Text><Text style={styles.value}>{row.value}</Text></View>
          </View>
        ))}
      </GlassCard>
      <Pressable
        onPress={() => navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] })}
        style={styles.logout}
      >
        <Ionicons color={theme.colors.danger} name="log-out-outline" size={20} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>
      <Text style={styles.placeholder}>Déconnexion simulée · Auth réelle prévue à l’étape 2.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: theme.spacing.sm },
  avatar: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.violet, marginBottom: theme.spacing.sm },
  avatarText: { color: theme.colors.white, ...theme.typography.title },
  name: { color: theme.colors.textPrimary, ...theme.typography.heading },
  email: { color: theme.colors.textSecondary, ...theme.typography.caption },
  details: { gap: theme.spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  copy: { flex: 1, gap: 2 },
  label: { color: theme.colors.textMuted, ...theme.typography.caption },
  value: { color: theme.colors.textPrimary, ...theme.typography.body },
  logout: { minHeight: 50, borderRadius: theme.radius.md, borderWidth: 1, borderColor: 'rgba(251,113,133,0.28)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, backgroundColor: 'rgba(251,113,133,0.08)' },
  logoutText: { color: theme.colors.danger, ...theme.typography.subheading },
  placeholder: { color: theme.colors.textMuted, ...theme.typography.caption, textAlign: 'center' },
});
