import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import type { SimulationMode } from '../models/skillGapSimulation';
const modes: {
    value: SimulationMode;
    label: string;
    description: string;
}[] = [{ value: 'CONSERVATIVE', label: 'Prudente', description: 'Progression limitee et verifiable.' }, { value: 'REALISTIC', label: 'Realiste', description: 'Parcours de progression atteignable.' }, { value: 'OPTIMISTIC', label: 'Optimiste', description: 'Estimation haute sous hypotheses favorables.' }];
export function SimulationModeSelector({ value, onChange }: {
    value: SimulationMode;
    onChange: (v: SimulationMode) => void;
}) { const { theme } = useAppTheme(); const styles = createStyles(theme); return <View accessibilityRole="radiogroup" style={styles.list}>{modes.map(m => { const active = value === m.value; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: active }} key={m.value} onPress={() => onChange(m.value)} style={[styles.item, active && styles.active]}><Text style={[styles.label, active && styles.activeLabel]}>{m.label}</Text><Text style={styles.description}>{m.description}</Text></Pressable>; })}</View>; }
;
const createStyles = (t: AppTheme) => StyleSheet.create({ list: { gap: t.spacing.sm }, item: { minHeight: 66, padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: t.colors.surfaceMuted, borderWidth: 1, borderColor: t.colors.border }, active: { borderColor: t.colors.primary, backgroundColor: t.colors.surfaceStrong }, label: { color: t.colors.textPrimary, ...t.typography.label }, activeLabel: { color: t.colors.primary }, description: { marginTop: t.spacing.xs, color: t.colors.textSecondary, ...t.typography.caption } });
