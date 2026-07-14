import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { letterToneOptions } from '../config/letterToneConfig';
import type { MotivationLetterTone } from '../models/motivationLetter';

export function LetterToneSelector({ value, onChange, disabled }: { value: MotivationLetterTone; onChange: (tone: MotivationLetterTone) => void; disabled?: boolean }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <View accessibilityRole="radiogroup" style={styles.grid}>{letterToneOptions.map((option) => {
    const selected = value === option.value;
    return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={() => onChange(option.value)} style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed, disabled && styles.disabled]}><View style={[styles.icon, selected && styles.selectedIcon]}><Ionicons color={selected ? theme.colors.primary : theme.colors.textMuted} name={option.icon} size={20} /></View><View style={styles.copy}><Text style={styles.label}>{option.label}</Text><Text style={styles.description}>{option.description}</Text></View>{selected ? <Ionicons color={theme.colors.primary} name="checkmark-circle" size={21} /> : null}</Pressable>;
  })}</View>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  grid: { gap: theme.spacing.sm },
  option: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceMuted },
  selected: { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` },
  icon: { width: 42, height: 42, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
  selectedIcon: { backgroundColor: `${theme.colors.primary}14` },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  label: { color: theme.colors.textPrimary, ...theme.typography.label },
  description: { color: theme.colors.textSecondary, ...theme.typography.caption },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.5 },
});

