import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary';
};

export function GradientButton({ label, onPress, icon, disabled, loading, style, variant = 'primary' }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, style, pressed && styles.pressed, inactive && styles.disabled]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={theme.gradients.primary} end={{ x: 1, y: 0.6 }} start={{ x: 0, y: 0 }} style={styles.content}>
          {loading ? <ActivityIndicator color={theme.colors.white} /> : <ButtonContent icon={icon} label={label} color={theme.colors.white} styles={styles} />}
        </LinearGradient>
      ) : (
        <View style={styles.content}>
          <PressableContent loading={loading} icon={icon} label={label} styles={styles} color={theme.colors.primary} />
        </View>
      )}
    </Pressable>
  );
}

function ButtonContent({ icon, label, color, styles }: { icon?: keyof typeof Ionicons.glyphMap; label: string; color: string; styles: ReturnType<typeof createStyles> }) {
  return <>{icon ? <Ionicons color={color} name={icon} size={19} /> : null}<Text style={[styles.label, { color }]}>{label}</Text></>;
}

function PressableContent({ loading, icon, label, color, styles }: { loading?: boolean; icon?: keyof typeof Ionicons.glyphMap; label: string; color: string; styles: ReturnType<typeof createStyles> }) {
  return <>{loading ? <ActivityIndicator color={color} /> : <ButtonContent color={color} icon={icon} label={label} styles={styles} />}</>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  pressable: {
    minHeight: 54,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadowSmall,
  },
  content: {
    minHeight: 54,
    width: '100%',
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  label: { ...theme.typography.label, fontWeight: '700' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.48 },
});
