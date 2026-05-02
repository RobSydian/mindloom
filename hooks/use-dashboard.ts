import { useMemo } from 'react';
import { useImpressions } from './use-impressions';
import { useCalendarEvents } from './use-calendar';
import { useGoals } from './use-goals';
import type { DashboardSummary, GoalStatus } from '@/types';

const TODAY = new Date().toISOString().split('T')[0];

export function useDashboard(): {
  summary: DashboardSummary | null;
  isLoading: boolean;
  isError: boolean;
} {
  const impressions = useImpressions();
  const events = useCalendarEvents();
  const goals = useGoals();

  const isLoading = impressions.isLoading || events.isLoading || goals.isLoading;
  const isError = impressions.isError && events.isError && goals.isError;

  const summary = useMemo<DashboardSummary | null>(() => {
    if (isLoading) return null;

    const impressionItems = impressions.data ?? [];
    const eventItems = events.data ?? [];
    const goalItems = goals.data ?? [];

    const totalImpressions = impressionItems.length;
    const avgRating =
      totalImpressions > 0
        ? impressionItems.reduce((sum, i) => sum + i.rating, 0) / totalImpressions
        : 0;

    const upcomingEvents = eventItems.filter((e) => e.date >= TODAY).slice(0, 5);

    const goalsByStatus = goalItems.reduce(
      (acc, g) => {
        acc[g.status] = (acc[g.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<GoalStatus, number>
    );

    const recentImpressions = impressionItems.slice(0, 5);

    return {
      totalImpressions,
      avgRating: Math.round(avgRating * 10) / 10,
      upcomingEventsCount: upcomingEvents.length,
      goalsByStatus,
      recentImpressions,
      upcomingEvents,
    };
  }, [isLoading, impressions.data, events.data, goals.data]);

  return { summary, isLoading, isError };
}
