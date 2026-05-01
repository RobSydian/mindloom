import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { EventItem } from '@/components/features/calendar/EventItem';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCalendarEvents } from '@/hooks/use-calendar';
import type { CalendarEvent } from '@/types';

export default function CalendarScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { data, isLoading, isError } = useCalendarEvents();

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
            Could not load events.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={[styles.pageHeader, { backgroundColor: c.background }]}>
        <Text style={[styles.pageTitle, { color: c.text }]}>Calendar</Text>
        <Text style={[styles.pageSubtitle, { color: c.textSecondary }]}>
          {data?.length ?? 0} events
        </Text>
      </View>

      <FlatList<CalendarEvent>
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { backgroundColor: c.background },
          (data?.length ?? 0) === 0 && styles.listEmpty,
        ]}
        renderItem={({ item }) => (
          <EventItem event={item} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="calendar" size={48} color={c.muted} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No events yet</Text>
            <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
              Tap + to add your first event.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }, Shadow.lg]}
        activeOpacity={0.85}
        onPress={() => {
          // TODO: open event form modal
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
    paddingBottom: Spacing.md,
    gap: 2,
  },
  pageTitle: {
    ...Typography.h2,
  },
  pageSubtitle: {
    ...Typography.bodySm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
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
