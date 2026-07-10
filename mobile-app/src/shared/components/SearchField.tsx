import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';

export function SearchField(props: TextInputProps) {
  const { theme } = useAppTheme();
  return <View style={{ minHeight: 52, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, ...theme.shadowSmall }}><Ionicons color={theme.colors.textMuted} name="search-outline" size={20} /><TextInput accessibilityLabel="Rechercher" placeholderTextColor={theme.colors.textMuted} selectionColor={theme.colors.primary} style={[styles.input, { color: theme.colors.textPrimary }, theme.typography.body]} {...props} /></View>;
}

const styles = StyleSheet.create({ input: { flex: 1, minWidth: 0, paddingVertical: 12 } });
