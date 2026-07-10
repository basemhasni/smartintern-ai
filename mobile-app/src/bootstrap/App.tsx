import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator, getNavigationTheme } from '@/core/navigation/AppNavigator';
import { ThemeProvider, useAppTheme } from '@/core/theme/ThemeProvider';
import { AuthProvider } from '@/features/auth/state/AuthContext';

function ThemedApp() {
  const { theme } = useAppTheme();

  return (
    <AuthProvider>
      <NavigationContainer theme={getNavigationTheme(theme)}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
