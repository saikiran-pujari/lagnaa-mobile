import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Compass, Heart, Home, MessageCircle, UserRound } from 'lucide-react-native';

import { BootScreen } from '@/app/BootScreen';
import { selectStatus, useSessionStore } from '@/core/session';
import { useTheme } from '@/design-system';
import { SignInScreen } from '@/features/auth/screens/SignInScreen';
import { WelcomeScreen } from '@/features/auth/screens/WelcomeScreen';
import { MessagesScreen } from '@/features/chat/screens/MessagesScreen';
import { ConnectionsScreen } from '@/features/connections/screens/ConnectionsScreen';
import { DiscoverScreen } from '@/features/discovery/screens/DiscoverScreen';
import { HomeScreen } from '@/features/discovery/screens/HomeScreen';
import { OnboardingIntroScreen } from '@/features/onboarding/screens/OnboardingIntroScreen';
import { MeScreen } from '@/features/profile/screens/MeScreen';
import { AboutScreen } from '@/features/settings/screens/AboutScreen';

import type {
  AuthStackParamList,
  MainTabParamList,
  OnboardingStackParamList,
  RootStackParamList,
} from './types';

const Root = createNativeStackNavigator<RootStackParamList>();
const Auth = createNativeStackNavigator<AuthStackParamList>();
const Onboarding = createNativeStackNavigator<OnboardingStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Welcome" component={WelcomeScreen} />
      <Auth.Screen name="SignIn" component={SignInScreen} />
    </Auth.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Onboarding.Navigator screenOptions={{ headerShown: false }}>
      <Onboarding.Screen name="OnboardingIntro" component={OnboardingIntroScreen} />
    </Onboarding.Navigator>
  );
}

function MainTabs() {
  const t = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.brand.primary,
        tabBarInactiveTintColor: t.colors.text.muted,
        tabBarStyle: {
          backgroundColor: t.colors.surface.raised,
          borderTopColor: t.colors.border.subtle,
        },
        tabBarLabelStyle: { fontFamily: t.typeScale.caption.family, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="DiscoverTab"
        component={DiscoverScreen}
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ConnectionsTab"
        component={ConnectionsScreen}
        options={{
          title: 'Connections',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="MessagesTab"
        component={MessagesScreen}
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="MeTab"
        component={MeScreen}
        options={{
          title: 'Me',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

/** Renders exactly one tree per session status; a status change resets the stack. */
export function RootNavigator() {
  const status = useSessionStore(selectStatus);
  const t = useTheme();
  return (
    <Root.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: t.colors.surface.base },
      }}
    >
      {status === 'booting' ? (
        <Root.Screen name="Boot" component={BootScreen} />
      ) : status === 'signedOut' ? (
        <Root.Screen name="Auth" component={AuthStack} />
      ) : status === 'needsProfile' ? (
        <Root.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <Root.Group>
          <Root.Screen name="Main" component={MainTabs} />
          <Root.Screen
            name="About"
            component={AboutScreen}
            options={{
              headerShown: true,
              title: 'About Lagnaa',
              headerTintColor: t.colors.text.primary,
              headerStyle: { backgroundColor: t.colors.surface.raised },
            }}
          />
        </Root.Group>
      )}
    </Root.Navigator>
  );
}
