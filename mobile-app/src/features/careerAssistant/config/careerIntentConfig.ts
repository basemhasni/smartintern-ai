import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { CareerQuestionIntent } from '../models/careerAdvice';

export type CareerIntentOption = { value: CareerQuestionIntent; label: string; description: string; icon: ComponentProps<typeof Ionicons>['name']; question: string };

export const careerIntentOptions: CareerIntentOption[] = [
  { value: 'SKILL_GAPS', label: 'Competences', description: 'Priorites a renforcer', icon: 'construct-outline', question: 'Quelles competences dois-je ameliorer en priorite pour cette offre ?' },
  { value: 'LEARNING_PLAN', label: 'Plan', description: 'Roadmap de progression', icon: 'map-outline', question: 'Propose-moi un plan de progression pour cette offre.' },
  { value: 'CV_IMPROVEMENT', label: 'CV', description: 'Preuves a mieux presenter', icon: 'document-text-outline', question: 'Comment ameliorer mon CV pour cette offre ?' },
  { value: 'PROJECT_IDEAS', label: 'Projets', description: 'Preuves pratiques', icon: 'code-working-outline', question: 'Quel projet pourrais-je realiser pour renforcer ma candidature ?' },
  { value: 'INTERVIEW_PREP', label: 'Entretien', description: 'Points a preparer', icon: 'chatbubbles-outline', question: 'Que dois-je preparer pour un entretien lie a cette offre ?' },
];

export const readinessLabels: Record<string, string> = { READY: 'Profil pret', ALMOST_READY: 'Presque pret', NEEDS_TARGETED_WORK: 'Travail cible necessaire', NEEDS_MAJOR_WORK: 'Progression importante necessaire', INSUFFICIENT_DATA: 'Donnees insuffisantes' };
