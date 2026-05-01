import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors, ComponentTokens, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const variantStyles: Record<BadgeVariant, { bg: string; fg: string }> = {
    default: { bg: c.muted, fg: c.mutedForeground },
    primary: { bg: c.accent, fg: c.accentForeground },
    success: { bg: c.successSubtle, fg: c.successForeground },
    warning: { bg: c.warningSubtle, fg: c.warningForeground },
    destructive: { bg: c.destructiveSubtle, fg: c.destructiveForeground },
    info: { bg: c.infoSubtle, fg: c.infoForeground },
    muted: { bg: c.separator, fg: c.textSecondary },
  };

  const { bg, fg } = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: ComponentTokens.badge.height,
    borderRadius: ComponentTokens.badge.borderRadius,
    paddingHorizontal: ComponentTokens.badge.paddingH,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.labelSm,
  },
});
