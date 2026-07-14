import type { MotivationLetterTone } from '../models/motivationLetter';

export const letterToneOptions: {
  value: MotivationLetterTone;
  label: string;
  description: string;
  icon: 'business-outline' | 'flash-outline' | 'reader-outline';
}[] = [
  {
    value: 'PROFESSIONAL',
    label: 'Professionnel',
    description: 'Structure claire et adaptee a une candidature classique.',
    icon: 'business-outline',
  },
  {
    value: 'DYNAMIC',
    label: 'Dynamique',
    description: 'Style direct qui met en avant motivation et progression.',
    icon: 'flash-outline',
  },
  {
    value: 'SIMPLE',
    label: 'Simple',
    description: 'Lettre plus courte, lisible et centree sur les faits.',
    icon: 'reader-outline',
  },
];

export const getLetterToneLabel = (tone: string) =>
  letterToneOptions.find((item) => item.value === tone)?.label ?? tone;
