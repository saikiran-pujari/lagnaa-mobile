import React, { useState } from 'react';
import { Image, type ImageStyle, type StyleProp, StyleSheet, View } from 'react-native';
import { Lock } from 'lucide-react-native';

import type { PhotoRef } from '@/api/types';

import { useTheme } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export interface RemotePhotoProps {
  photo: PhotoRef | null;
  /** Shown when the server did not authorise a URL for this viewer. */
  lockedReason?: string;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel: string;
  resizeMode?: 'cover' | 'contain';
}

/**
 * The only way remote photos are rendered. A photo without an authorised URL renders the
 * gated placeholder (never a blurred real image). See ADR 0009 for caching rules.
 */
export function RemotePhoto({
  photo,
  lockedReason,
  style,
  accessibilityLabel,
  resizeMode = 'cover',
}: RemotePhotoProps) {
  const t = useTheme();
  const [failed, setFailed] = useState(false);
  const url = photo?.url;
  if (!url || failed) {
    return (
      <View
        accessibilityLabel={lockedReason ?? 'Photo unavailable'}
        style={[styles.base, { backgroundColor: t.colors.privacy.lockedBg }, style]}
      >
        <Icon
          icon={Lock}
          tone="muted"
          decorative={false}
          accessibilityLabel={lockedReason ?? 'Photo unavailable'}
        />
        {lockedReason ? (
          <Text variant="caption" tone="muted" align="center" style={styles.reason}>
            {lockedReason}
          </Text>
        ) : null}
      </View>
    );
  }
  return (
    <Image
      source={{ uri: url }}
      accessibilityLabel={accessibilityLabel}
      accessible
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
      style={[styles.base, { backgroundColor: t.colors.skeleton }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reason: { marginTop: 8, paddingHorizontal: 16 },
});
