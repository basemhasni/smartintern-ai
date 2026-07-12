import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/core/theme/ThemeProvider';
import type { AppTheme } from '@/core/theme/theme';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { GlassCard } from '@/shared/components/GlassCard';
import { GradientButton } from '@/shared/components/GradientButton';
import { SectionHeader } from '@/shared/components/SectionHeader';
import { careerIntentOptions } from '../config/careerIntentConfig';
import type { CareerAnswer } from '../models/careerAdvice';

export function CareerQuestionForm({ loading, onSubmit }: { loading: boolean; onSubmit: (question: string) => Promise<boolean> }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  const [question, setQuestion] = useState('');
  const error = question.length > 500 ? 'Maximum 500 caracteres.' : undefined;
  const submit = async () => { if (!question.trim() || error) return; if (await onSubmit(question)) setQuestion(''); };
  return <GlassCard><SectionHeader title="Poser une question ciblee" subtitle="La reponse utilise uniquement votre profil, le matching et les sources autorisees" /><ScrollView contentContainerStyle={styles.intents} horizontal showsHorizontalScrollIndicator={false}>{careerIntentOptions.map((intent) => <Pressable accessibilityRole="button" key={intent.value} onPress={() => setQuestion(intent.question)} style={styles.intent}><Ionicons color={theme.colors.primary} name={intent.icon} size={19} /><Text style={styles.intentLabel}>{intent.label}</Text></Pressable>)}</ScrollView><View style={styles.form}><AppTextInput label="Votre question" icon="chatbubble-ellipses-outline" multiline numberOfLines={4} maxLength={520} value={question} onChangeText={setQuestion} error={error} helper={`${question.length}/500`} placeholder="Que dois-je ameliorer pour cette offre ?" textAlignVertical="top" /><GradientButton icon="send-outline" label="Envoyer ma question" loading={loading} disabled={!question.trim() || Boolean(error)} onPress={() => void submit()} /></View></GlassCard>;
}

export function CareerAnswerHistory({ answers, onClear }: { answers: CareerAnswer[]; onClear: () => void }) {
  const { theme } = useAppTheme(); const styles = createStyles(theme);
  if (!answers.length) return null;
  return <GlassCard><View style={styles.historyHeader}><SectionHeader title="Dernieres reponses" /><Pressable accessibilityRole="button" onPress={onClear}><Text style={styles.clear}>Effacer</Text></Pressable></View><View style={styles.history}>{answers.map((answer) => <View key={answer.id} style={styles.answer}><Text style={styles.question}>{answer.question}</Text>{answer.intent ? <Text style={styles.intentName}>{answer.intent}</Text> : null}{answer.answer ? <Text style={styles.answerText}>{answer.answer}</Text> : null}</View>)}</View></GlassCard>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  intents: { gap: theme.spacing.sm, marginTop: theme.spacing.lg, paddingRight: theme.spacing.md }, intent: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }, intentLabel: { color: theme.colors.textPrimary, ...theme.typography.caption, fontWeight: '700' }, form: { marginTop: theme.spacing.lg, gap: theme.spacing.md }, historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }, clear: { color: theme.colors.danger, ...theme.typography.caption, fontWeight: '700' }, history: { marginTop: theme.spacing.lg, gap: theme.spacing.md }, answer: { padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceMuted, gap: theme.spacing.sm }, question: { color: theme.colors.textPrimary, ...theme.typography.label }, intentName: { color: theme.colors.primary, ...theme.typography.overline }, answerText: { color: theme.colors.textSecondary, ...theme.typography.body },
});
