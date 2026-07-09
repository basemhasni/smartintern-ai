import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { GradientButton } from '@/shared/components/GradientButton';
import { AuthShell } from './AuthShell';
import { useAuth } from './state/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || parts[0] || '',
  };
};

export function ConnectedRegisterScreen({ navigation }: Props) {
  const { register, isLoading, errorMessage, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    clearError();
    setLocalError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setLocalError('Le nom complet est obligatoire.');
      return;
    }

    if (!isEmailValid(email.trim())) {
      setLocalError('Adresse email invalide.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setLocalError('Le mot de passe doit contenir au moins une lettre et un chiffre.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const { firstName, lastName } = splitName(fullName);
      const connected = await register({
        firstName,
        lastName,
        email,
        password,
        role: 'STUDENT',
      });

      if (!connected) {
        setSuccessMessage('Compte cree. Vous pouvez maintenant vous connecter.');
        navigation.navigate('Login');
      }
    } catch {
      // AuthContext keeps the normalized error for the UI.
    }
  };

  return (
    <AuthShell title="Creez votre profil" subtitle="Votre prochain stage commence avec un profil solide.">
      <View style={styles.form}>
        <View style={styles.role}>
          <Text style={styles.roleLabel}>Role selectionne</Text>
          <AppBadge label="Etudiant" tone="violet" />
        </View>
        <AppTextInput
          autoComplete="name"
          icon="person-outline"
          label="Nom complet"
          onChangeText={setFullName}
          placeholder="Votre nom"
          value={fullName}
        />
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
          autoComplete="new-password"
          icon="lock-closed-outline"
          label="Mot de passe"
          onChangeText={setPassword}
          placeholder="8 caracteres minimum"
          secureTextEntry
          value={password}
        />
        <AppTextInput
          autoComplete="new-password"
          icon="shield-checkmark-outline"
          label="Confirmation"
          onChangeText={setConfirmPassword}
          placeholder="Confirmez le mot de passe"
          secureTextEntry
          value={confirmPassword}
        />
        {localError || errorMessage ? (
          <Text style={styles.error}>{localError || errorMessage}</Text>
        ) : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
        <GradientButton
          label="Creer mon compte"
          loading={isLoading}
          onPress={() => void handleRegister()}
        />
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Deja inscrit ? <Text style={styles.strong}>Se connecter</Text></Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  role: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleLabel: { color: theme.colors.textSecondary, ...theme.typography.caption },
  error: { color: theme.colors.danger, ...theme.typography.caption },
  success: { color: theme.colors.success, ...theme.typography.caption },
  link: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
  strong: { color: theme.colors.textPrimary, fontWeight: '700' },
});
