import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme, ThemePreference } from '@/core/theme/theme';
import { getUserDisplayName, getUserInitials } from '@/features/auth/models/userModel';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';

const themeOptions: { label: string; value: ThemePreference; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Auto', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'Clair', value: 'light', icon: 'sunny-outline' },
  { label: 'Sombre', value: 'dark', icon: 'moon-outline' },
];

export function ConnectedProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const { theme, preference, setPreference } = useAppTheme();
  const { profile, latestCv, profileCompletion } = useStudentDashboard();
  const styles = createStyles(theme);
  const displayUser = profile?.user ?? user;
  const displayName = getUserDisplayName(displayUser);
  const rows = [
    { icon: 'mail-outline', label: 'Adresse email', value: displayUser?.email ?? 'Non renseigné' },
    { icon: 'school-outline', label: 'Formation', value: profile?.educationLevel ?? 'Non renseignée' },
    { icon: 'navigate-outline', label: 'Objectif', value: profile?.targetJob ?? 'Non renseigné' },
    { icon: 'document-text-outline', label: 'CV', value: latestCv ? latestCv.fileName : 'Aucun CV' },
  ] as const;

  return (
    <Screen eyebrow="Compte" title="Mon profil" subtitle="Gérez votre identité et vos préférences d’affichage.">
      <GlassCard accent style={styles.identity}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{getUserInitials(displayUser)}</Text></View>
          <View style={styles.verified}><Ionicons color={theme.colors.white} name="checkmark" size={13} /></View>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayUser?.email}</Text>
        <AppBadge icon="school-outline" label="Profil étudiant" tone="violet" />
        <View style={styles.completion}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionLabel}>Complétion indicative</Text>
            <Text style={styles.completionValue}>{profileCompletion.percentage}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.progress, { width: `${profileCompletion.percentage}%` }]} />
          </View>
        </View>
      </GlassCard>

      <Text style={styles.sectionTitle}>Informations du compte</Text>
      <GlassCard style={styles.details}>
        {rows.map((row, index) => (
          <View key={row.label}>
            <View style={styles.row}>
              <View style={styles.rowIcon}><Ionicons color={theme.colors.primary} name={row.icon} size={19} /></View>
              <View style={styles.copy}>
                <Text style={styles.label}>{row.label}</Text>
                <Text numberOfLines={1} style={styles.value}>{row.value}</Text>
              </View>
            </View>
            {index < rows.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </GlassCard>

      <Text style={styles.sectionTitle}>Apparence</Text>
      <View accessibilityRole="radiogroup" style={styles.themeControl}>
        {themeOptions.map((option) => {
          const selected = preference === option.value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={[styles.themeOption, selected && styles.themeOptionActive]}
            >
              <Ionicons color={selected ? theme.colors.white : theme.colors.textSecondary} name={option.icon} size={18} />
              <Text style={[styles.themeOptionText, selected && styles.themeOptionTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable disabled={isLoading} onPress={() => void logout()} style={({ pressed }) => [styles.logout, pressed && styles.pressed, isLoading && styles.disabled]}>
        <Ionicons color={theme.colors.danger} name="log-out-outline" size={20} />
        <Text style={styles.logoutText}>{isLoading ? 'Déconnexion...' : 'Se déconnecter'}</Text>
      </Pressable>
      <Text style={styles.version}>SmartIntern AI · Version mobile 1.0</Text>
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  identity: { alignItems: 'center', gap: theme.spacing.sm, paddingTop: theme.spacing.xl },
  avatarWrap: { position: 'relative', marginBottom: theme.spacing.sm },
  avatar: { width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryStrong, ...theme.shadowSmall },
  avatarText: { color: theme.colors.white, ...theme.typography.title },
  verified: { position: 'absolute', right: -3, bottom: -3, width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.emerald, borderWidth: 3, borderColor: theme.colors.surfaceStrong },
  name: { color: theme.colors.textPrimary, ...theme.typography.heading, textAlign: 'center' },
  email: { color: theme.colors.textSecondary, ...theme.typography.caption },
  completion: { width: '100%', marginTop: theme.spacing.lg, gap: theme.spacing.sm },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  completionLabel: { color: theme.colors.textSecondary, ...theme.typography.caption },
  completionValue: { color: theme.colors.emerald, ...theme.typography.caption, fontWeight: '700' },
  track: { height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: theme.colors.emerald, borderRadius: 3 },
  sectionTitle: { marginTop: theme.spacing.sm, color: theme.colors.textPrimary, ...theme.typography.heading },
  details: { paddingVertical: theme.spacing.sm },
  row: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  label: { color: theme.colors.textMuted, ...theme.typography.caption },
  value: { color: theme.colors.textPrimary, ...theme.typography.body },
  divider: { height: 1, marginLeft: 50, backgroundColor: theme.colors.border },
  themeControl: { flexDirection: 'row', gap: theme.spacing.sm, padding: theme.spacing.xs, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceMuted },
  themeOption: { flex: 1, minHeight: 44, borderRadius: theme.radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  themeOptionActive: { backgroundColor: theme.colors.primary, ...theme.shadowSmall },
  themeOptionText: { color: theme.colors.textSecondary, ...theme.typography.caption, fontWeight: '600' },
  themeOptionTextActive: { color: theme.colors.white },
  logout: { minHeight: 52, borderRadius: theme.radius.md, borderWidth: 1, borderColor: `${theme.colors.danger}38`, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, backgroundColor: `${theme.colors.danger}0D` },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  logoutText: { color: theme.colors.danger, ...theme.typography.label },
  version: { color: theme.colors.textMuted, ...theme.typography.caption, textAlign: 'center' },
});
