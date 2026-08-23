import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBackground } from '@/shared/components/AppBackground';
import { GradientButton } from '@/shared/components/GradientButton';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'Splash'>>;

export function SplashScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const styles = createStyles(theme, height);
  return (
    <AppBackground>
      <View style={styles.root}>
        <View style={styles.top}><View style={styles.brandRow}><View style={styles.logoSmall}><Ionicons color={theme.colors.white} name="sparkles" size={18} /></View><Text style={styles.brandName}>SmartIntern AI</Text></View>{width >= 360 ? <AppBadgeLine theme={theme} /> : null}</View>
        <View style={styles.hero}>
          <LinearGradient colors={theme.gradients.premium} style={styles.heroVisual}>
            <View style={styles.visualTop}><Text style={styles.visualLabel}>CAREER SIGNAL</Text><View style={styles.liveDot} /></View>
            <Text style={styles.visualScore}>94%</Text><Text style={styles.visualCaption}>Votre prochain stage, mieux ciblé.</Text>
            <View style={styles.signalRow}>{[72, 92, 58, 82, 100, 76].map((value, index) => <View key={index} style={[styles.signalBar, { height: value * 0.34 }]} />)}</View>
          </LinearGradient>
          <View style={styles.copy}><Text style={styles.title}>Transformez votre potentiel en opportunités.</Text><Text style={styles.tagline}>Un espace intelligent pour découvrir les stages qui vous correspondent et piloter votre parcours.</Text></View>
        </View>
        <View style={styles.footer}><GradientButton icon="arrow-forward" label="Découvrir SmartIntern" onPress={() => navigation.replace('Login')} /><Text style={styles.legal}>Votre carrière. Vos choix. Des signaux plus clairs.</Text></View>
      </View>
    </AppBackground>
  );
}

function AppBadgeLine({ theme }: Readonly<{ theme: AppTheme }>) { return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.emerald }} /><Text style={{ color: theme.colors.textSecondary, ...theme.typography.caption }}>Matching intelligent</Text></View>; }

const createStyles = (theme: AppTheme, height: number) => StyleSheet.create({
  root: { width: '100%', maxWidth: 680, alignSelf: 'center', flex: 1, justifyContent: 'space-between', paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxl, gap: theme.spacing.xl },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  logoSmall: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryStrong },
  brandName: { color: theme.colors.textPrimary, ...theme.typography.subheading, fontWeight: '700' },
  hero: { gap: height < 720 ? theme.spacing.xl : theme.spacing.xxl },
  heroVisual: { height: height < 720 ? 220 : 270, borderRadius: theme.radius.xxl, padding: theme.spacing.xl, overflow: 'hidden', justifyContent: 'space-between', ...theme.shadow },
  visualTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  visualLabel: { color: 'rgba(255,255,255,0.72)', ...theme.typography.overline },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#6EE7B7' },
  visualScore: { color: theme.colors.white, fontSize: 58, lineHeight: 64, fontWeight: '800', letterSpacing: 0 },
  visualCaption: { color: 'rgba(255,255,255,0.84)', ...theme.typography.body },
  signalRow: { height: 40, flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  signalBar: { flex: 1, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.48)' },
  copy: { gap: theme.spacing.md },
  title: { color: theme.colors.textPrimary, ...theme.typography.display },
  tagline: { maxWidth: 560, color: theme.colors.textSecondary, ...theme.typography.body, fontSize: 16, lineHeight: 24 },
  footer: { gap: theme.spacing.md },
  legal: { color: theme.colors.textMuted, ...theme.typography.caption, textAlign: 'center' },
});
