import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/core/theme/theme';

type Props = {
  children: ReactNode;
  safe?: boolean;
};

export function AppBackground({ children, safe = true }: Props) {
  const content = safe ? (
    <SafeAreaView style={styles.content}>{children}</SafeAreaView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  glowTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -120,
    right: -100,
    backgroundColor: 'rgba(79, 124, 255, 0.16)',
  },
  glowBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    bottom: -130,
    left: -110,
    backgroundColor: 'rgba(34, 211, 238, 0.10)',
  },
});
