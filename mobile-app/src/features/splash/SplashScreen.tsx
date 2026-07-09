import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { theme } from '@/core/theme/theme';
import { AppBackground } from '@/shared/components/AppBackground';
import { GradientButton } from '@/shared/components/GradientButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  return (
    <AppBackground>
      <View style={styles.root}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons color={theme.colors.white} name="sparkles" size={38} />
          </View>
          <Text style={styles.name}>SmartIntern AI</Text>
          <Text style={styles.tagline}>
            Le bon stage, éclairé par une intelligence qui comprend votre potentiel.
          </Text>
        </View>
        <GradientButton
          icon="arrow-forward"
          label="Commencer"
          onPress={() => navigation.replace('Login')}
          style={styles.button}
        />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
    paddingTop: 150,
    paddingBottom: theme.spacing.xxxl,
  },
  brand: { alignItems: 'center', gap: theme.spacing.lg },
  logo: {
    width: 86,
    height: 86,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    ...theme.shadow,
  },
  name: { color: theme.colors.textPrimary, ...theme.typography.display, textAlign: 'center' },
  tagline: {
    maxWidth: 340,
    color: theme.colors.textSecondary,
    ...theme.typography.body,
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
  button: { width: '100%' },
});
