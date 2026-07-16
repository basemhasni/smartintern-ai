import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { StatusMessage } from '@/shared/components/StatusMessage';

export function ProfileRequirementsCard({ hasProfile, hasAnalyzedCv, onManageCv }: { hasProfile: boolean; hasAnalyzedCv: boolean; onManageCv: () => void }) {
  if (hasProfile && hasAnalyzedCv) return null;
  return <GlassCard accent><StatusMessage tone="info" message={!hasProfile ? 'Completez votre profil avant de lancer une analyse personnalisee.' : 'Ajoutez un CV analyse pour utiliser cette fonctionnalite IA.'} /><GradientButton icon="document-text-outline" label="Gerer mon CV" onPress={onManageCv} variant="secondary" /></GlassCard>;
}

