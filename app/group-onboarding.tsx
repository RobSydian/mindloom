import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/constants/i18n';
import { Colors, ComponentTokens, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthContext } from '@/context/AuthContext';
import { createGroup } from '@/lib/groups/group-service';
import { createGroupInvite } from '@/lib/invites/invite-service';
import { setActiveGroupId } from '@/lib/users/user-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function GroupOnboardingScreen() {
  const { user } = useAuthContext();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);

  const [groupName, setGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateGroup() {
    if (!user) return;
    if (!groupName.trim()) {
      setError(t('onboarding.error.groupNameRequired'));
      return;
    }

    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const group = await createGroup(user.uid, groupName.trim());
      if (inviteEmail.trim()) {
        const invite = await createGroupInvite({
          groupId: group.id,
          inviteeEmail: inviteEmail.trim(),
          createdBy: user.uid,
        });
        setMessage(
          t('onboarding.success.createdInvite', { email: invite.invite.emailLower })
        );
        await Linking.openURL(invite.mailtoLink);
      } else {
        setMessage(t('onboarding.success.createdWithId', { groupId: group.id }));
      }
      router.replace('/(tabs)/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('onboarding.error.createFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinByGroupId() {
    if (!user) return;
    if (!joinGroupId.trim()) {
      setError(t('onboarding.error.groupIdRequired'));
      return;
    }
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await setActiveGroupId(user.uid, joinGroupId.trim());
      setMessage(t('onboarding.success.joined'));
      router.replace('/(tabs)/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('onboarding.error.joinFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>{t('onboarding.title')}</Text>
            <Text style={styles.subtitle}>
              {t('onboarding.subtitle')}
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('onboarding.groupName')}</Text>
              <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder={t('onboarding.groupNamePlaceholder')}
                placeholderTextColor={c.textDisabled}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('onboarding.inviteEmail')}</Text>
              <TextInput
                style={styles.input}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder={t('onboarding.inviteEmailPlaceholder')}
                placeholderTextColor={c.textDisabled}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
              onPress={handleCreateGroup}
            >
              {isLoading ? (
                <ActivityIndicator color={c.primaryForeground} />
              ) : (
                <Text style={styles.buttonText}>{t('onboarding.createGroup')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.separatorWrap}>
              <Text style={styles.separatorText}>{t('onboarding.or')}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('onboarding.joinByGroupId')}</Text>
              <TextInput
                style={styles.input}
                value={joinGroupId}
                onChangeText={setJoinGroupId}
                placeholder={t('onboarding.joinByGroupIdPlaceholder')}
                placeholderTextColor={c.textDisabled}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
              onPress={handleJoinByGroupId}
            >
              <Text style={styles.secondaryButtonText}>{t('onboarding.joinGroup')}</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {message ? <Text style={styles.messageText}>{message}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    kav: { flex: 1 },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xxxl,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: c.border,
      gap: Spacing.md,
    },
    title: { ...Typography.h3, color: c.text },
    subtitle: { ...Typography.bodySm, color: c.textSecondary },
    fieldGroup: { gap: Spacing.xs },
    label: { ...Typography.label, color: c.textSecondary },
    input: {
      height: ComponentTokens.input.height,
      borderRadius: ComponentTokens.input.borderRadius,
      borderWidth: ComponentTokens.input.borderWidth,
      borderColor: c.border,
      backgroundColor: c.muted,
      color: c.text,
      paddingHorizontal: ComponentTokens.input.paddingH,
      fontSize: ComponentTokens.input.fontSize,
    },
    button: {
      height: ComponentTokens.button.lg.height,
      borderRadius: ComponentTokens.button.lg.borderRadius,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButton: {
      height: ComponentTokens.button.lg.height,
      borderRadius: ComponentTokens.button.lg.borderRadius,
      backgroundColor: c.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      color: c.primaryForeground,
      fontWeight: '600',
      fontSize: ComponentTokens.button.md.fontSize,
    },
    secondaryButtonText: {
      color: c.secondaryForeground,
      fontWeight: '600',
      fontSize: ComponentTokens.button.md.fontSize,
    },
    separatorWrap: {
      alignItems: 'center',
      paddingVertical: Spacing.xs,
    },
    separatorText: {
      ...Typography.caption,
      color: c.textSecondary,
      textTransform: 'uppercase',
    },
    errorText: { ...Typography.bodySm, color: c.destructive },
    messageText: { ...Typography.bodySm, color: c.success },
  });
}
