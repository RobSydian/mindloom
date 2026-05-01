import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProgressBarProps {
  /** 0 to 1 */
  progress: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export function ProgressBar({ progress, height = 6, color, style }: ProgressBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: c.muted, borderRadius: Radius.full },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            height,
            backgroundColor: color ?? c.primary,
            borderRadius: Radius.full,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {},
});
