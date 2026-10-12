import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AlertCircle, Inbox } from 'lucide-react-native';

import { Button } from '../components';
import { Icon, Text } from '../primitives';
import { useTheme } from '../theme';

interface StateProps {
  title: string;
  body?: string;
  icon?: LucideIcon;
  action?: { label: string; onPress: () => void };
  testID?: string;
}

function StateView({
  title,
  body,
  icon,
  action,
  testID,
  tone,
}: StateProps & { tone: 'muted' | 'danger' }) {
  const t = useTheme();
  return (
    <View testID={testID} style={[styles.wrap, { gap: t.spacing[3] }]} accessibilityRole="summary">
      {icon ? <Icon icon={icon} size="xl" tone={tone} /> : null}
      <Text variant="heading" align="center">
        {title}
      </Text>
      {body ? (
        <Text variant="body" tone="secondary" align="center">
          {body}
        </Text>
      ) : null}
      {action ? (
        <View style={styles.action}>
          <Button
            label={action.label}
            onPress={action.onPress}
            variant="secondary"
            fullWidth={false}
          />
        </View>
      ) : null}
    </View>
  );
}

/** Nothing here yet, and what to do next. */
export function EmptyState(props: StateProps) {
  return <StateView icon={Inbox} {...props} tone="muted" />;
}

/** Something failed; always offers a retry. */
export function ErrorState({
  onRetry,
  ...props
}: Omit<StateProps, 'action'> & { onRetry?: () => void }) {
  return (
    <StateView
      icon={AlertCircle}
      {...props}
      action={onRetry ? { label: 'Try again', onPress: onRetry } : undefined}
      tone="danger"
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  action: { marginTop: 8 },
});
