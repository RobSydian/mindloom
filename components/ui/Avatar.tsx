import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { Colors, ComponentTokens } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  uri?: string | null;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function Avatar({ name, uri, size = 'md', style }: AvatarProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const tokens = ComponentTokens.avatar[size];

  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <View
      style={[
        styles.container,
        {
          width: tokens.size,
          height: tokens.size,
          borderRadius: tokens.borderRadius,
          backgroundColor: c.accent,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: tokens.size, height: tokens.size, borderRadius: tokens.borderRadius },
          ]}
          contentFit="cover"
        />
      ) : (
        <Text style={[styles.initials, { color: c.accentForeground, fontSize: tokens.fontSize }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  initials: {
    fontWeight: '600',
  },
});
