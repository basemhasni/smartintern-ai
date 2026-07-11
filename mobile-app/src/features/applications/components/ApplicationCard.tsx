import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import type { StudentApplication } from '../models/application';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';

type Props = { application: StudentApplication; onPress: () => void };

export const ApplicationCard = memo(function ApplicationCard({ application, onPress }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const offer = application.offer;
  const companyName = offer?.company.companyName || 'Entreprise non renseignee';

  return (
    <Pressable
      accessibilityLabel={`${offer?.title || 'Candidature'}, ${companyName}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <GlassCard style={styles.card}>
        <View accessibilityLabel={`Logo ${companyName}`} style={styles.logo}>
          <Text style={styles.initial}>{companyName.charAt(0).toUpperCase() || 'S'}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <ApplicationStatusBadge status={application.status} />
            {application.compatibilityScore !== null && application.compatibilityScore !== undefined ? (
              <Text accessibilityLabel={`Score de compatibilite ${Math.round(application.compatibilityScore)} sur 100`} style={styles.score}>{Math.round(application.compatibilityScore)}%</Text>
            ) : null}
          </View>
          <Text numberOfLines={2} style={styles.title}>{offer?.title || 'Offre indisponible'}</Text>
          <Text numberOfLines={1} style={styles.company}>{companyName}</Text>
          <View style={styles.metadata}>
            <Metadata icon="calendar-outline" value={application.appliedAt ? formatDate(application.appliedAt) : 'Date non renseignee'} />
            <Metadata icon="location-outline" value={offer?.location || 'Lieu non renseigne'} />
          </View>
        </View>
        <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={20} />
      </GlassCard>
    </Pressable>
  );
});

function Metadata({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <View style={styles.metaItem}><Ionicons color={theme.colors.textMuted} name={icon} size={14} /><Text numberOfLines={1} style={styles.metaText}>{value}</Text></View>;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date non renseignee' : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: { minHeight: 142, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  logo: { width: 48, height: 48, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border },
  initial: { color: theme.colors.primary, fontSize: 19, lineHeight: 23, fontWeight: '800' },
  content: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  topRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  score: { color: theme.colors.primary, ...theme.typography.label },
  title: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  company: { color: theme.colors.textSecondary, ...theme.typography.caption },
  metadata: { marginTop: theme.spacing.xs, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  metaItem: { minWidth: 0, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  metaText: { maxWidth: 170, color: theme.colors.textMuted, ...theme.typography.caption },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
