import React from 'react';
import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from './icon-symbol';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
  style?: ViewStyle;
}

export function StarRating({
  value,
  max = 5,
  size = 20,
  readonly = false,
  onChange,
  style,
}: StarRatingProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        const iconName = filled ? 'star.fill' : 'star';

        if (readonly) {
          return (
            <IconSymbol
              key={i}
              name={iconName}
              size={size}
              color={filled ? c.starFilled : c.starEmpty}
            />
          );
        }

        return (
          <TouchableOpacity
            key={i}
            onPress={() => onChange?.(i + 1)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={iconName}
              size={size}
              color={filled ? c.starFilled : c.starEmpty}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
});
