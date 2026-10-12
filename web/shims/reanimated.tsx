import { Image, ScrollView, Text, View } from 'react-native';

/** Browser stand-in. Gesture Handler only needs createAnimatedComponent at startup. */
export function createAnimatedComponent<T>(Component: T): T {
  return Component;
}

export function useSharedValue<T>(value: T) {
  return { value };
}

export function useAnimatedStyle(updater: () => object) {
  return updater();
}

export function useAnimatedProps(updater: () => object) {
  return updater();
}

export function useDerivedValue<T>(updater: () => T) {
  return { value: updater() };
}

export function useAnimatedRef() {
  return { current: null };
}

export function useReducedMotion() {
  return true;
}

export function withTiming<T>(value: T) {
  return value;
}

export function withRepeat<T>(value: T) {
  return value;
}

export function withSpring<T>(value: T) {
  return value;
}

export function interpolate(value: number) {
  return value;
}

export function measure() {
  return null;
}

export function isSharedValue() {
  return false;
}

export function setGestureState() {}

export const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

export const ReduceMotion = {
  System: 'system',
  Always: 'always',
  Never: 'never',
};

const Animated = {
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent,
};

export { Animated };
export default Animated;
