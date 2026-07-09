import { Ionicons } from '@expo/vector-icons';
import {
  DarkTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { theme } from '@/core/theme/theme';
import { AiInsightsScreen } from '@/features/aiInsights/AiInsightsScreen';
import { ApplicationsScreen } from '@/features/applications/ApplicationsScreen';
import { ForgotPasswordScreen } from '@/features/auth/ForgotPasswordScreen';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { RegisterScreen } from '@/features/auth/RegisterScreen';
import { OfferDetailScreen } from '@/features/offers/OfferDetailScreen';
import { OffersScreen } from '@/features/offers/OffersScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { SplashScreen } from '@/features/splash/SplashScreen';
import { StudentHomeScreen } from '@/features/studentHome/StudentHomeScreen';
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
        component={StudentHomeScreen}
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
      <Tabs.Screen component={ProfileScreen} name="Profile" options={{ title: 'Profil' }} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        contentStyle: { backgroundColor: theme.colors.navy },
      }}
    >
      <Stack.Screen component={SplashScreen} name="Splash" />
      <Stack.Screen component={LoginScreen} name="Login" />
      <Stack.Screen component={RegisterScreen} name="Register" />
      <Stack.Screen component={ForgotPasswordScreen} name="ForgotPassword" />
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
