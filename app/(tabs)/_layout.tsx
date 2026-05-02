import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { t } from '@/constants/i18n';
import { useAuthContext } from '@/context/AuthContext';
import { Colors, ComponentTokens, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!user.activeGroupId) {
    return <Redirect href="/group-onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.tabActive,
        tabBarInactiveTintColor: c.tabInactive,
        tabBarStyle: {
          backgroundColor: c.tabBackground,
          borderTopColor: c.border,
          borderTopWidth: 1,
          height: ComponentTokens.tab.height + (Platform.OS === 'ios' ? 20 : 0),
          paddingBottom: Platform.OS === 'ios' ? 20 : ComponentTokens.tab.paddingBottom,
        },
        tabBarLabelStyle: {
          ...Typography.tabLabel,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={ComponentTokens.tab.iconSize} name="square.grid.2x2.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="impressions"
        options={{
          title: t('tabs.impressions'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={ComponentTokens.tab.iconSize} name="photo.stack.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.calendar'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={ComponentTokens.tab.iconSize} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: t('tabs.goals'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={ComponentTokens.tab.iconSize} name="checkmark.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={ComponentTokens.tab.iconSize} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
