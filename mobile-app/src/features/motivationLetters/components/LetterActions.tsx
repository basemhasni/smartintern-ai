import { Platform, Share, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import { GradientButton } from '@/shared/components/GradientButton';

export function LetterActions({ content, onCopied }: { content: string; onCopied: () => void }) {
  const { theme } = useAppTheme();
  const canCopy = Platform.OS === 'web' && typeof navigator !== 'undefined' && Boolean(navigator.clipboard);
  return <View style={[styles.actions, { gap: theme.spacing.sm }]}><GradientButton disabled={!canCopy} icon="copy-outline" label={canCopy ? 'Copier le texte' : 'Copie disponible sur le web'} onPress={() => void navigator.clipboard.writeText(content).then(onCopied)} variant="secondary" /><GradientButton icon="share-social-outline" label="Partager" onPress={() => void Share.share({ message: content })} variant="secondary" /></View>;
}

const styles = StyleSheet.create({ actions: { flexDirection: 'column' } });
