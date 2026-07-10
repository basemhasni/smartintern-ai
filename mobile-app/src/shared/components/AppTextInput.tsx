import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';

type Props = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  helper?: string;
};

export function AppTextInput({ label, icon, secureTextEntry, error, helper, onFocus, onBlur, ...props }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [hidden, setHidden] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.focused, error && styles.invalid]}>
        <Ionicons color={focused ? theme.colors.primary : theme.colors.textMuted} name={icon} size={19} />
        <TextInput
          accessibilityLabel={label}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={hidden}
          selectionColor={theme.colors.primary}
          style={styles.input}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'} hitSlop={10} onPress={() => setHidden((value) => !value)}>
            <Ionicons color={theme.colors.textSecondary} name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} />
          </Pressable>
        ) : null}
      </View>
      {error || helper ? <Text style={[styles.helper, error && styles.error]}>{error || helper}</Text> : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  wrapper: { gap: theme.spacing.sm },
  label: { color: theme.colors.textSecondary, ...theme.typography.label },
  field: {
    minHeight: 54,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.input,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  focused: { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceStrong },
  invalid: { borderColor: theme.colors.danger },
  input: { flex: 1, minWidth: 0, color: theme.colors.textPrimary, ...theme.typography.body, paddingVertical: theme.spacing.md },
  helper: { color: theme.colors.textMuted, ...theme.typography.caption },
  error: { color: theme.colors.danger },
});
