import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Register: undefined;
};

export type OnboardingStackParamList = {
  OnboardingIntro: undefined;
  OnboardingSection: {
    section: 'basics' | 'background' | 'family' | 'lifestyle' | 'partner' | 'photos';
  };
};

export type MainTabParamList = {
  HomeTab: undefined;
  DiscoverTab: undefined;
  ConnectionsTab: { segment?: 'received' | 'sent' | 'connected' | 'contact' } | undefined;
  MessagesTab: undefined;
  MeTab: undefined;
};

export type RootStackParamList = {
  Boot: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ProfileDetail: { profileId: string };
  ChatThread: { conversationId: string };
  Settings: undefined;
  NotificationSettings: undefined;
  About: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
