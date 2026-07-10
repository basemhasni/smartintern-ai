import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { Screen } from '@/shared/components/Screen';

const insights = [
  { icon: 'analytics-outline', title: 'Matching Score', text: 'Compatibilité avec chaque offre', status: '82/100', active: true },
  { icon: 'git-network-outline', title: 'Career Signal Map', text: 'Vos domaines de force', status: 'Bientôt', active: false },
  { icon: 'shield-checkmark-outline', title: 'Skill Evidence', text: 'Compétences et preuves', status: 'Bientôt', active: false },
  { icon: 'list-outline', title: 'Decision Trace', text: 'Facteurs de recommandation', status: 'Bientôt', active: false },
  { icon: 'flask-outline', title: 'Skill Gap Simulator', text: 'Simulation de progression', status: 'Bientôt', active: false },
] as const;

export function AiInsightsScreen() {
  // TODO Step 5: connect AI insights API.
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <Screen eyebrow="Intelligence carrière" title="Vos signaux IA" subtitle="Des recommandations lisibles, transparentes et orientées action."><LinearGradient colors={theme.gradients.premium} style={styles.featured}><View style={styles.featuredTop}><View style={styles.featuredIcon}><Ionicons color={theme.colors.white} name="sparkles" size={23} /></View><AppBadge icon="pulse" label="Aperçu" tone="success" /></View><Text style={styles.featuredTitle}>Votre potentiel, décodé.</Text><Text style={styles.featuredText}>Votre profil montre une forte cohérence produit et frontend. Les modules restent en mode aperçu jusqu’à la connexion IA.</Text><View style={styles.signalRow}><View><Text style={styles.signalValue}>82</Text><Text style={styles.signalLabel}>Score global</Text></View><View style={styles.separator} /><View><Text style={styles.signalValue}>2</Text><Text style={styles.signalLabel}>Forces clés</Text></View><View style={styles.separator} /><View><Text style={styles.signalValue}>3</Text><Text style={styles.signalLabel}>Pistes d’action</Text></View></View></LinearGradient><Text style={styles.sectionTitle}>Modules d’analyse</Text>{insights.map((item) => <Pressable disabled={!item.active} key={item.title} style={({ pressed }) => pressed && styles.pressed}><GlassCard style={styles.card} variant={item.active ? 'elevated' : 'soft'}><View style={[styles.icon, item.active && styles.iconActive]}><Ionicons color={item.active ? theme.colors.white : theme.colors.primary} name={item.icon} size={22} /></View><View style={styles.copy}><Text style={styles.title}>{item.title}</Text><Text style={styles.text}>{item.text}</Text></View><AppBadge label={item.status} tone={item.active ? 'success' : 'neutral'} /><Ionicons color={theme.colors.textMuted} name="chevron-forward" size={17} /></GlassCard></Pressable>)}</Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  featured: { borderRadius: theme.radius.xl, padding: theme.spacing.xl, gap: theme.spacing.md, ...theme.shadow },
  featuredTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featuredIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)' },
  featuredTitle: { color: theme.colors.white, ...theme.typography.heading, fontSize: 23, lineHeight: 29 },
  featuredText: { color: 'rgba(255,255,255,0.76)', ...theme.typography.body },
  signalRow: { marginTop: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  signalValue: { color: theme.colors.white, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  signalLabel: { color: 'rgba(255,255,255,0.58)', ...theme.typography.caption },
  separator: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.14)' },
  sectionTitle: { marginTop: theme.spacing.sm, color: theme.colors.textPrimary, ...theme.typography.heading },
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceSubtle },
  iconActive: { backgroundColor: theme.colors.primary },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { color: theme.colors.textPrimary, ...theme.typography.label },
  text: { color: theme.colors.textSecondary, ...theme.typography.caption },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
