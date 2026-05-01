import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/constants/i18n';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthContext } from '@/context/AuthContext';
import { acceptGroupInvite } from '@/lib/invites/invite-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function InviteAcceptScreen() {
  const { user } = useAuthContext();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);

  const { inviteId, token, email } = useLocalSearchParams<{
    inviteId?: string;
    token?: string;
    email?: string;
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleAccept() {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!inviteId || !token || !email) {
      setError(t('invite.error.incomplete'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await acceptGroupInvite({
        inviteId,
        rawToken: token,
        userUid: user.uid,
        userEmail: user.email,
      });
      setDone(true);
      router.replace('/(tabs)/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('invite.error.acceptFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('invite.title')}</Text>
        <Text style={styles.subtitle}>
          {done
            ? t('invite.status.accepted')
            : t('invite.status.invitedAs', {
                email: email ?? t('invite.status.invitedAsFallback'),
              })}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
          onPress={handleAccept}
        >
          {isLoading ? (
            <ActivityIndicator color={c.primaryForeground} />
          ) : (
            <Text style={styles.buttonText}>{t('invite.accept')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      padding: Spacing.xl,
      gap: Spacing.md,
    },
    title: { ...Typography.h3, color: c.text },
    subtitle: { ...Typography.body, color: c.textSecondary },
    errorText: { ...Typography.bodySm, color: c.destructive },
    button: {
      height: 48,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { ...Typography.body, color: c.primaryForeground, fontWeight: '600' },
  });
}
