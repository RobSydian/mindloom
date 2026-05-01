import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { ComponentTokens, GoalStatusColors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GOAL_STATUS_LABELS, type GoalStatus } from '@/types';

interface StatusBadgeProps {
  status: GoalStatus;
  style?: ViewStyle;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const scheme = useColorScheme() ?? 'light';
  const { bg, fg } = GoalStatusColors[scheme][status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: fg }]}>{GOAL_STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: ComponentTokens.badge.height,
    borderRadius: ComponentTokens.badge.borderRadius,
    paddingHorizontal: ComponentTokens.badge.paddingH,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.labelSm,
    fontSize: ComponentTokens.badge.fontSize,
  },
});
