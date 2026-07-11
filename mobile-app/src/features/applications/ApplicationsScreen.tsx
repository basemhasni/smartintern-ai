import { Ionicons } from '@expo/vector-icons';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge, type BadgeTone } from '@/shared/components/AppBadge';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { GlassCard } from '@/shared/components/GlassCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import type { StudentApplication } from './models/application';
import { useApplications } from './state/ApplicationsContext';

const statusConfig: Record<string, { label: string; tone: BadgeTone }> = {
  SENT: { label: 'Envoyee', tone: 'info' },
  PENDING: { label: 'En etude', tone: 'warning' },
  ACCEPTED: { label: 'Acceptee', tone: 'success' },
  REJECTED: { label: 'Refusee', tone: 'danger' },
  CANCELLED: { label: 'Annulee', tone: 'neutral' },
};

export function ApplicationsScreen() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const { applications, isLoading, isRefreshing, error, refresh } = useApplications();
  const activeCount = applications.filter((item) => item.status === 'SENT' || item.status === 'PENDING').length;
  const acceptedCount = applications.filter((item) => item.status === 'ACCEPTED').length;

  return (
    <Screen
      eyebrow="Suivi"
      refreshControl={<RefreshControl refreshing={isRefreshing} tintColor={theme.colors.primary} onRefresh={() => void refresh()} />}
      subtitle="Suivez les statuts transmis par les entreprises."
      title="Mes candidatures"
    >
      <View style={styles.summary}>
        <Summary icon="documents-outline" label="Total" value={applications.length} />
        <Summary icon="hourglass-outline" label="Actives" value={activeCount} />
        <Summary icon="checkmark-circle-outline" label="Acceptees" value={acceptedCount} />
      </View>

      {isLoading && !applications.length ? <LoadingState label="Chargement des candidatures..." /> : null}
      {error && !applications.length ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {!isLoading && !error && !applications.length ? <EmptyState message="Vos candidatures envoyees apparaitront ici." title="Aucune candidature" /> : null}

      {applications.map((application) => <ApplicationCard application={application} key={application.id || application.offerId} />)}
    </Screen>
  );
}

function Summary({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: number; label: string }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <GlassCard style={styles.stat}><Ionicons color={theme.colors.primary} name={icon} size={19} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></GlassCard>;
}

function ApplicationCard({ application }: { application: StudentApplication }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const status = statusConfig[application.status] ?? { label: application.status, tone: 'neutral' as const };
  return (
    <GlassCard style={styles.application}>
      <View style={styles.applicationIcon}><Ionicons color={theme.colors.primary} name="briefcase-outline" size={20} /></View>
      <View style={styles.applicationCopy}>
        <View style={styles.applicationHeader}>
          <View style={styles.flex}>
            <Text numberOfLines={2} style={styles.role}>{application.offer?.title || 'Offre'}</Text>
            <Text numberOfLines={1} style={styles.company}>{application.offer?.company.companyName || 'Entreprise non renseignee'}</Text>
          </View>
          <AppBadge label={status.label} tone={status.tone} />
        </View>
        <Text style={styles.date}>{application.appliedAt ? `Envoyee le ${formatDate(application.appliedAt)}` : 'Date non renseignee'}</Text>
      </View>
    </GlassCard>
  );
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));

const createStyles = (theme: AppTheme) => StyleSheet.create({
  summary: { flexDirection: 'row', gap: theme.spacing.sm },
  stat: { flex: 1, minWidth: 0, alignItems: 'center', gap: 3, padding: theme.spacing.md },
  statValue: { color: theme.colors.textPrimary, fontSize: 22, lineHeight: 27, fontWeight: '800' },
  statLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  application: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
  applicationIcon: { width: 42, height: 42, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  applicationCopy: { flex: 1, minWidth: 0, gap: theme.spacing.md },
  applicationHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
  flex: { flex: 1, minWidth: 0, gap: 3 },
  role: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  company: { color: theme.colors.textSecondary, ...theme.typography.caption },
  date: { color: theme.colors.textMuted, ...theme.typography.caption },
});
