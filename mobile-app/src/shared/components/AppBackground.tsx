import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/core/theme/ThemeProvider';

type Props = { children: ReactNode; safe?: boolean };

export function AppBackground({ children, safe = true }: Props) {
  const { theme } = useAppTheme();
  const content = safe ? (
    <SafeAreaView style={styles.content}>{children}</SafeAreaView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.root}>
      <LinearGradient
        colors={theme.gradients.subtle}
        end={{ x: 1, y: 0.8 }}
        start={{ x: 0, y: 0 }}
        style={[styles.ambient, styles.noPointerEvents]}
      />
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  ambient: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 240,
  },
  noPointerEvents: { pointerEvents: 'none' },
});
