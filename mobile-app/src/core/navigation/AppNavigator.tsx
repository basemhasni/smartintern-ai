import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AiInsightsScreen } from '@/features/aiInsights/AiInsightsScreen';
import { ApplicationsScreen } from '@/features/applications/ApplicationsScreen';
import { ApplicationDetailScreen } from '@/features/applications/screens/ApplicationDetailScreen';
import { ApplicationsProvider } from '@/features/applications/state/ApplicationsContext';
import { ConnectedForgotPasswordScreen } from '@/features/auth/ConnectedForgotPasswordScreen';
import { ConnectedLoginScreen } from '@/features/auth/ConnectedLoginScreen';
import { ConnectedRegisterScreen } from '@/features/auth/ConnectedRegisterScreen';
import { UnsupportedRoleScreen } from '@/features/auth/UnsupportedRoleScreen';
import { useAuth } from '@/features/auth/state/AuthContext';
import { CareerAssistantScreen } from '@/features/careerAssistant/screens/CareerAssistantScreen';
import { CareerAssistantProvider } from '@/features/careerAssistant/state/CareerAssistantContext';
import { MotivationLetterDetailScreen } from '@/features/motivationLetters/screens/MotivationLetterDetailScreen';
import { MotivationLetterGeneratorScreen } from '@/features/motivationLetters/screens/MotivationLetterGeneratorScreen';
import { MotivationLettersScreen } from '@/features/motivationLetters/screens/MotivationLettersScreen';
import { MotivationLettersProvider } from '@/features/motivationLetters/state/MotivationLettersContext';
import { OfferDetailScreen } from '@/features/offers/OfferDetailScreen';
import { OffersScreen } from '@/features/offers/OffersScreen';
import { OffersProvider } from '@/features/offers/state/OffersContext';
import { SkillGapSimulatorScreen } from '@/features/skillGap/screens/SkillGapSimulatorScreen';
import { SkillGapProvider } from '@/features/skillGap/state/SkillGapContext';
import { ConnectedProfileScreen } from '@/features/profile/ConnectedProfileScreen';
import { SplashScreen } from '@/features/splash/SplashScreen';
import { ConnectedStudentHomeScreen } from '@/features/studentHome/ConnectedStudentHomeScreen';
import { StudentDashboardProvider } from '@/features/student/state/StudentDashboardContext';
import { AppBackground } from '@/shared/components/AppBackground';
import type { RootStackParamList, StudentTabParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<StudentTabParamList>();

const tabIcons: Record<keyof StudentTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  StudentHome: { active: 'home', inactive: 'home-outline' },
  Offers: { active: 'briefcase', inactive: 'briefcase-outline' },
  Applications: { active: 'documents', inactive: 'documents-outline' },
  AiInsights: { active: 'sparkles', inactive: 'sparkles-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function StudentTabs() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const horizontalMargin = width > 744 ? (width - 720) / 2 : 12;

  return (
    <Tabs.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textMuted,
      tabBarStyle: {
        position: 'absolute', left: horizontalMargin, right: horizontalMargin, bottom: 12,
        height: 72, paddingTop: 8, paddingBottom: 8, borderTopWidth: 0,
        borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.tabBar, ...theme.shadow,
      },
      tabBarItemStyle: { borderRadius: theme.radius.md },
      tabBarLabelStyle: { ...theme.typography.caption, fontSize: 10, lineHeight: 14, fontWeight: '600' },
      tabBarIcon: ({ color, focused }) => <View style={[styles.tabIcon, focused && { backgroundColor: `${theme.colors.primary}14` }]}><Ionicons color={color} name={focused ? tabIcons[route.name].active : tabIcons[route.name].inactive} size={21} /></View>,
    })}>
      <Tabs.Screen component={ConnectedStudentHomeScreen} name="StudentHome" options={{ title: 'Accueil' }} />
      <Tabs.Screen component={OffersScreen} name="Offers" options={{ title: 'Offres' }} />
      <Tabs.Screen component={ApplicationsScreen} name="Applications" options={{ title: 'Candidatures' }} />
      <Tabs.Screen component={AiInsightsScreen} name="AiInsights" options={{ title: 'IA' }} />
      <Tabs.Screen component={ConnectedProfileScreen} name="Profile" options={{ title: 'Profil' }} />
    </Tabs.Navigator>
  );
}

