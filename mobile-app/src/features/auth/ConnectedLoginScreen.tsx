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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function ConnectedLoginScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
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
    <AuthShell title="Ravi de vous revoir" subtitle="Retrouvez vos opportunités et vos recommandations personnalisées.">
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
        <View style={styles.forgotRow}>
          <Pressable hitSlop={8} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgot}>Mot de passe oublié ?</Text>
          </Pressable>
        </View>
        {localError || errorMessage ? (
          <StatusMessage message={(localError || errorMessage)!} tone="error" />
        ) : null}
        <GradientButton
          icon="log-in-outline"
          label="Se connecter"
          loading={isLoading}
          onPress={() => void handleLogin()}
        />
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>
            Nouveau sur SmartIntern ? <Text style={styles.linkStrong}>Créer un compte</Text>
          </Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  form: { gap: theme.spacing.lg },
  forgotRow: { alignItems: 'flex-end', marginTop: -theme.spacing.xs },
  forgot: { color: theme.colors.primary, ...theme.typography.label },
  link: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
  linkStrong: { color: theme.colors.primary, fontWeight: '700' },
});
