import { Ionicons } from '@expo/vector-icons';

import type { BadgeTone } from '@/shared/components/AppBadge';
import type { ApplicationStatus } from '../models/applicationStatus';

export type ApplicationStatusConfig = {
  label: string;
  shortLabel: string;
  description: string;
  tone: BadgeTone;
  icon: keyof typeof Ionicons.glyphMap;
  order: number;
};

const config: Record<ApplicationStatus, ApplicationStatusConfig> = {
  SENT: {
    label: 'Candidature envoyee', shortLabel: 'Envoyee',
    description: 'Votre candidature a bien ete transmise a l entreprise.',
    tone: 'info', icon: 'paper-plane-outline', order: 1,
  },
  PENDING: {
    label: 'En cours d etude', shortLabel: 'En etude',
    description: 'L entreprise examine actuellement votre candidature.',
    tone: 'warning', icon: 'hourglass-outline', order: 2,
  },
  ACCEPTED: {
    label: 'Candidature acceptee', shortLabel: 'Acceptee',
    description: 'L entreprise a rendu une decision positive.',
    tone: 'success', icon: 'checkmark-circle-outline', order: 3,
  },
  REJECTED: {
    label: 'Candidature refusee', shortLabel: 'Refusee',
    description: 'L entreprise n a pas retenu cette candidature.',
    tone: 'danger', icon: 'close-circle-outline', order: 3,
  },
  CANCELLED: {
    label: 'Candidature annulee', shortLabel: 'Annulee',
    description: 'Cette candidature a ete marquee comme annulee.',
    tone: 'neutral', icon: 'remove-circle-outline', order: 3,
  },
  UNKNOWN: {
    label: 'Statut inconnu', shortLabel: 'Inconnu',
    description: 'Le serveur a retourne un statut qui n est pas encore reconnu.',
    tone: 'neutral', icon: 'help-circle-outline', order: 99,
  },
};

export const getApplicationStatusConfig = (status: ApplicationStatus) => config[status];
