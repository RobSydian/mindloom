import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GOAL_PERIOD_LABELS, type Goal } from '@/types';

interface GoalCardProps {
  goal: Goal;
  style?: ViewStyle;
}

export function GoalCard({ goal, style }: GoalCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <Card style={style}>
      <View style={styles.row}>
        <StatusBadge status={goal.status} />
        <Badge
          label={GOAL_PERIOD_LABELS[goal.period]}
          variant={goal.period === 'monthly' ? 'primary' : 'muted'}
        />
      </View>
      <Text style={[styles.title, { color: c.text }]}>{goal.title}</Text>
      {goal.description ? (
        <Text style={[styles.description, { color: c.textSecondary }]} numberOfLines={2}>
          {goal.description}
        </Text>
      ) : null}
      {goal.statusReason ? (
        <View style={[styles.reasonRow, { backgroundColor: c.muted }]}>
          <Text style={[styles.reasonLabel, { color: c.textSecondary }]}>Reason: </Text>
          <Text style={[styles.reasonText, { color: c.text }]} numberOfLines={2}>
            {goal.statusReason}
          </Text>
        </View>
      ) : null}
      <Text style={[styles.period, { color: c.textSecondary }]}>{goal.periodLabel}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  title: {
    ...Typography.h4,
  },
  description: {
    ...Typography.body,
  },
  reasonRow: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: Spacing.sm,
  },
  reasonLabel: {
    ...Typography.bodySm,
    fontWeight: '500',
  },
  reasonText: {
    ...Typography.bodySm,
    flex: 1,
  },
  period: {
    ...Typography.caption,
  },
});
