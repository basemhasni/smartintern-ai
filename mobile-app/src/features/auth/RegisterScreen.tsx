import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { GradientButton } from '@/shared/components/GradientButton';
import { AuthShell } from './AuthShell';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  // TODO Step 2: connect auth API.
  return (
    <AuthShell title="Créez votre profil" subtitle="Votre prochain stage commence avec un profil solide.">
      <View style={styles.form}>
        <View style={styles.role}>
          <Text style={styles.roleLabel}>Rôle sélectionné</Text>
          <AppBadge label="Étudiant" tone="violet" />
        </View>
        <AppTextInput icon="person-outline" label="Nom complet" placeholder="Votre nom" />
        <AppTextInput
          autoCapitalize="none"
          icon="mail-outline"
          keyboardType="email-address"
          label="Email"
          placeholder="vous@exemple.com"
        />
        <AppTextInput icon="lock-closed-outline" label="Mot de passe" placeholder="8 caractères minimum" secureTextEntry />
        <AppTextInput icon="shield-checkmark-outline" label="Confirmation" placeholder="Confirmez le mot de passe" secureTextEntry />
        <GradientButton label="Créer mon compte" onPress={() => navigation.replace('StudentTabs')} />
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Déjà inscrit ? <Text style={styles.strong}>Se connecter</Text></Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  role: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleLabel: { color: theme.colors.textSecondary, ...theme.typography.caption },
  link: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
  strong: { color: theme.colors.textPrimary, fontWeight: '700' },
});
