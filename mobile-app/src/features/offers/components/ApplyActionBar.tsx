import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import type { StudentApplication } from '@/features/applications/models/application';
import { GradientButton } from '@/shared/components/GradientButton';
import { StatusMessage } from '@/shared/components/StatusMessage';

type Props = {
  offerTitle: string;
  existingApplication?: StudentApplication;
  isChecking: boolean;
  isApplying: boolean;
  disabledReason?: string | null;
  error?: string | null;
  success: boolean;
  onApply: () => Promise<void>;
};

export function ApplyActionBar({ offerTitle, existingApplication, isChecking, isApplying, disabledReason, error, success, onApply }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const alreadyApplied = Boolean(existingApplication);

  const confirm = async () => {
    await onApply();
    setConfirmationOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {error ? <StatusMessage message={error} tone="error" /> : null}
      {success ? <StatusMessage message="Votre candidature a ete envoyee avec succes." tone="success" /> : null}
      {alreadyApplied ? (
        <View accessibilityRole="summary" style={styles.applied}>
          <Ionicons color={theme.colors.success} name="checkmark-circle" size={22} />
          <View style={styles.copy}>
            <Text style={styles.appliedTitle}>Candidature deja envoyee</Text>
            <Text style={styles.appliedMeta}>{formatStatus(existingApplication?.status)}{existingApplication?.appliedAt ? ` · ${formatDate(existingApplication.appliedAt)}` : ''}</Text>
          </View>
        </View>
      ) : (
        <>
          {disabledReason ? <Text style={styles.reason}>{disabledReason}</Text> : null}
          <GradientButton
            disabled={Boolean(disabledReason) || isChecking}
            icon="paper-plane-outline"
            label={isChecking ? 'Verification...' : 'Postuler maintenant'}
            onPress={() => setConfirmationOpen(true)}
          />
        </>
      )}

      <Modal animationType="fade" onRequestClose={() => setConfirmationOpen(false)} transparent visible={confirmationOpen}>
        <View style={styles.overlay}>
          <Pressable accessibilityLabel="Fermer la confirmation" onPress={() => setConfirmationOpen(false)} style={StyleSheet.absoluteFill} />
          <View accessibilityViewIsModal style={styles.modal}>
            <View style={styles.modalIcon}><Ionicons color={theme.colors.primary} name="paper-plane-outline" size={24} /></View>
            <Text style={styles.modalTitle}>Confirmer la candidature</Text>
            <Text style={styles.offerTitle} numberOfLines={3}>{offerTitle}</Text>
            <Text style={styles.modalBody}>Votre candidature et votre profil SmartIntern seront transmis a l entreprise. Aucune lettre de motivation n est generee a cette etape.</Text>
            <View style={styles.actions}>
              <GradientButton disabled={isApplying} label="Annuler" onPress={() => setConfirmationOpen(false)} variant="secondary" style={styles.action} />
              <GradientButton icon="checkmark" label="Confirmer" loading={isApplying} onPress={() => void confirm()} style={styles.action} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const formatStatus = (status?: string) => ({ SENT: 'Envoyee', PENDING: 'En etude', ACCEPTED: 'Acceptee', REJECTED: 'Refusee', CANCELLED: 'Annulee' }[status ?? ''] ?? status ?? 'Envoyee');
const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));

const createStyles = (theme: AppTheme) => StyleSheet.create({
  wrapper: { gap: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow },
  applied: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  appliedTitle: { color: theme.colors.textPrimary, ...theme.typography.label },
  appliedMeta: { color: theme.colors.success, ...theme.typography.caption },
  reason: { color: theme.colors.warning, ...theme.typography.caption },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.overlay },
  modal: { width: '100%', maxWidth: 500, padding: theme.spacing.xl, gap: theme.spacing.md, borderRadius: theme.radius.xl, backgroundColor: theme.colors.backgroundElevated, borderWidth: 1, borderColor: theme.colors.borderBright, ...theme.shadow },
  modalIcon: { width: 48, height: 48, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  modalTitle: { color: theme.colors.textPrimary, ...theme.typography.heading },
  offerTitle: { color: theme.colors.primary, ...theme.typography.subheading },
  modalBody: { color: theme.colors.textSecondary, ...theme.typography.body },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  action: { flexGrow: 1, flexBasis: 150 },
});
