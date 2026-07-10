import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBackground } from '@/shared/components/AppBackground';
import { GlassCard } from '@/shared/components/GlassCard';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);

  return (
    <AppBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}><View style={styles.logo}><Ionicons color={theme.colors.white} name="sparkles" size={20} /></View><Text style={styles.brand}>SmartIntern AI</Text></View>
          <View style={styles.header}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
          <GlassCard accent style={styles.card}>{children}</GlassCard>
          <View style={styles.trust}><Ionicons color={theme.colors.emerald} name="shield-checkmark" size={15} /><Text style={styles.trustText}>Connexion sécurisée et données protégées</Text></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const createStyles = (theme: AppTheme, width: number) => StyleSheet.create({
  flex: { flex: 1 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', flexGrow: 1, justifyContent: 'center', paddingHorizontal: width < 380 ? theme.spacing.md : theme.spacing.xl, paddingVertical: theme.spacing.xxl, gap: theme.spacing.xl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  logo: { width: 36, height: 36, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryStrong, ...theme.shadowSmall },
  brand: { color: theme.colors.textPrimary, ...theme.typography.subheading, fontWeight: '700' },
  header: { gap: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  subtitle: { maxWidth: 430, color: theme.colors.textSecondary, ...theme.typography.body },
  card: { padding: width < 380 ? theme.spacing.lg : theme.spacing.xl },
  trust: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  trustText: { color: theme.colors.textMuted, ...theme.typography.caption },
});
