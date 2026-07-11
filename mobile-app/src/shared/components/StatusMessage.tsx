import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';

export function StatusMessage({ message, tone }: { message: string; tone: 'error' | 'success' | 'info' | 'warning' }) {
  const { theme } = useAppTheme();
  const color = tone === 'error' ? theme.colors.danger : tone === 'success' ? theme.colors.success : tone === 'warning' ? theme.colors.warning : theme.colors.info;
  const icon = tone === 'error' || tone === 'warning' ? 'alert-circle' : tone === 'success' ? 'checkmark-circle' : 'information-circle';
  return <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: `${color}12`, borderWidth: 1, borderColor: `${color}35` }}><Ionicons color={color} name={icon} size={19} /><Text style={[styles.text, theme.typography.caption, { color }]}>{message}</Text></View>;
}

const styles = StyleSheet.create({ text: { flex: 1 } });
