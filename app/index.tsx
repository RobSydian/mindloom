import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuthContext } from '@/context/AuthContext';

export default function IndexRoute() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <View />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!user.activeGroupId) {
    return <Redirect href="/group-onboarding" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
