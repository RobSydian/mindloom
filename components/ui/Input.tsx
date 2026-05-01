import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { Colors, ComponentTokens, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, ...props }: InputProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: focused ? c.surface : c.muted,
            borderColor: error ? c.destructive : focused ? c.primary : c.border,
            color: c.text,
          },
        ]}
        placeholderTextColor={c.textDisabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error ? <Text style={[styles.error, { color: c.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.label,
  },
  input: {
    height: ComponentTokens.input.height,
    borderRadius: ComponentTokens.input.borderRadius,
    borderWidth: ComponentTokens.input.borderWidth,
    paddingHorizontal: ComponentTokens.input.paddingH,
    fontSize: ComponentTokens.input.fontSize,
  },
  error: {
    ...Typography.bodySm,
  },
});
