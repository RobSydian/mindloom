import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  action?: React.ReactNode;
}

export function Section({ title, children, style, action }: SectionProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={[styles.container, style]}>
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.textSecondary }]}>{title}</Text>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.labelSm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
