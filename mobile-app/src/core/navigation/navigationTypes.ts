import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  StudentTabs: NavigatorScreenParams<StudentTabParamList> | undefined;
  OfferDetail: { offerId: string };
  SkillGapSimulator: { offerId: string };
  CareerAssistant: { offerId?: string } | undefined;
  ApplicationDetail: { applicationId: string };
  MotivationLetters: undefined;
  MotivationLetterGenerator: { offerId?: string; applicationId?: string } | undefined;
  MotivationLetterDetail: { applicationId: string };
  UnsupportedRole: undefined;
};

export type StudentTabParamList = {
  StudentHome: undefined;
  Offers: undefined;
  Applications: undefined;
  AiInsights: { offerId?: string } | undefined;
  Profile: undefined;
};
