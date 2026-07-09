import { Ionicons } from '@expo/vector-icons';
import {
  DarkTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';
import { AiInsightsScreen } from '@/features/aiInsights/AiInsightsScreen';
import { ApplicationsScreen } from '@/features/applications/ApplicationsScreen';
import { ConnectedForgotPasswordScreen } from '@/features/auth/ConnectedForgotPasswordScreen';
import { ConnectedLoginScreen } from '@/features/auth/ConnectedLoginScreen';
import { ConnectedRegisterScreen } from '@/features/auth/ConnectedRegisterScreen';
import { UnsupportedRoleScreen } from '@/features/auth/UnsupportedRoleScreen';
import { useAuth } from '@/features/auth/state/AuthContext';
import { OfferDetailScreen } from '@/features/offers/OfferDetailScreen';
import { OffersScreen } from '@/features/offers/OffersScreen';
import { ConnectedProfileScreen } from '@/features/profile/ConnectedProfileScreen';
import { SplashScreen } from '@/features/splash/SplashScreen';
import { ConnectedStudentHomeScreen } from '@/features/studentHome/ConnectedStudentHomeScreen';
import { AppBackground } from '@/shared/components/AppBackground';
import type { RootStackParamList, StudentTabParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<StudentTabParamList>();

const tabIcons: Record<
  keyof StudentTabParamList,
  keyof typeof Ionicons.glyphMap
> = {
  StudentHome: 'home-outline',
  Offers: 'briefcase-outline',
  Applications: 'document-text-outline',
  AiInsights: 'sparkles-outline',
  Profile: 'person-outline',
};

function StudentTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.cyan,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.navySoft,
        },
        tabBarLabelStyle: theme.typography.caption,
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={tabIcons[route.name]} size={size} />
        ),
      })}
    >
      <Tabs.Screen
        component={ConnectedStudentHomeScreen}
        name="StudentHome"
        options={{ title: 'Accueil' }}
      />
      <Tabs.Screen component={OffersScreen} name="Offers" options={{ title: 'Offres' }} />
      <Tabs.Screen
        component={ApplicationsScreen}
        name="Applications"
        options={{ title: 'Candidatures' }}
      />
      <Tabs.Screen
        component={AiInsightsScreen}
        name="AiInsights"
        options={{ title: 'IA' }}
      />
      <Tabs.Screen component={ConnectedProfileScreen} name="Profile" options={{ title: 'Profil' }} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isRestoringSession, user } = useAuth();

  if (isRestoringSession) {
    return (
      <AppBackground>
        <View style={styles.restore}>
          <ActivityIndicator color={theme.colors.cyan} size="large" />
          <Text style={styles.restoreTitle}>SmartIntern AI</Text>
          <Text style={styles.restoreCopy}>Verification de votre session mobile...</Text>
        </View>
      </AppBackground>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: theme.colors.navy },
        }}
      >
        <Stack.Screen component={SplashScreen} name="Splash" />
        <Stack.Screen component={ConnectedLoginScreen} name="Login" />
        <Stack.Screen component={ConnectedRegisterScreen} name="Register" />
        <Stack.Screen component={ConnectedForgotPasswordScreen} name="ForgotPassword" />
      </Stack.Navigator>
    );
  }

  if (user?.role !== 'STUDENT') {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: theme.colors.navy },
        }}
      >
        <Stack.Screen component={UnsupportedRoleScreen} name="UnsupportedRole" />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        contentStyle: { backgroundColor: theme.colors.navy },
      }}
    >
      <Stack.Screen component={StudentTabs} name="StudentTabs" />
      <Stack.Screen component={OfferDetailScreen} name="OfferDetail" />
    </Stack.Navigator>
  );
}

export const navigationTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.navy,
    card: theme.colors.navySoft,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.cyan,
  },
};

const styles = StyleSheet.create({
  restore: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  restoreTitle: { color: theme.colors.textPrimary, ...theme.typography.title },
  restoreCopy: { color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center' },
});
