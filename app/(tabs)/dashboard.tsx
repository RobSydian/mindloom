import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { Screen } from '@/components/layout/Screen';
import { Section } from '@/components/layout/Section';
import { Avatar } from '@/components/ui/Avatar';
import { StatCard } from '@/components/features/dashboard/StatCard';
import { GoalSummaryRow } from '@/components/features/dashboard/GoalSummaryRow';
import { ImpressionCard } from '@/components/features/impressions/ImpressionCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuthContext } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDashboard } from '@/hooks/use-dashboard';
import type { GoalStatus } from '@/types';

const STATUS_ORDER: GoalStatus[] = ['pending', 'in_progress', 'finished', 'blocked', 'cancelled'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatAvgRating(avg: number): string {
  return avg.toFixed(1);
}

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { user } = useAuthContext();
  const { summary, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={c.primary} size="large" />
        </View>
      </Screen>
    );
  }

  if (isError || !summary) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: c.destructive }]}>
            Could not load dashboard.
          </Text>
        </View>
      </Screen>
    );
  }

  const chartData = STATUS_ORDER.map((status) => ({
    value: summary.goalsByStatus[status] ?? 0,
    label: status === 'in_progress' ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1, 4),
    frontColor: c.primary,
  })).filter((d) => d.value > 0);

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: c.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: Spacing.lg }]}>
          <View style={styles.greetingBlock}>
            <Text style={[styles.greeting, { color: c.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.name, { color: c.text }]}>
              {user?.displayName ?? 'there'} 👋
            </Text>
          </View>
          <Avatar name={user?.displayName} uri={user?.photoURL} size="md" />
        </View>

        {/* Stat Cards */}
        <Section title="Overview" style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statRow}
          >
            <StatCard
              label="Impressions"
              value={summary.totalImpressions}
              accent={c.primary}
              icon={<IconSymbol name="photo.stack.fill" size={18} color={c.primary} />}
            />
            <StatCard
              label="Avg Rating"
              value={`${formatAvgRating(summary.avgRating)} ★`}
              accent={c.starFilled}
              icon={<IconSymbol name="star.fill" size={18} color={c.starFilled} />}
            />
            <StatCard
              label="Upcoming"
              value={summary.upcomingEventsCount}
              accent={c.info}
              icon={<IconSymbol name="calendar" size={18} color={c.info} />}
            />
            <StatCard
              label="Goals"
              value={Object.values(summary.goalsByStatus).reduce((a, b) => a + b, 0)}
              accent={c.success}
              icon={<IconSymbol name="checkmark.circle.fill" size={18} color={c.success} />}
            />
          </ScrollView>
        </Section>

        {/* Goals chart */}
        {chartData.length > 0 && (
          <Section title="Goals by Status" style={styles.section}>
            <View style={[styles.chartCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <BarChart
                data={chartData}
                width={300}
                height={140}
                barWidth={32}
                spacing={18}
                roundedTop
                hideRules
                xAxisThickness={1}
                xAxisColor={c.border}
                yAxisTextStyle={{ color: c.textSecondary, fontSize: 11 }}
                xAxisLabelTextStyle={{ color: c.textSecondary, fontSize: 10 }}
                noOfSections={3}
                barBorderRadius={4}
                isAnimated
              />
            </View>
          </Section>
        )}

        {/* Goal status summary */}
        {Object.keys(summary.goalsByStatus).length > 0 && (
          <Section title="Goal Statuses" style={styles.section}>
            <GoalSummaryRow goalsByStatus={summary.goalsByStatus} />
          </Section>
        )}

        {/* Recent Impressions */}
        {summary.recentImpressions.length > 0 && (
          <Section title="Recent Impressions" style={styles.section}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.impressionsRow}
            >
              {summary.recentImpressions.map((imp) => (
                <ImpressionCard key={imp.id} impression={imp} compact />
              ))}
            </ScrollView>
          </Section>
        )}

        {/* Upcoming Events */}
        {summary.upcomingEvents.length > 0 && (
          <Section title="Coming Up" style={styles.section}>
            {summary.upcomingEvents.map((evt) => (
              <View
                key={evt.id}
                style={[styles.eventRow, { backgroundColor: c.surface, borderColor: c.border }]}
              >
                <View style={[styles.eventDateBadge, { backgroundColor: c.accent }]}>
                  <Text style={[styles.eventDateDay, { color: c.accentForeground }]}>
                    {new Date(evt.date + 'T00:00:00').getDate()}
                  </Text>
                  <Text style={[styles.eventDateMonth, { color: c.accentForeground }]}>
                    {new Date(evt.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.eventBody}>
                  <Text style={[styles.eventTitle, { color: c.text }]} numberOfLines={1}>
                    {evt.title}
                  </Text>
                  {evt.time ? (
                    <Text style={[styles.eventTime, { color: c.textSecondary }]}>
                      {evt.time}
                    </Text>
                  ) : (
                    <Text style={[styles.eventTime, { color: c.textSecondary }]}>All day</Text>
                  )}
                </View>
              </View>
            ))}
          </Section>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.body,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingBlock: {
    gap: 2,
  },
  greeting: {
    ...Typography.bodySm,
  },
  name: {
    ...Typography.h3,
  },
  section: {
    gap: Spacing.sm,
  },
  statRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chartCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  impressionsRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  eventRow: {
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  eventDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDateDay: {
    ...Typography.h4,
    lineHeight: 20,
  },
  eventDateMonth: {
    ...Typography.caption,
    textTransform: 'uppercase',
  },
  eventBody: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    ...Typography.body,
    fontWeight: '500',
  },
  eventTime: {
    ...Typography.bodySm,
  },
});
