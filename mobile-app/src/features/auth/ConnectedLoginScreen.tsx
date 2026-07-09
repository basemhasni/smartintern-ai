import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { GradientButton } from '@/shared/components/GradientButton';
import { AuthShell } from './AuthShell';
import { useAuth } from './state/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function ConnectedLoginScreen({ navigation }: Props) {
  const { login, isLoading, errorMessage, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    clearError();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Email et mot de passe sont obligatoires.');
      return;
    }

    try {
      await login(email, password);
    } catch {
      // AuthContext keeps the normalized error for the UI.
    }
  };

  return (
    <AuthShell title="Ravi de vous revoir" subtitle="Accedez a votre espace carriere intelligent.">
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
        <AppTextInput
          autoComplete="password"
          icon="lock-closed-outline"
          label="Mot de passe"
          onChangeText={setPassword}
          placeholder="Votre mot de passe"
          secureTextEntry
          value={password}
        />
        {localError || errorMessage ? (
          <Text style={styles.error}>{localError || errorMessage}</Text>
        ) : null}
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Mot de passe oublie ?</Text>
        </Pressable>
        <GradientButton
          icon="log-in-outline"
          label="Se connecter"
          loading={isLoading}
          onPress={() => void handleLogin()}
        />
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>
            Nouveau sur SmartIntern ? <Text style={styles.linkStrong}>Creer un compte</Text>
          </Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  error: { color: theme.colors.danger, ...theme.typography.caption },
  forgot: { color: theme.colors.cyan, ...theme.typography.caption, textAlign: 'right' },
  link: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
  linkStrong: { color: theme.colors.textPrimary, fontWeight: '700' },
});
