import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

import { Colors, ComponentTokens } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  style,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const tokens = ComponentTokens.button[size];

  const variantStyles: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.primary, fg: c.primaryForeground },
    secondary: { bg: c.secondary, fg: c.secondaryForeground },
    ghost: { bg: 'transparent', fg: c.primary },
    destructive: { bg: c.destructiveSubtle, fg: c.destructiveForeground },
  };

  const { bg, fg, border } = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          height: tokens.height,
          paddingHorizontal: tokens.paddingH,
          borderRadius: tokens.borderRadius,
          backgroundColor: bg,
          borderWidth: border || variant === 'ghost' ? 1 : 0,
          borderColor: border ?? (variant === 'ghost' ? c.border : undefined),
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled || isLoading ? 0.55 : 1,
        },
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <Text style={[styles.label, { color: fg, fontSize: tokens.fontSize }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
