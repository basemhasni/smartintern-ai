import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GradientButton } from '@/shared/components/GradientButton';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';
import { useAuth } from './state/AuthContext';

export function UnsupportedRoleScreen() {
  const { logout, user, isLoading } = useAuth();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <Screen eyebrow="Accès mobile" title="Votre compte est bien reconnu" subtitle="Cet espace sera disponible dans une prochaine version."><GlassCard accent style={styles.card}><View style={styles.icon}><Ionicons color={theme.colors.primary} name={user?.role === 'COMPANY' ? 'business-outline' : 'shield-outline'} size={29} /></View><Text style={styles.title}>{user?.role === 'COMPANY' ? 'Espace entreprise à venir' : 'Espace administrateur à venir'}</Text><Text style={styles.copy}>La version actuelle est dédiée au parcours étudiant. Votre compte reste actif et vous pouvez continuer à utiliser la plateforme web.</Text></GlassCard><GradientButton icon="log-out-outline" label="Se déconnecter" loading={isLoading} onPress={() => void logout()} variant="secondary" /></Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
  icon: { width: 64, height: 64, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, marginBottom: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, ...theme.typography.heading, textAlign: 'center' },
  copy: { maxWidth: 430, color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
});
