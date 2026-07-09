import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';
import { AppBackground } from '@/shared/components/AppBackground';
import { GlassCard } from '@/shared/components/GlassCard';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <AppBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>SMARTINTERN AI</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <GlassCard accent>{children}</GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  header: { gap: theme.spacing.sm },
  brand: { color: theme.colors.cyan, ...theme.typography.caption, fontWeight: '800' },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  subtitle: { color: theme.colors.textSecondary, ...theme.typography.body },
});
