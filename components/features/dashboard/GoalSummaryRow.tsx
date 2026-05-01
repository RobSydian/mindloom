import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { GoalStatus } from '@/types';

const STATUSES: GoalStatus[] = ['pending', 'in_progress', 'finished', 'blocked', 'cancelled'];

interface GoalSummaryRowProps {
  goalsByStatus: Partial<Record<GoalStatus, number>>;
}

export function GoalSummaryRow({ goalsByStatus }: GoalSummaryRowProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={styles.container}>
      {STATUSES.map((status) => {
        const count = goalsByStatus[status] ?? 0;
        if (count === 0) return null;
        return (
          <View key={status} style={styles.item}>
            <Text style={[styles.count, { color: c.text }]}>{count}</Text>
            <StatusBadge status={status} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  count: {
    ...Typography.h4,
  },
});
