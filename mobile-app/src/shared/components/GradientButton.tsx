import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/core/theme/theme';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function GradientButton({
  label,
  onPress,
  icon,
  disabled,
  loading,
  style,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <>
            {icon ? <Ionicons color={theme.colors.white} name={icon} size={19} /> : null}
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.white,
    ...theme.typography.subheading,
  },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.48 },
});
