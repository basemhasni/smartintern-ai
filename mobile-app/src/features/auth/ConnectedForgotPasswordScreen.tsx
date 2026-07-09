import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { GradientButton } from '@/shared/components/GradientButton';
import { AuthShell } from './AuthShell';
import { useAuth } from './state/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const genericMessage = 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.';

export function ConnectedForgotPasswordScreen({ navigation }: Props) {
  const { forgotPassword, isLoading, errorMessage, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    clearError();
    setLocalError(null);
    setSuccessMessage(null);

    if (!isEmailValid(email.trim())) {
      setLocalError('Adresse email invalide.');
      return;
    }

    try {
      await forgotPassword(email);
      setSuccessMessage(genericMessage);
    } catch {
      // AuthContext keeps the normalized error for the UI.
    }
  };

  return (
    <AuthShell title="Reinitialiser l'acces" subtitle="Nous preparerons un lien securise pour votre boite mail.">
      <View style={styles.form}>
        <AppTextInput
          autoCapitalize="none"
          autoComplete="email"
          icon="mail-outline"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="vous@exemple.com"
          value={email}
        />
        {localError || errorMessage ? (
          <Text style={styles.error}>{localError || errorMessage}</Text>
        ) : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
        <GradientButton
          icon="send-outline"
          label="Envoyer le lien"
          loading={isLoading}
          onPress={() => void handleForgotPassword()}
        />
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.back}>Retour a la connexion</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  error: { color: theme.colors.danger, ...theme.typography.caption },
  success: { color: theme.colors.success, ...theme.typography.caption },
  back: { color: theme.colors.cyan, ...theme.typography.body, textAlign: 'center' },
});
