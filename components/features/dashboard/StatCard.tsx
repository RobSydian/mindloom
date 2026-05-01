import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Colors, ComponentTokens, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ label, value, icon, accent, style }: StatCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.row}>
        {icon ? (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: accent ? `${accent}18` : c.accent },
            ]}
          >
            {icon}
          </View>
        ) : null}
        <Text style={[styles.value, { color: accent ?? c.text }]}>{value}</Text>
      </View>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: ComponentTokens.statCard.minWidth,
    padding: ComponentTokens.statCard.padding,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...Typography.h2,
  },
  label: {
    ...Typography.bodySm,
  },
});
