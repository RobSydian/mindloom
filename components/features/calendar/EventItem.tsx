import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { t } from '@/constants/i18n';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CalendarEvent } from '@/types';

interface EventItemProps {
  event: CalendarEvent;
  style?: ViewStyle;
}

function formatDate(dateStr: string): { day: string; month: string; weekday: string } {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day: d.getDate().toString(),
    month: d.toLocaleString(undefined, { month: 'short' }),
    weekday: d.toLocaleString(undefined, { weekday: 'short' }),
  };
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().split('T')[0];
}

export function EventItem({ event, style }: EventItemProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { day, month, weekday } = formatDate(event.date);
  const today = isToday(event.date);
  const past = isPast(event.date);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.surface,
          borderColor: today ? c.primary : c.border,
          borderLeftWidth: today ? 3 : 1,
          opacity: past ? 0.55 : 1,
        },
        style,
      ]}
    >
      <View style={[styles.dateBadge, { backgroundColor: today ? c.accent : c.muted }]}>
        <Text style={[styles.dateDay, { color: today ? c.primary : c.text }]}>{day}</Text>
        <Text style={[styles.dateMonth, { color: today ? c.primary : c.textSecondary }]}>
          {month}
        </Text>
        <Text style={[styles.dateWeekday, { color: c.textSecondary }]}>{weekday}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {event.title}
        </Text>
        {event.description ? (
          <Text style={[styles.description, { color: c.textSecondary }]} numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}
        <Text style={[styles.time, { color: c.textSecondary }]}>
          {event.time ?? t('common.allDay')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  dateBadge: {
    width: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: 1,
  },
  dateDay: {
    ...Typography.h3,
    lineHeight: 22,
  },
  dateMonth: {
    ...Typography.labelSm,
    textTransform: 'uppercase',
  },
  dateWeekday: {
    ...Typography.caption,
  },
  body: {
    flex: 1,
    gap: Spacing.xs / 2,
    paddingTop: Spacing.xs,
  },
  title: {
    ...Typography.bodyLg,
    fontWeight: '500',
  },
  description: {
    ...Typography.body,
  },
  time: {
    ...Typography.bodySm,
  },
});
