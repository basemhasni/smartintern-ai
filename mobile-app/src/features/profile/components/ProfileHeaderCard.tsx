import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { getUserDisplayName, getUserInitials } from '@/features/auth/models/userModel';
import type { StudentProfile } from '@/features/student/models/studentProfile';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';

export function ProfileHeaderCard({ profile }: { profile: StudentProfile }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <GlassCard accent><View style={styles.row}><View style={styles.avatar}><Text style={styles.initials}>{getUserInitials(profile.user)}</Text></View><View style={styles.copy}><Text style={styles.name}>{getUserDisplayName(profile.user)}</Text><Text numberOfLines={1} style={styles.title}>{profile.targetJob || 'Objectif professionnel non renseigne'}</Text><View style={styles.badges}><AppBadge icon="school-outline" label={profile.educationLevel || 'Formation a completer'} tone="violet" />{profile.location ? <AppBadge icon="location-outline" label={profile.location} tone="neutral" /> : null}</View></View><Ionicons color={theme.colors.success} name="checkmark-circle" size={22} /></View></GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: theme.radius.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryStrong, ...theme.shadowSmall },
  initials: { color: theme.colors.white, ...theme.typography.heading, fontWeight: '800' },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  name: { color: theme.colors.textPrimary, ...theme.typography.heading },
  title: { color: theme.colors.textSecondary, ...theme.typography.body },
  badges: { marginTop: theme.spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
});

