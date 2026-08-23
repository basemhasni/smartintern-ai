import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import type { RootStackParamList } from '@/core/navigation/navigationTypes';
import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import type { StudentProfile } from '@/features/student/models/studentProfile';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { ErrorState } from '@/shared/components/ErrorState';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { StatusMessage } from '@/shared/components/StatusMessage';
import { confirmAction } from '@/shared/utils/confirmAction';
import type { StudentProfileUpdate } from '../models/profileUpdate';
import { useStudentProfile } from '../state/StudentProfileContext';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'EditProfile'>>;
type FormState = Record<keyof StudentProfileUpdate, string>;

export function EditProfileScreen({ navigation }: Props) {
  const { profile, isLoading, error } = useStudentProfile();
  if (isLoading && !profile) return <Screen><LoadingState label="Chargement du profil..." /></Screen>;
  if (!profile) return <Screen><ErrorState message={error || 'Profil introuvable.'} /></Screen>;
  return <EditProfileForm key={profile.updatedAt ?? profile.id} navigation={navigation} profile={profile} />;
}

function EditProfileForm({ navigation, profile }: Readonly<{ navigation: Props['navigation']; profile: StudentProfile }>) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  const { updateProfile, isSavingProfile, error, successMessage, clearMessages } = useStudentProfile();
  const initial = useMemo<FormState>(() => ({ phone: profile.phone ?? '', location: profile.location ?? '', educationLevel: profile.educationLevel ?? '', targetJob: profile.targetJob ?? '', bio: profile.bio ?? '', availabilityDate: profile.availabilityDate?.slice(0, 10) ?? '' }), [profile]);
  const [form, setForm] = useState(initial); const [fieldError, setFieldError] = useState<string | null>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  usePreventRemove(dirty, ({ data }) => confirmAction({ title: 'Modifications non enregistrees', message: 'Quitter sans enregistrer ?', confirmLabel: 'Quitter', destructive: true, onConfirm: () => navigation.dispatch(data.action) }));
  const set = (field: keyof FormState, value: string) => { clearMessages(); setFieldError(null); setForm((current) => ({ ...current, [field]: value })); };
  const save = async () => {
    const validation = validateForm(form); if (validation) { setFieldError(validation); return; }
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() || null])) as StudentProfileUpdate;
    const saved = await updateProfile(payload); if (saved) navigation.goBack();
  };
  return <Screen><View style={styles.toolbar}><IconButton icon="arrow-back" label="Retour" onPress={() => navigation.goBack()} /><Text style={styles.toolbarTitle}>Modifier le profil</Text><View style={styles.spacer} /></View><GlassCard accent><SectionHeader title={`${profile.user.firstName ?? ''} ${profile.user.lastName ?? ''}`.trim() || 'Identite etudiante'} subtitle={profile.user.email} /><Text style={styles.note}>Le nom, l email et le role ne sont pas modifiables depuis cet endpoint.</Text></GlassCard>{fieldError ? <StatusMessage tone="error" message={fieldError} /> : null}{error ? <StatusMessage tone="error" message={error} /> : null}{successMessage ? <StatusMessage tone="success" message={successMessage} /> : null}<GlassCard><SectionHeader title="Informations personnelles" /><View style={styles.fields}><AppTextInput icon="call-outline" label="Telephone" maxLength={30} onChangeText={(value) => set('phone', value)} value={form.phone} /><AppTextInput icon="location-outline" label="Localisation" maxLength={120} onChangeText={(value) => set('location', value)} value={form.location} /><AppTextInput icon="calendar-outline" label="Disponibilite" helper="Format AAAA-MM-JJ" maxLength={10} onChangeText={(value) => set('availabilityDate', value)} value={form.availabilityDate} /></View></GlassCard><GlassCard><SectionHeader title="Formation et projet professionnel" /><View style={styles.fields}><AppTextInput icon="school-outline" label="Niveau d etudes" maxLength={120} onChangeText={(value) => set('educationLevel', value)} value={form.educationLevel} /><AppTextInput icon="navigate-outline" label="Objectif professionnel" maxLength={120} onChangeText={(value) => set('targetJob', value)} value={form.targetJob} /><AppTextInput icon="person-outline" label="Presentation" maxLength={1000} multiline numberOfLines={6} onChangeText={(value) => set('bio', value)} value={form.bio} /></View></GlassCard><GradientButton disabled={!dirty} icon="save-outline" label="Enregistrer les modifications" loading={isSavingProfile} onPress={() => void save()} /></Screen>;
}

const validateForm = (form: FormState) => {
  if (form.availabilityDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.availabilityDate)) return 'La disponibilite doit utiliser le format AAAA-MM-JJ.';
  if (form.availabilityDate && Number.isNaN(new Date(form.availabilityDate).getTime())) return 'La date de disponibilite est invalide.';
  return null;
};
const createStyles = (theme: AppTheme) => StyleSheet.create({ toolbar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, toolbarTitle: { color: theme.colors.textPrimary, ...theme.typography.label }, spacer: { width: 44 }, note: { marginTop: theme.spacing.md, color: theme.colors.textMuted, ...theme.typography.caption }, fields: { marginTop: theme.spacing.lg, gap: theme.spacing.lg } });
