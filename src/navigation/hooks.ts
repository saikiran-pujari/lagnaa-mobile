import {
  type NavigationProp,
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type { RootStackParamList } from './types';

/** Typed navigation; screens never import React Navigation directly. */
export function useAppNavigation() {
  return useNavigation<NavigationProp<RootStackParamList>>();
}

export function useAppRoute<T extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, T>>();
}
