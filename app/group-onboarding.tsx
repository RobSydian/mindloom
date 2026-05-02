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
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/constants/i18n';
import { Colors, ComponentTokens, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthContext } from '@/context/AuthContext';
import {
  approveJoinRequest,
  createGroup,
  MAX_LOOMS_PER_USER,
  rejectJoinRequest,
  requestJoinLoom,
} from '@/lib/groups/group-service';
import { createGroupInvite } from '@/lib/invites/invite-service';
import { setActiveGroupId } from '@/lib/users/user-service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GROUPS_KEY, useGroups } from '@/hooks/use-groups';
import {
  PENDING_JOIN_REQUESTS_KEY,
  usePendingJoinRequestsForCreator,
} from '@/hooks/use-pending-join-requests';

function mapJoinError(e: unknown): string {
  if (e instanceof Error) {
    switch (e.message) {
      case 'LOOM_NOT_FOUND':
        return t('onboarding.error.loomNotFound');
      case 'ALREADY_MEMBER':
        return t('onboarding.error.alreadyMember');
      case 'JOIN_REQUEST_PENDING':
        return t('onboarding.error.joinRequestPending');
      default:
        return e.message;
    }
  }
  return t('onboarding.error.joinFailed');
}

function mapCreateError(e: unknown): string {
  if (e instanceof Error && e.message === 'LOOM_LIMIT_REACHED') {
    return t('onboarding.error.loomLimit', { max: MAX_LOOMS_PER_USER });
  }
  return e instanceof Error ? e.message : t('onboarding.error.createFailed');
}

