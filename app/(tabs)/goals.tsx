import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { GoalCard } from '@/components/features/goals/GoalCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGoals } from '@/hooks/use-goals';
import type { Goal, GoalPeriod } from '@/types';

const FILTER_OPTIONS: { label: string; value: GoalPeriod | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export default function GoalsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [filter, setFilter] = useState<GoalPeriod | 'all'>('all');
  const { data, isLoading, isError } = useGoals(filter === 'all' ? undefined : filter);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={c.primary} size="large" />
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: c.destructive }]}>
            Could not load goals.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={[styles.pageHeader, { backgroundColor: c.background }]}>
        <Text style={[styles.pageTitle, { color: c.text }]}>Goals</Text>
        <Text style={[styles.pageSubtitle, { color: c.textSecondary }]}>
          {data?.length ?? 0} goals
        </Text>
      </View>

      {/* Period filter pills */}
      <View style={[styles.filterRow, { backgroundColor: c.background }]}>
        {FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.filterPill,
                {
                  backgroundColor: active ? c.primary : c.muted,
                  borderColor: active ? c.primary : c.border,
                },
              ]}
              onPress={() => setFilter(opt.value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: active ? c.primaryForeground : c.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList<Goal>
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { backgroundColor: c.background },
          (data?.length ?? 0) === 0 && styles.listEmpty,
        ]}
        renderItem={({ item }) => <GoalCard goal={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="checkmark.circle.fill" size={48} color={c.muted} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No goals yet</Text>
            <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
              Tap + to set your first goal.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }, Shadow.lg]}
        activeOpacity={0.85}
        onPress={() => {
          // TODO: open goal form modal
        }}
      >
        <IconSymbol name="plus" size={28} color={c.primaryForeground} />
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.body,
  },
  pageHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: 2,
  },
  pageTitle: {
    ...Typography.h2,
  },
  pageSubtitle: {
    ...Typography.bodySm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterLabel: {
    ...Typography.label,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xxxl,
  },
  emptyTitle: {
    ...Typography.h4,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
