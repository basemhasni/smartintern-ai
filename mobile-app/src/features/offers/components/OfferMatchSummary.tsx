import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { StatusMessage } from '@/shared/components/StatusMessage';
import type { OfferMatch } from '../models/offerMatch';
import { getDecisionLabel } from './MatchScoreBadge';

type Props = {
  match?: OfferMatch;
  canAnalyze: boolean;
  isAnalyzing: boolean;
  error: string | null;
  hasCv: boolean;
  onAnalyze: () => void;
  onOpenProfile: () => void;
};

export function OfferMatchSummary({ match, canAnalyze, isAnalyzing, error, hasCv, onAnalyze, onOpenProfile }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  if (!match?.isAvailable) {
    return (
      <GlassCard accent style={styles.emptyCard}>
        <View style={styles.emptyIcon}><Ionicons color={theme.colors.primary} name="sparkles" size={22} /></View>
        <View style={styles.flex}>
          <Text style={styles.heading}>Compatibilite IA</Text>
          <Text style={styles.body}>
            {hasCv
              ? 'Lancez une analyse ponctuelle de votre profil pour cette offre.'
              : 'Ajoutez et analysez votre CV pour obtenir une compatibilite fiable.'}
          </Text>
        </View>
        {error ? <StatusMessage message={error} tone="error" /> : null}
        <GradientButton
          icon={canAnalyze ? 'sparkles-outline' : 'person-outline'}
          label={canAnalyze ? 'Analyser mon profil' : 'Completer mon profil'}
          loading={isAnalyzing}
          onPress={canAnalyze ? onAnalyze : onOpenProfile}
        />
      </GlassCard>
    );
  }

  const breakdown = Object.entries(match.scoreBreakdown ?? {})
    .filter(([key]) => !['rawTotal', 'total'].includes(key))
    .slice(0, 6);

  return (
    <View style={styles.section}>
      <LinearGradient colors={theme.gradients.premium} style={styles.summary}>
        <View style={styles.scoreRing}>
          <Text accessibilityLabel={`Score de compatibilite ${match.score} sur 100`} style={styles.score}>{match.score}</Text>
          <Text style={styles.scoreUnit}>/ 100</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>COMPATIBILITE IA</Text>
          <Text style={styles.matchTitle}>{getDecisionLabel(match)}</Text>
          {match.confidence ? <Text style={styles.confidence}>Confiance {formatLabel(match.confidence)}</Text> : null}
        </View>
      </LinearGradient>

      {match.explanation ? <GlassCard><Text style={styles.body}>{match.explanation}</Text></GlassCard> : null}

      <View style={styles.columns}>
        <SignalCard icon="checkmark-circle-outline" title="Points forts" skills={match.matchedSkills} tone="success" empty="Aucune correspondance explicite." />
        <SignalCard icon="alert-circle-outline" title="A renforcer" skills={match.missingSkills} tone="warning" empty="Aucun manque signale." />
      </View>

      {match.criticalMissingSkills.length ? (
        <StatusMessage message={`Competences critiques manquantes : ${match.criticalMissingSkills.join(', ')}`} tone="warning" />
      ) : null}

      {breakdown.length ? (
        <GlassCard>
          <Text style={styles.heading}>Detail du score</Text>
          <View style={styles.breakdown}>
            {breakdown.map(([key, value]) => (
              <View key={key} style={styles.breakdownRow}>
                <Text numberOfLines={1} style={styles.breakdownLabel}>{formatLabel(key)}</Text>
                <Text style={styles.breakdownValue}>{formatScore(value)}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      ) : null}

      {match.warnings.length ? <StatusMessage message={match.warnings.join(' ')} tone="warning" /> : null}
    </View>
  );
}

function SignalCard({ icon, title, skills, tone, empty }: { icon: keyof typeof Ionicons.glyphMap; title: string; skills: string[]; tone: 'success' | 'warning'; empty: string }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return (
    <GlassCard style={styles.signalCard}>
      <View style={styles.signalTitle}><Ionicons color={tone === 'success' ? theme.colors.success : theme.colors.warning} name={icon} size={19} /><Text style={styles.heading}>{title}</Text></View>
      {skills.length ? <View style={styles.skills}>{skills.slice(0, 6).map((skill) => <AppBadge key={skill} label={skill} tone={tone} />)}</View> : <Text style={styles.muted}>{empty}</Text>}
    </GlassCard>
  );
}

const formatLabel = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();
const formatScore = (value: number) => `${Math.round(value <= 1 ? value * 100 : value)}%`;

const createStyles = (theme: AppTheme) => StyleSheet.create({
  section: { gap: theme.spacing.md },
  summary: { borderRadius: theme.radius.xl, padding: theme.spacing.xl, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg, ...theme.shadow },
  scoreRing: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  score: { color: theme.colors.white, fontSize: 30, lineHeight: 34, fontWeight: '800' },
  scoreUnit: { color: 'rgba(255,255,255,0.7)', ...theme.typography.caption },
  flex: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  eyebrow: { color: '#A7F3D0', ...theme.typography.overline },
  matchTitle: { color: theme.colors.white, ...theme.typography.heading },
  confidence: { color: 'rgba(255,255,255,0.76)', ...theme.typography.caption, textTransform: 'capitalize' },
  emptyCard: { gap: theme.spacing.md },
  emptyIcon: { width: 44, height: 44, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted },
  heading: { color: theme.colors.textPrimary, ...theme.typography.subheading },
  body: { color: theme.colors.textSecondary, ...theme.typography.body },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  signalCard: { flexGrow: 1, flexBasis: 240, gap: theme.spacing.md },
  signalTitle: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  muted: { color: theme.colors.textMuted, ...theme.typography.caption },
  breakdown: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
  breakdownRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  breakdownLabel: { flex: 1, color: theme.colors.textSecondary, ...theme.typography.caption, textTransform: 'capitalize' },
  breakdownValue: { color: theme.colors.primary, ...theme.typography.label },
});
