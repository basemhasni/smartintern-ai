import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { theme } from '@/core/theme/theme';

type Props = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function AppTextInput({ label, icon, secureTextEntry, ...props }: Props) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Ionicons color={theme.colors.textMuted} name={icon} size={19} />
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={hidden}
          style={styles.input}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
            onPress={() => setHidden((value) => !value)}
          >
            <Ionicons
              color={theme.colors.textSecondary}
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: theme.spacing.sm },
  label: { color: theme.colors.textSecondary, ...theme.typography.caption },
  field: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    ...theme.typography.body,
  },
});
