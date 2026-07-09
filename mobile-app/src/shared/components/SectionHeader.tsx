import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';

type Props = { title: string; action?: string; onPress?: () => void };

export function SectionHeader({ title, action, onPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onPress}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  title: { color: theme.colors.textPrimary, ...theme.typography.heading },
  action: { color: theme.colors.cyan, ...theme.typography.caption },
});
