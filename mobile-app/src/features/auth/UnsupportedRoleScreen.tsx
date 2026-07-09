import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';
import { GradientButton } from '@/shared/components/GradientButton';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';
import { useAuth } from './state/AuthContext';

export function UnsupportedRoleScreen() {
  const { logout, user, isLoading } = useAuth();

  return (
    <Screen
      title="Espace mobile limite"
      subtitle="Le mobile etudiant est prioritaire pour cette etape."
    >
      <GlassCard accent style={styles.card}>
        <View style={styles.icon}>
          <Ionicons color={theme.colors.cyan} name="business-outline" size={28} />
        </View>
        <Text style={styles.title}>
          {user?.role === 'COMPANY' ? 'Espace entreprise a venir' : 'Espace admin a venir'}
        </Text>
        <Text style={styles.copy}>
          Votre compte est reconnu, mais cette version mobile connecte uniquement le parcours
          etudiant. Les espaces entreprise et admin seront traites dans une etape dediee.
        </Text>
      </GlassCard>
      <GradientButton
        icon="log-out-outline"
        label="Se deconnecter"
        loading={isLoading}
        onPress={() => void logout()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: theme.spacing.md },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
  title: { color: theme.colors.textPrimary, ...theme.typography.heading, textAlign: 'center' },
  copy: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
});
