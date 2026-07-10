import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewProps } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBackground } from './AppBackground';

type Props = ScrollViewProps & {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  rightAccessory?: ReactNode;
};

export function Screen({ children, title, subtitle, eyebrow, rightAccessory, contentContainerStyle, ...props }: Props) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);

  return (
    <AppBackground>
      <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} {...props}>
        {title ? (
          <View style={styles.headerRow}>
            <View style={styles.header}>
              {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {rightAccessory}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </AppBackground>
  );
}

const createStyles = (theme: AppTheme, width: number) => StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: width < 380 ? theme.spacing.md : theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: 116,
    gap: theme.spacing.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  header: { flex: 1, gap: theme.spacing.xs },
  eyebrow: { color: theme.colors.primary, ...theme.typography.overline, textTransform: 'uppercase' },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  subtitle: { maxWidth: 560, color: theme.colors.textSecondary, ...theme.typography.body },
});
