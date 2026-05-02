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
import { ImpressionCard } from '@/components/features/impressions/ImpressionCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { t } from '@/constants/i18n';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImpressions } from '@/hooks/use-impressions';
import type { Impression } from '@/types';

export default function ImpressionsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { data, isLoading, isError, refetch } = useImpressions();

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
            {t('impressions.error.load')}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={[styles.retryText, { color: c.primary }]}>{t('common.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={[styles.pageHeader, { backgroundColor: c.background }]}>
        <Text style={[styles.pageTitle, { color: c.text }]}>{t('impressions.title')}</Text>
        <Text style={[styles.pageSubtitle, { color: c.textSecondary }]}>
          {t('impressions.subtitle.count', { count: data?.length ?? 0 })}
        </Text>
      </View>

      <FlatList<Impression>
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { backgroundColor: c.background },
          (data?.length ?? 0) === 0 && styles.listEmpty,
        ]}
        renderItem={({ item }) => (
          <ImpressionCard impression={item} style={styles.card} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="photo.stack.fill" size={48} color={c.muted} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>{t('impressions.empty.title')}</Text>
            <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
              {t('impressions.empty.subtitle')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating add button */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: c.primary },
          Shadow.lg,
        ]}
        activeOpacity={0.85}
        onPress={() => {
          // TODO: open impression form modal
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
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.body,
  },
  retryBtn: {
    padding: Spacing.sm,
  },
  retryText: {
    ...Typography.body,
    fontWeight: '500',
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
  card: {
    // width is constrained by the list's horizontal padding
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
