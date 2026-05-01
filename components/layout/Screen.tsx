import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Edges to apply safe-area insets to. Defaults to top + bottom. */
  edges?: React.ComponentProps<typeof SafeAreaView>['edges'];
}

export function Screen({ children, style, edges = ['top', 'bottom'] }: ScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const bg = Colors[scheme].background;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={edges}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
});
