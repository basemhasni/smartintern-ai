import { View } from 'react-native';

import { AppBadge } from '@/shared/components/AppBadge';
import type { ApplicationStatus } from '../models/applicationStatus';
import { getApplicationStatusConfig } from '../config/applicationStatusConfig';

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const config = getApplicationStatusConfig(status);
  return (
    <View accessibilityLabel={`Statut : ${config.label}`}>
      <AppBadge icon={config.icon} label={config.shortLabel} tone={config.tone} />
    </View>
  );
}
