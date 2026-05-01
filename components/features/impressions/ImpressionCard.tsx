import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Impression } from '@/types';

interface ImpressionCardProps {
  impression: Impression;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ImpressionCard({ impression, compact = false, style }: ImpressionCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const hasImage = impression.images.length > 0;

  if (compact) {
    return (
      <Card style={[styles.compact, style]}>
        {hasImage ? (
          <Image
            source={{ uri: impression.images[0] }}
            style={styles.compactImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.compactImagePlaceholder, { backgroundColor: c.muted }]} />
        )}
        <View style={styles.compactBody}>
          <Text style={[styles.placeName, { color: c.text }]} numberOfLines={1}>
            {impression.placeName}
          </Text>
          <StarRating value={impression.rating} size={14} readonly />
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, style]}>
      {hasImage ? (
        <Image
          source={{ uri: impression.images[0] }}
          style={styles.image}
          contentFit="cover"
        />
      ) : null}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.placeName, { color: c.text }]} numberOfLines={1}>
            {impression.placeName}
          </Text>
          {impression.location?.address ? (
            <View style={styles.locationRow}>
              <IconSymbol name="mappin.and.ellipse" size={12} color={c.textSecondary} />
              <Text style={[styles.address, { color: c.textSecondary }]} numberOfLines={1}>
                {impression.location.address}
              </Text>
            </View>
          ) : null}
        </View>
        <StarRating value={impression.rating} size={16} readonly />
      </View>
      {impression.description ? (
        <Text style={[styles.description, { color: c.textSecondary }]} numberOfLines={3}>
          {impression.description}
        </Text>
      ) : null}
      <Text style={[styles.date, { color: c.textSecondary }]}>
        {formatDate(impression.createdAt)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  placeName: {
    ...Typography.h4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  address: {
    ...Typography.caption,
    flex: 1,
  },
  description: {
    ...Typography.body,
    paddingHorizontal: Spacing.lg,
  },
  date: {
    ...Typography.caption,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  // Compact
  compact: {
    width: 160,
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  compactImage: {
    width: 160,
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  compactImagePlaceholder: {
    width: 160,
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  compactBody: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
});
