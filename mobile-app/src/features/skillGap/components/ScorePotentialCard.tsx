import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import type { SkillGapSimulationResult } from '../models/skillGapSimulation';
export function ScorePotentialCard({ result }: {
    result: SkillGapSimulationResult;
}) { const { theme } = useAppTheme(); const s = styles(theme); return <LinearGradient colors={theme.gradients.premium} style={s.card}><View style={s.row}><Score label="Score actuel" value={result.currentScore}/><Score label="Potentiel estime" value={result.potentialBestScore}/><Score label="Gain estime" value={result.scoreGain} gain/></View>{result.summary ? <Text style={s.summary}>{result.summary}</Text> : null}<Text style={s.disclaimer}>Cette estimation depend des competences reellement acquises et demontrees. Elle ne garantit ni un futur score ni une decision de recrutement.</Text></LinearGradient>; }
;
function Score({ label, value, gain }: {
    label: string;
    value?: number;
    gain?: boolean;
}) { const { theme } = useAppTheme(); const s = styles(theme); return <View style={s.score}><Text style={s.label}>{label}</Text><Text accessibilityLabel={`${label} ${value === undefined ? 'non disponible' : value}`} style={s.value}>{value === undefined ? 'N/A' : `${gain && value >= 0 ? '+' : ''}${Math.round(value)}${gain ? ' pts' : '%'}`}</Text></View>; }
;
const styles = (t: AppTheme) => StyleSheet.create({ card: { borderRadius: t.radius.xl, padding: t.spacing.xl, gap: t.spacing.lg, ...t.shadow }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }, score: { flexGrow: 1, flexBasis: 120, minHeight: 82, padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: 'rgba(255,255,255,0.11)' }, label: { color: 'rgba(255,255,255,0.65)', ...t.typography.caption }, value: { marginTop: t.spacing.sm, color: t.colors.white, fontSize: 25, lineHeight: 30, fontWeight: '800' }, summary: { color: 'rgba(255,255,255,0.82)', ...t.typography.body }, disclaimer: { color: '#A7F3D0', ...t.typography.caption } });
