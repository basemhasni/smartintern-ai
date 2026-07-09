import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';
import { getUserDisplayName, getUserInitials } from '@/features/auth/models/userModel';
import { useAuth } from '@/features/auth/state/AuthContext';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';

export function ConnectedProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const displayName = getUserDisplayName(user);

  const rows = [
    { icon: 'mail-outline', label: 'Email', value: user?.email ?? 'Non renseigne' },
    { icon: 'shield-checkmark-outline', label: 'Role', value: user?.role ?? 'STUDENT' },
    { icon: 'sparkles-outline', label: 'Statut mobile', value: 'Session restauree via /me' },
  ] as const;

  return (
    <Screen title="Mon profil" subtitle="La vitrine de votre potentiel professionnel.">
      <GlassCard accent style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{getUserInitials(user)}</Text></View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <AppBadge label="Profil etudiant" tone="violet" />
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
        disabled={isLoading}
        onPress={() => void logout()}
        style={({ pressed }) => [styles.logout, pressed && styles.pressed, isLoading && styles.disabled]}
      >
        <Ionicons color={theme.colors.danger} name="log-out-outline" size={20} />
        <Text style={styles.logoutText}>{isLoading ? 'Deconnexion...' : 'Se deconnecter'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: theme.spacing.sm },
  avatar: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.violet, marginBottom: theme.spacing.sm },
  avatarText: { color: theme.colors.white, ...theme.typography.title },
  name: { color: theme.colors.textPrimary, ...theme.typography.heading, textAlign: 'center' },
  email: { color: theme.colors.textSecondary, ...theme.typography.caption },
  details: { gap: theme.spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  copy: { flex: 1, gap: 2 },
  label: { color: theme.colors.textMuted, ...theme.typography.caption },
  value: { color: theme.colors.textPrimary, ...theme.typography.body },
  logout: { minHeight: 50, borderRadius: theme.radius.md, borderWidth: 1, borderColor: 'rgba(251,113,133,0.28)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, backgroundColor: 'rgba(251,113,133,0.08)' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.54 },
  logoutText: { color: theme.colors.danger, ...theme.typography.subheading },
});
