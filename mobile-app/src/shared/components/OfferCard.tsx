import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/core/theme/theme';
import { AppBadge } from './AppBadge';
import { GlassCard } from './GlassCard';

type Props = {
  company: string;
  title: string;
  location: string;
  skills: string[];
  match: number;
  onPress?: () => void;
};

export function OfferCard({ company, title, location, skills, match, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.card}>
        <View style={styles.top}>
          <View style={styles.companyIcon}>
            <Ionicons color={theme.colors.cyan} name="business-outline" size={22} />
          </View>
          <View style={styles.heading}>
            <Text numberOfLines={2} style={styles.title}>{title}</Text>
            <Text style={styles.company}>{company}</Text>
          </View>
          <View style={styles.score}>
            <Text style={styles.scoreValue}>{match}%</Text>
            <Text style={styles.scoreLabel}>match</Text>
          </View>
        </View>
        <View style={styles.location}>
          <Ionicons color={theme.colors.textMuted} name="location-outline" size={15} />
          <Text style={styles.meta}>{location}</Text>
        </View>
        <View style={styles.skills}>
          {skills.map((skill) => <AppBadge key={skill} label={skill} tone="violet" />)}
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
  companyIcon: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.10)',
  },
  heading: { flex: 1, gap: 3 },
  title: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  company: { color: theme.colors.textSecondary, ...theme.typography.caption },
  score: { alignItems: 'flex-end' },
  scoreValue: { color: theme.colors.success, fontSize: 20, lineHeight: 24, fontWeight: '800' },
  scoreLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  location: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  meta: { color: theme.colors.textMuted, ...theme.typography.caption },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});
