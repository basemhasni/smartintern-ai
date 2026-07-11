import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  StudentTabs: NavigatorScreenParams<StudentTabParamList> | undefined;
  OfferDetail: { offerId: string };
  UnsupportedRole: undefined;
};

export type StudentTabParamList = {
  StudentHome: undefined;
  Offers: undefined;
  Applications: undefined;
  AiInsights: undefined;
  Profile: undefined;
};
