import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
} from 'react-native';

import { theme } from '@/core/theme/theme';
import { AppBackground } from './AppBackground';

type Props = ScrollViewProps & {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function Screen({ children, title, subtitle, ...props }: Props) {
  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  header: { gap: theme.spacing.xs, marginBottom: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  subtitle: { color: theme.colors.textSecondary, ...theme.typography.body },
});
