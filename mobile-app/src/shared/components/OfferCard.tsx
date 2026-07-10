import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from './AppBadge';
import { GlassCard } from './GlassCard';

type Props = { company: string; title: string; location: string; skills: string[]; match: number; onPress?: () => void };

export function OfferCard({ company, title, location, skills, match, onPress }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable accessibilityHint="Ouvre le détail de l'offre" accessibilityRole="button" disabled={!onPress} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <GlassCard style={styles.card}>
        <View style={styles.top}>
          <View style={styles.companyIcon}><Text style={styles.companyInitial}>{company.charAt(0)}</Text></View>
          <View style={styles.heading}>
            <Text numberOfLines={2} style={styles.title}>{title}</Text>
            <Text numberOfLines={1} style={styles.company}>{company}</Text>
          </View>
          <View style={styles.chevron}><Ionicons color={theme.colors.textMuted} name="chevron-forward" size={18} /></View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.location}><Ionicons color={theme.colors.textMuted} name="location-outline" size={15} /><Text numberOfLines={1} style={styles.meta}>{location}</Text></View>
          <AppBadge icon="sparkles" label={`${match}% match`} tone="success" />
        </View>
        <View style={styles.skills}>{skills.slice(0, 3).map((skill) => <AppBadge key={skill} label={skill} tone="neutral" />)}</View>
      </GlassCard>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  card: { gap: theme.spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  companyIcon: { width: 46, height: 46, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border },
  companyInitial: { color: theme.colors.primary, fontSize: 18, lineHeight: 22, fontWeight: '800' },
  heading: { flex: 1, minWidth: 0, gap: 3 },
  title: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  company: { color: theme.colors.textSecondary, ...theme.typography.caption },
  chevron: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  location: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  meta: { flex: 1, color: theme.colors.textMuted, ...theme.typography.caption },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