export default function GroupOnboardingScreen() {
  const { user, refreshUser } = useAuthContext();
  const queryClient = useQueryClient();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);

  const { data: groups = [], refetch: refetchGroups } = useGroups();
  const { data: pendingJoin = [], refetch: refetchPending } = usePendingJoinRequestsForCreator();

  const [loomName, setLoomName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinLoomId, setJoinLoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function invalidateLoomData() {
    await queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
    await queryClient.invalidateQueries({ queryKey: PENDING_JOIN_REQUESTS_KEY });
    await refetchGroups();
    await refetchPending();
  }

  async function handleCreateLoom() {
    if (!user) return;
    if (!loomName.trim()) {
      setError(t('onboarding.error.loomNameRequired'));
      return;
    }

    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const group = await createGroup(user.uid, loomName.trim());
      setMessage(t('onboarding.success.createdWithId', { groupId: group.id }));
      setLoomName('');
      await refreshUser();
      await invalidateLoomData();
    } catch (e: unknown) {
      setError(mapCreateError(e));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRequestJoin() {
    if (!user) return;
    if (!joinLoomId.trim()) {
      setError(t('onboarding.error.loomIdRequired'));
      return;
    }
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await requestJoinLoom(user.uid, joinLoomId.trim());
      setMessage(t('onboarding.success.joinRequestSent'));
      setJoinLoomId('');
      await invalidateLoomData();
    } catch (e: unknown) {
      setError(mapJoinError(e));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInviteEmail() {
    if (!user?.activeGroupId) {
      setError(t('onboarding.error.noActiveLoom'));
      return;
    }
    if (!inviteEmail.trim()) {
      setError(t('onboarding.error.inviteEmailRequired'));
      return;
    }
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const invite = await createGroupInvite({
        groupId: user.activeGroupId,
        inviteeEmail: inviteEmail.trim(),
        createdBy: user.uid,
      });
      setMessage(t('onboarding.success.inviteReady', { email: invite.invite.emailLower }));
      setInviteEmail('');
      await Linking.openURL(invite.mailtoLink);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('onboarding.error.inviteFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEnter(groupId: string) {
    if (!user) return;
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await setActiveGroupId(user.uid, groupId);
      await refreshUser();
      router.replace('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('onboarding.error.enterFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(groupId: string, requesterUid: string) {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await approveJoinRequest(groupId, requesterUid);
      setMessage(t('onboarding.success.requestApproved'));
      await invalidateLoomData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('onboarding.error.approveFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReject(groupId: string, requesterUid: string) {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await rejectJoinRequest(groupId, requesterUid);
      setMessage(t('onboarding.success.requestRejected'));
      await invalidateLoomData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('onboarding.error.rejectFailed'));
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
          <Text style={styles.pageTitle}>{t('onboarding.title')}</Text>
          <Text style={styles.intro}>{t('onboarding.intro')}</Text>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('onboarding.loomName')}</Text>
              <TextInput
                style={styles.input}
                value={loomName}
                onChangeText={setLoomName}
                placeholder={t('onboarding.loomNamePlaceholder')}
                placeholderTextColor={c.textDisabled}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
              onPress={handleCreateLoom}
            >
              {isLoading ? (
                <ActivityIndicator color={c.primaryForeground} />
              ) : (
                <Text style={styles.buttonText}>{t('onboarding.createLoom')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.separatorWrap}>
              <Text style={styles.separatorText}>{t('onboarding.or')}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('onboarding.joinByLoomId')}</Text>
              <TextInput
                style={styles.input}
                value={joinLoomId}
                onChangeText={setJoinLoomId}
                placeholder={t('onboarding.joinByLoomIdPlaceholder')}
                placeholderTextColor={c.textDisabled}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
              onPress={handleRequestJoin}
            >
              <Text style={styles.secondaryButtonText}>{t('onboarding.requestJoin')}</Text>
            </TouchableOpacity>

            {groups.length > 0 ? (
              <>
                <View style={styles.separatorWrap}>
                  <Text style={styles.separatorText}>{t('onboarding.or')}</Text>
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
                  style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
                  disabled={isLoading}
                  onPress={handleInviteEmail}
                >
                  <Text style={styles.secondaryButtonText}>{t('onboarding.sendInvite')}</Text>
                </TouchableOpacity>
                <Text style={styles.hint}>{t('onboarding.inviteUsesActiveLoom')}</Text>
              </>
            ) : null}
          </View>

          {pendingJoin.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('onboarding.pendingRequests')}</Text>
              {pendingJoin.map(({ group, requesterUid }) => (
                <View key={`${group.id}-${requesterUid}`} style={styles.requestRow}>
                  <View style={styles.requestTextWrap}>
                    <Text style={styles.requestTitle}>{group.name}</Text>
                    <Text style={styles.requestSub}>{requesterUid}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: c.primary }]}
                      onPress={() => handleApprove(group.id, requesterUid)}
                      disabled={isLoading}
                    >
                      <Text style={[styles.smallBtnText, { color: c.primaryForeground }]}>
                        {t('onboarding.approve')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: c.secondary }]}
                      onPress={() => handleReject(group.id, requesterUid)}
                      disabled={isLoading}
                    >
                      <Text style={[styles.smallBtnText, { color: c.secondaryForeground }]}>
                        {t('onboarding.reject')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.myLoomsTitle}>{t('onboarding.myLooms')}</Text>

          <View style={styles.card}>
            {groups.length === 0 ? (
              <Text style={styles.emptyMyLooms}>{t('onboarding.myLoomsEmpty')}</Text>
            ) : (
              groups.map((g) => {
                const isOwner = g.createdBy === user?.uid;
                return (
                  <View key={g.id} style={styles.loomRow}>
                    <View style={styles.loomTextWrap}>
                      <Text style={styles.loomName}>{g.name}</Text>
                      <Text style={styles.loomId}>{g.id}</Text>
                      <Text style={styles.loomRole}>
                        {isOwner ? t('onboarding.roleOwner') : t('onboarding.roleMember')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.enterBtn, isLoading && styles.buttonDisabled]}
                      onPress={() => handleEnter(g.id)}
                      disabled={isLoading}
                    >
                      <Text style={styles.enterBtnText}>{t('onboarding.enter')}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.messageText}>{message}</Text> : null}
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
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xl,
      gap: Spacing.lg,
    },
    pageTitle: {
      ...Typography.h3,
      color: c.text,
    },
    intro: {
      ...Typography.body,
      color: c.textSecondary,
      marginBottom: Spacing.sm,
    },
    sectionTitle: {
      ...Typography.h4,
      color: c.text,
      marginBottom: Spacing.sm,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: c.border,
      gap: Spacing.md,
    },
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
    hint: {
      ...Typography.caption,
      color: c.textSecondary,
    },
    myLoomsTitle: {
      ...Typography.h3,
      color: c.text,
      marginTop: Spacing.sm,
    },
    emptyMyLooms: {
      ...Typography.bodySm,
      color: c.textSecondary,
      textAlign: 'center',
    },
    loomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    loomTextWrap: { flex: 1, gap: 2 },
    loomName: { ...Typography.body, color: c.text, fontWeight: '600' },
    loomId: { ...Typography.caption, color: c.textSecondary },
    loomRole: { ...Typography.caption, color: c.mutedForeground },
    enterBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      backgroundColor: c.primary,
    },
    enterBtnText: {
      color: c.primaryForeground,
      fontWeight: '600',
      fontSize: ComponentTokens.button.sm.fontSize,
    },
    requestRow: {
      gap: Spacing.sm,
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    requestTextWrap: { gap: 2 },
    requestTitle: { ...Typography.body, color: c.text, fontWeight: '600' },
    requestSub: { ...Typography.caption, color: c.textSecondary },
    requestActions: { flexDirection: 'row', gap: Spacing.sm },
    smallBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.md,
      alignItems: 'center',
    },
    smallBtnText: { fontWeight: '600', fontSize: 13 },
    errorText: { ...Typography.bodySm, color: c.destructive },
    messageText: { ...Typography.bodySm, color: c.success },
  });
}
