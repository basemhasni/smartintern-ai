import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';

export function IconButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { theme } = useAppTheme();
  return <Pressable accessibilityLabel={label} accessibilityRole="button" hitSlop={6} onPress={onPress} style={({ pressed }) => [{ width: 44, height: 44, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadowSmall }, pressed && styles.pressed]}><Ionicons color={theme.colors.textPrimary} name={icon} size={21} /></Pressable>;
}

const styles = StyleSheet.create({ pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] } });
