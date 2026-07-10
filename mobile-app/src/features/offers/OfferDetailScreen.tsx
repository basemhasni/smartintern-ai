import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppBadge } from '@/shared/components/AppBadge';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'OfferDetail'>;

export function OfferDetailScreen({ navigation }: Props) {
  // TODO Step 3: connect offers API.
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  return <Screen><View style={styles.toolbar}><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><View style={styles.toolbarActions}><IconButton icon="bookmark-outline" label="Enregistrer" onPress={() => undefined} /><IconButton icon="share-outline" label="Partager" onPress={() => undefined} /></View></View><View style={styles.hero}><View style={styles.companyLogo}><Text style={styles.companyInitial}>N</Text></View><View style={styles.heroCopy}><AppBadge icon="sparkles" label="94% de compatibilité" tone="success" /><Text style={styles.title}>Stage Frontend Engineer</Text><Text style={styles.company}>Nexa Labs · Tunis · Hybride</Text></View></View><View style={styles.quickFacts}>{[{ icon: 'time-outline', value: '6 mois', label: 'Durée' }, { icon: 'location-outline', value: 'Hybride', label: 'Mode' }, { icon: 'calendar-outline', value: 'Juillet', label: 'Début' }].map((fact) => <View key={fact.label} style={styles.fact}><Ionicons color={theme.colors.primary} name={fact.icon as keyof typeof Ionicons.glyphMap} size={19} /><Text style={styles.factValue}>{fact.value}</Text><Text style={styles.factLabel}>{fact.label}</Text></View>)}</View><GlassCard><SectionHeader title="La mission" /><Text style={styles.body}>Contribuer à une plateforme SaaS moderne, construire des interfaces accessibles et collaborer avec une équipe produit expérimentée.</Text></GlassCard><GlassCard><SectionHeader title="Compétences clés" subtitle="Ce que l’équipe recherche" /><View style={styles.skills}>{['React', 'TypeScript', 'REST API', 'Git'].map((skill) => <AppBadge key={skill} label={skill} tone="neutral" />)}</View></GlassCard><LinearGradient colors={theme.gradients.premium} style={styles.aiCard}><View style={styles.aiTitle}><View style={styles.aiIcon}><Ionicons color={theme.colors.white} name="sparkles" size={20} /></View><View><Text style={styles.aiEyebrow}>SMARTINTERN INTELLIGENCE</Text><Text style={styles.aiHeading}>Pourquoi cette offre vous correspond</Text></View></View><Text style={styles.aiBody}>Votre expérience React et vos projets TypeScript soutiennent fortement ce match. L’analyse détaillée sera disponible prochainement.</Text><View style={styles.aiSignal}><Ionicons color="#6EE7B7" name="checkmark-circle" size={17} /><Text style={styles.aiSignalText}>2 compétences fortes détectées</Text></View></LinearGradient><GradientButton disabled icon="paper-plane-outline" label="Candidature bientôt disponible" /></Screen>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolbarActions: { flexDirection: 'row', gap: theme.spacing.sm },
  hero: { paddingVertical: theme.spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.lg },
  companyLogo: { width: 58, height: 58, borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadowSmall },
  companyInitial: { color: theme.colors.primary, fontSize: 23, lineHeight: 28, fontWeight: '800' },
  heroCopy: { flex: 1, minWidth: 0, gap: theme.spacing.sm },
  title: { color: theme.colors.textPrimary, ...theme.typography.title },
  company: { color: theme.colors.textSecondary, ...theme.typography.body },
  quickFacts: { flexDirection: 'row', borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', ...theme.shadowSmall },
  fact: { flex: 1, minWidth: 0, alignItems: 'center', gap: 3, paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xs },
  factValue: { color: theme.colors.textPrimary, ...theme.typography.label },
  factLabel: { color: theme.colors.textMuted, ...theme.typography.caption },
  body: { color: theme.colors.textSecondary, ...theme.typography.body, marginTop: theme.spacing.md },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.md },
  aiCard: { borderRadius: theme.radius.xl, padding: theme.spacing.xl, gap: theme.spacing.lg, ...theme.shadow },
  aiTitle: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  aiIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)' },
  aiEyebrow: { color: '#A7F3D0', ...theme.typography.overline },
  aiHeading: { color: theme.colors.white, ...theme.typography.subheading },
  aiBody: { color: 'rgba(255,255,255,0.78)', ...theme.typography.body },
  aiSignal: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  aiSignalText: { color: '#A7F3D0', ...theme.typography.caption },
});
