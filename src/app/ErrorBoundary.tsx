import React, { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Monitoring } from '@/core/monitoring';

interface State {
  error: Error | null;
}

/** Last line of defence; styled without the theme because the theme itself may have failed. */
export class ErrorBoundary extends Component<PropsWithChildren<{ monitoring: Monitoring }>, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.monitoring.captureError(error, {
      componentStack: info.componentStack?.slice(0, 500),
    });
  }

  override render() {
    if (this.state.error) {
      return (
        <View style={styles.wrap} testID="fatal-error">
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            Please close and reopen Lagnaa. If this keeps happening, contact support.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FAF7F4',
  },
  title: { fontSize: 20, fontWeight: '600', color: '#1F1416', marginBottom: 8 },
  body: { fontSize: 16, color: '#5C4A4E', textAlign: 'center' },
});
