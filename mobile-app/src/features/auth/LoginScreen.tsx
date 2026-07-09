import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { GradientButton } from '@/shared/components/GradientButton';
import { AuthShell } from './AuthShell';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  // TODO Step 2: connect auth API.
  return (
    <AuthShell title="Ravi de vous revoir" subtitle="Accédez à votre espace carrière intelligent.">
      <View style={styles.form}>
        <AppTextInput
          autoCapitalize="none"
          icon="mail-outline"
          keyboardType="email-address"
          label="Email"
          placeholder="vous@exemple.com"
        />
        <AppTextInput
          icon="lock-closed-outline"
          label="Mot de passe"
          placeholder="Votre mot de passe"
          secureTextEntry
        />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Mot de passe oublié ?</Text>
        </Pressable>
        <GradientButton
          icon="log-in-outline"
          label="Se connecter"
          onPress={() => navigation.replace('StudentTabs')}
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

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  forgot: { color: theme.colors.cyan, ...theme.typography.caption, textAlign: 'right' },
  link: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
  linkStrong: { color: theme.colors.textPrimary, fontWeight: '700' },
});
