import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { GradientButton } from '@/shared/components/GradientButton';
import { AuthShell } from './AuthShell';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  // TODO Step 2: connect auth API.
  return (
    <AuthShell title="Réinitialiser l’accès" subtitle="Nous préparerons un lien sécurisé pour votre boîte mail.">
      <View style={styles.form}>
        <AppTextInput
          autoCapitalize="none"
          icon="mail-outline"
          keyboardType="email-address"
          label="Email"
          placeholder="vous@exemple.com"
        />
        <Text style={styles.notice}>Mode démonstration : aucun email ne sera envoyé à cette étape.</Text>
        <GradientButton icon="send-outline" label="Envoyer le lien" />
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Retour à la connexion</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.lg },
  notice: { color: theme.colors.textMuted, ...theme.typography.caption },
  back: { color: theme.colors.cyan, ...theme.typography.body, textAlign: 'center' },
});
