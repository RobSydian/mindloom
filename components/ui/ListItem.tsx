import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

import { Colors, ComponentTokens, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ListItemProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function ListItem({ title, subtitle, left, right, style, ...rest }: ListItemProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const Container = rest.onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        { minHeight: ComponentTokens.listItem.minHeight, backgroundColor: c.surface },
        style,
      ]}
      activeOpacity={0.7}
      {...(rest as any)}
    >
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.content}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ComponentTokens.listItem.paddingH,
    paddingVertical: ComponentTokens.listItem.paddingV,
    gap: Spacing.md,
  },
  left: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.body,
    fontWeight: '500',
  },
  subtitle: {
    ...Typography.bodySm,
  },
});