function StudentExperience({ stackOptions }: { stackOptions: ReturnType<typeof createStackOptions> }) {
  return (
    <ApplicationsProvider>
      <StudentDashboardProvider>
        <OffersProvider>
          <CareerAssistantProvider>
            <SkillGapProvider>
              <MotivationLettersProvider>
                <Stack.Navigator screenOptions={stackOptions}>
                  <Stack.Screen component={StudentTabs} name="StudentTabs" />
                  <Stack.Screen component={OfferDetailScreen} name="OfferDetail" />
                  <Stack.Screen component={SkillGapSimulatorScreen} name="SkillGapSimulator" />
                  <Stack.Screen component={CareerAssistantScreen} name="CareerAssistant" />
                  <Stack.Screen component={ApplicationDetailScreen} name="ApplicationDetail" />
                  <Stack.Screen component={MotivationLettersScreen} name="MotivationLetters" />
                  <Stack.Screen component={MotivationLetterGeneratorScreen} name="MotivationLetterGenerator" />
                  <Stack.Screen component={MotivationLetterDetailScreen} name="MotivationLetterDetail" />
                </Stack.Navigator>
              </MotivationLettersProvider>
            </SkillGapProvider>
          </CareerAssistantProvider>
        </OffersProvider>
      </StudentDashboardProvider>
    </ApplicationsProvider>
  );
}

const createStackOptions = (theme: AppTheme) => ({
  headerShown: false,
  animation: 'fade_from_bottom' as const,
  contentStyle: { backgroundColor: theme.colors.background },
});

export function AppNavigator() {
  const { isAuthenticated, isRestoringSession, user } = useAuth();
  const { theme } = useAppTheme();

  if (isRestoringSession) return <AppBackground><View style={styles.restore}><View style={[styles.restoreLogo, { backgroundColor: theme.colors.surface }]}><Ionicons color={theme.colors.primary} name="sparkles" size={28} /></View><ActivityIndicator color={theme.colors.primary} /><Text style={[theme.typography.heading, { color: theme.colors.textPrimary }]}>SmartIntern AI</Text><Text style={[styles.restoreCopy, theme.typography.body, { color: theme.colors.textSecondary }]}>Préparation de votre espace...</Text></View></AppBackground>;

  const stackOptions = createStackOptions(theme);
  if (!isAuthenticated) return <Stack.Navigator initialRouteName="Splash" screenOptions={stackOptions}><Stack.Screen component={SplashScreen} name="Splash" /><Stack.Screen component={ConnectedLoginScreen} name="Login" /><Stack.Screen component={ConnectedRegisterScreen} name="Register" /><Stack.Screen component={ConnectedForgotPasswordScreen} name="ForgotPassword" /></Stack.Navigator>;
  if (user?.role !== 'STUDENT') return <Stack.Navigator screenOptions={stackOptions}><Stack.Screen component={UnsupportedRoleScreen} name="UnsupportedRole" /></Stack.Navigator>;
  return <StudentExperience stackOptions={stackOptions} />;
}

export const getNavigationTheme = (theme: AppTheme): NavigationTheme => ({
  ...(theme.isDark ? DarkTheme : DefaultTheme),
  colors: { ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors), primary: theme.colors.primary, background: theme.colors.background, card: theme.colors.backgroundElevated, text: theme.colors.textPrimary, border: theme.colors.border, notification: theme.colors.emerald },
});

const styles = StyleSheet.create({
  restore: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  restoreLogo: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  restoreCopy: { textAlign: 'center' },
  tabIcon: { width: 36, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
