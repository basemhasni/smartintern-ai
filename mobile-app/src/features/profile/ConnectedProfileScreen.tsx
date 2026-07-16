import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList, StudentTabParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme, ThemePreference } from '@/core/theme/theme';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useStudentDashboard } from '@/features/student/state/StudentDashboardContext';
import { ErrorState } from '@/shared/components/ErrorState';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { CvAnalysisSummaryCard } from './components/CvAnalysisSummaryCard';
import { CvStatusCard } from './components/CvStatusCard';
import { ProfileCompletionCard } from './components/ProfileCompletionCard';
import { ProfileHeaderCard } from './components/ProfileHeaderCard';
import { useStudentProfile } from './state/StudentProfileContext';

type Props = BottomTabScreenProps<StudentTabParamList, 'Profile'>;
const themeOptions: { label: string; value: ThemePreference; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Auto', value: 'system', icon: 'phone-portrait-outline' },
  { label: 'Clair', value: 'light', icon: 'sunny-outline' },
  { label: 'Sombre', value: 'dark', icon: 'moon-outline' },
];

export function ConnectedProfileScreen({ navigation }: Props) {
  const { logout, isLoading: isLoggingOut } = useAuth();
  const { theme, preference, setPreference } = useAppTheme();
  const styles = createStyles(theme);
  const { profileCompletion } = useStudentDashboard();
  const { profile, latestCv, isLoading, error, refresh } = useStudentProfile();
  const root = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  if (isLoading && !profile) return <Screen><LoadingState label="Chargement du profil..." /></Screen>;
  if (!profile) return <Screen><ErrorState message={error || 'Profil etudiant introuvable.'} onRetry={() => void refresh()} /></Screen>;

  const details = [
    { icon: 'mail-outline' as const, label: 'Email', value: profile.user.email },
    { icon: 'call-outline' as const, label: 'Telephone', value: profile.phone || 'Non renseigne' },
    { icon: 'location-outline' as const, label: 'Localisation', value: profile.location || 'Non renseignee' },
    { icon: 'calendar-outline' as const, label: 'Disponibilite', value: profile.availabilityDate ? formatDate(profile.availabilityDate) : 'Non renseignee' },
  ];

  return <Screen eyebrow="Compte et candidature" title="Mon profil" subtitle="Informations reelles utilisees pour personnaliser votre experience." refreshControl={<RefreshControl refreshing={isLoading} tintColor={theme.colors.primary} onRefresh={() => void refresh()} />}>
    <ProfileHeaderCard profile={profile} />
    <View style={styles.actions}><GradientButton icon="create-outline" label="Modifier mon profil" onPress={() => root?.navigate('EditProfile')} /><GradientButton icon="document-text-outline" label="Gerer mes CV" onPress={() => root?.navigate('CvManagement')} variant="secondary" /></View>
    <ProfileCompletionCard completion={profileCompletion} />

    <GlassCard><SectionHeader title="Informations principales" /><View style={styles.details}>{details.map((item) => <View key={item.label} style={styles.row}><View style={styles.rowIcon}><Ionicons color={theme.colors.primary} name={item.icon} size={18} /></View><View style={styles.copy}><Text style={styles.label}>{item.label}</Text><Text numberOfLines={2} style={styles.value}>{item.value}</Text></View></View>)}</View>{profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}</GlassCard>

    <CvStatusCard cv={latestCv} />
    {latestCv?.analysis ? <><CvAnalysisSummaryCard cv={latestCv} /><GradientButton icon="analytics-outline" label="Voir l analyse complete" onPress={() => root?.navigate('CvAnalysis', { cvId: latestCv.id })} variant="secondary" /></> : null}

    <GlassCard><SectionHeader title="Competences detectees" subtitle="Issues de l analyse IA du CV, non modifiables manuellement" /><View style={styles.skills}>{latestCv?.skills.length ? latestCv.skills.map((skill) => <View key={skill} style={styles.skill}><Text style={styles.skillText}>{skill}</Text></View>) : <Text style={styles.empty}>Aucune competence detectee. Ajoutez un CV lisible pour lancer l analyse.</Text>}</View></GlassCard>

    <GlassCard><SectionHeader title="Outils" /><View style={styles.actions}><GradientButton icon="document-text-outline" label="Mes lettres" onPress={() => root?.navigate('MotivationLetters')} variant="secondary" /></View></GlassCard>

    <Text style={styles.sectionTitle}>Apparence</Text><View accessibilityRole="radiogroup" style={styles.themeControl}>{themeOptions.map((option) => { const selected = preference === option.value; return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setPreference(option.value)} style={[styles.themeOption, selected && styles.themeOptionActive]}><Ionicons color={selected ? theme.colors.white : theme.colors.textSecondary} name={option.icon} size={18} /><Text style={[styles.themeText, selected && styles.themeTextActive]}>{option.label}</Text></Pressable>; })}</View>
    <Pressable accessibilityRole="button" disabled={isLoggingOut} onPress={() => void logout()} style={({ pressed }) => [styles.logout, pressed && styles.pressed, isLoggingOut && styles.disabled]}><Ionicons color={theme.colors.danger} name="log-out-outline" size={20} /><Text style={styles.logoutText}>{isLoggingOut ? 'Deconnexion...' : 'Se deconnecter'}</Text></Pressable>
  </Screen>;
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
const createStyles = (theme: AppTheme) => StyleSheet.create({
  actions: { gap: theme.spacing.sm }, details: { marginTop: theme.spacing.md, gap: theme.spacing.sm }, row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }, rowIcon: { width: 38, height: 38, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted }, copy: { flex: 1, minWidth: 0 }, label: { color: theme.colors.textMuted, ...theme.typography.caption }, value: { color: theme.colors.textPrimary, ...theme.typography.body }, bio: { marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border, color: theme.colors.textSecondary, ...theme.typography.body }, skills: { marginTop: theme.spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }, skill: { minHeight: 32, paddingHorizontal: theme.spacing.md, justifyContent: 'center', borderRadius: theme.radius.pill, backgroundColor: `${theme.colors.violet}14` }, skillText: { color: theme.colors.violet, ...theme.typography.caption, fontWeight: '700' }, empty: { color: theme.colors.textMuted, ...theme.typography.body }, sectionTitle: { color: theme.colors.textPrimary, ...theme.typography.heading }, themeControl: { flexDirection: 'row', gap: theme.spacing.xs, padding: theme.spacing.xs, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceMuted }, themeOption: { flex: 1, minHeight: 46, borderRadius: theme.radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, themeOptionActive: { backgroundColor: theme.colors.primary }, themeText: { color: theme.colors.textSecondary, ...theme.typography.caption }, themeTextActive: { color: theme.colors.white }, logout: { minHeight: 52, borderRadius: theme.radius.md, borderWidth: 1, borderColor: `${theme.colors.danger}38`, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, backgroundColor: `${theme.colors.danger}0D` }, logoutText: { color: theme.colors.danger, ...theme.typography.label }, pressed: { opacity: 0.75 }, disabled: { opacity: 0.5 },
});
