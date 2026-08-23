import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { GradientButton } from '@/shared/components/GradientButton';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { AuthShell } from './AuthShell';
import { useAuth } from './state/AuthContext';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>>;

const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const genericMessage = 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.';

export function ConnectedForgotPasswordScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
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
    <AuthShell title="Réinitialiser l’accès" subtitle="Recevez un lien sécurisé pour choisir un nouveau mot de passe.">
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
        {localError || errorMessage ? <StatusMessage message={(localError || errorMessage)!} tone="error" /> : null}
        {successMessage ? <StatusMessage message={successMessage} tone="success" /> : null}
        <GradientButton
          icon="send-outline"
          label="Envoyer le lien"
          loading={isLoading}
          onPress={() => void handleForgotPassword()}
        />
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.back}>Retour à la connexion</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  form: { gap: theme.spacing.lg },
  back: { color: theme.colors.primary, ...theme.typography.label, textAlign: 'center' },
});
