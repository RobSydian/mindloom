import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { t } from '@/constants/i18n';
import { Screen } from '@/components/layout/Screen';
import { Section } from '@/components/layout/Section';
import { Avatar } from '@/components/ui/Avatar';
import { ListItem } from '@/components/ui/ListItem';
import { Divider } from '@/components/ui/Divider';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuthContext } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImpressions } from '@/hooks/use-impressions';
import { useGoals } from '@/hooks/use-goals';
import { useCalendarEvents } from '@/hooks/use-calendar';
import { createGroupInvite } from '@/lib/invites/invite-service';
import { leaveLoom } from '@/lib/groups/group-service';
import { GROUPS_KEY, useGroups } from '@/hooks/use-groups';
import { setActiveGroupId } from '@/lib/users/user-service';
import { getAppLanguage, setAppLanguage } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/i18n/resources';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const queryClient = useQueryClient();
  const { user, signOut, refreshUser } = useAuthContext();
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteMessage, setInviteMessage] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<SupportedLanguage>(
    getAppLanguage()
  );

  const { data: impressions } = useImpressions();
  const { data: goals } = useGoals();
  const { data: events } = useCalendarEvents();
  const { data: groups } = useGroups();

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  }

  async function handleCreateInvite() {
    if (!user?.activeGroupId) return;
    if (!inviteEmail.trim()) {
      setInviteMessage(t('profile.group.inviteEmailRequired'));
      return;
    }
    try {
      const invite = await createGroupInvite({
        groupId: user.activeGroupId,
        inviteeEmail: inviteEmail.trim(),
        createdBy: user.uid,
      });
      setInviteMessage(t('profile.group.inviteCreated', { email: invite.invite.emailLower }));
      await Linking.openURL(invite.mailtoLink);
    } catch (e: unknown) {
      setInviteMessage(e instanceof Error ? e.message : 'Failed to create invite.');
    }
  }

  async function handleSwitchGroup(groupId: string) {
    if (!user) return;
    try {
      await setActiveGroupId(user.uid, groupId);
      await refreshUser();
      setInviteMessage(t('profile.group.switchDone', { groupId }));
    } catch (e: unknown) {
      setInviteMessage(e instanceof Error ? e.message : t('profile.group.switchFailed'));
    }
  }

  async function handleChangeLanguage(lang: SupportedLanguage) {
    await setAppLanguage(lang);
    setSelectedLanguage(lang);
    setInviteMessage(t('profile.language.updated', { lang: lang.toUpperCase() }));
  }

  function handleLeaveLoom() {
    if (!user?.activeGroupId || !groups) return;
    const g = groups.find((x) => x.id === user.activeGroupId);
    if (!g || g.createdBy === user.uid) return;
    Alert.alert(t('profile.group.leaveConfirmTitle'), t('profile.group.leaveConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.group.leaveLoom'),
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveLoom(user.uid, g.id);
            await queryClient.invalidateQueries({ queryKey: GROUPS_KEY });
            await refreshUser();
            setInviteMessage(t('profile.group.leaveDone'));
          } catch (e: unknown) {
            const msg =
              e instanceof Error && e.message === 'CREATOR_CANNOT_LEAVE'
                ? t('profile.group.creatorCannotLeave')
                : e instanceof Error
                  ? e.message
                  : t('profile.group.leaveFailed');
            setInviteMessage(msg);
          }
        },
      },
    ]);
  }

  const activeLoom = groups?.find((x) => x.id === user?.activeGroupId);
  const showLeaveLoom =
    Boolean(user?.activeGroupId) && Boolean(activeLoom && activeLoom.createdBy !== user?.uid);

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: c.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <View style={[styles.userCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Avatar name={user?.displayName} uri={user?.photoURL} size="xl" />
          <View style={styles.userInfo}>
            <Text style={[styles.displayName, { color: c.text }]}>
              {user?.displayName ?? '—'}
            </Text>
            <Text style={[styles.email, { color: c.textSecondary }]}>
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <Section title="Your Stats" style={styles.section}>
          <View style={[styles.statsRow, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.primary }]}>
                {impressions?.length ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>Impressions</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.primary }]}>
                {goals?.length ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>Goals</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: c.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.primary }]}>
                {events?.length ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>Events</Text>
            </View>
          </View>
        </Section>

        {/* Account */}
        <Section title="Account" style={styles.section}>
          <View style={[styles.listCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <ListItem
              title="Notifications"
              subtitle="Manage push notifications"
              left={<IconSymbol name="bell.fill" size={20} color={c.primary} />}
              right={<IconSymbol name="chevron.right" size={16} color={c.textSecondary} />}
            />
            <Divider inset={52} />
            <ListItem
              title="Settings"
              subtitle="App preferences"
              left={<IconSymbol name="gear" size={20} color={c.primary} />}
              right={<IconSymbol name="chevron.right" size={16} color={c.textSecondary} />}
            />
          </View>
        </Section>

        {/* Loom settings */}
        <Section title={t('profile.section.loom')} style={styles.section}>
          <View style={[styles.listCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <ListItem
              title={t('profile.group.activeLoomId')}
              subtitle={user?.activeGroupId ?? '—'}
              left={<IconSymbol name="person.fill" size={20} color={c.primary} />}
            />
            <Divider inset={52} />
            <View style={styles.inviteRow}>
              <TextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder={t('onboarding.inviteEmailPlaceholder')}
                placeholderTextColor={c.textDisabled}
                style={[
                  styles.inviteInput,
                  { borderColor: c.border, color: c.text, backgroundColor: c.muted },
                ]}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                onPress={handleCreateInvite}
                style={[styles.inviteButton, { backgroundColor: c.primary }]}
              >
                <Text style={[styles.inviteButtonText, { color: c.primaryForeground }]}>
                  {t('onboarding.sendInvite')}
                </Text>
              </TouchableOpacity>
            </View>
            {inviteMessage ? (
              <Text style={[styles.inviteMessage, { color: c.textSecondary }]}>{inviteMessage}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.openOnboarding}
              onPress={() => router.push('/group-onboarding')}
            >
              <Text style={[styles.openOnboardingText, { color: c.primary }]}>
                {t('profile.group.openLoomSetup')}
              </Text>
            </TouchableOpacity>

            {showLeaveLoom ? (
              <>
                <Divider inset={52} />
                <TouchableOpacity onPress={handleLeaveLoom} style={styles.openOnboarding}>
                  <Text style={[styles.openOnboardingText, { color: c.destructive }]}>
                    {t('profile.group.leaveLoom')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}

            {groups && groups.length > 1 ? (
              <>
                <Divider inset={52} />
                <View style={styles.groupSwitchWrap}>
                  <Text style={[styles.groupSwitchTitle, { color: c.textSecondary }]}>
                    {t('profile.group.switchLoom')}
                  </Text>
                  {groups.map((g) => {
                    const active = g.id === user?.activeGroupId;
                    return (
                      <TouchableOpacity
                        key={g.id}
                        style={[
                          styles.groupChip,
                          {
                            borderColor: active ? c.primary : c.border,
                            backgroundColor: active ? c.accent : c.surface,
                          },
                        ]}
                        onPress={() => handleSwitchGroup(g.id)}
                      >
                        <Text
                          style={[
                            styles.groupChipText,
                            { color: active ? c.accentForeground : c.text },
                          ]}
                        >
                          {g.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : null}
          </View>
        </Section>

        <Section title={t('profile.language.title')} style={styles.section}>
          <View style={[styles.listCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.languageRow}>
              {(['en', 'es', 'ca'] as SupportedLanguage[]).map((lang) => {
                const active = selectedLanguage === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => handleChangeLanguage(lang)}
                    style={[
                      styles.languageButton,
                      {
                        backgroundColor: active ? c.primary : c.muted,
                        borderColor: active ? c.primary : c.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        { color: active ? c.primaryForeground : c.textSecondary },
                      ]}
                    >
                      {lang.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Section>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: c.destructiveSubtle, borderColor: c.destructive }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={[styles.signOutLabel, { color: c.destructiveForeground }]}>Sign out</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  userCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  userInfo: {
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    ...Typography.h3,
  },
  email: {
    ...Typography.body,
  },
  section: {
    gap: Spacing.sm,
  },
  statsRow: {
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  statValue: {
    ...Typography.h2,
  },
  statLabel: {
    ...Typography.bodySm,
  },
  listCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inviteRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  inviteInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    height: 42,
  },
  inviteButton: {
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonText: {
    ...Typography.bodySm,
    fontWeight: '600',
  },
  languageRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  languageButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  languageButtonText: {
    ...Typography.bodySm,
    fontWeight: '600',
  },
  inviteMessage: {
    ...Typography.caption,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  openOnboarding: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  openOnboardingText: {
    ...Typography.bodySm,
    fontWeight: '500',
  },
  groupSwitchWrap: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  groupSwitchTitle: {
    ...Typography.labelSm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  groupChipText: {
    ...Typography.bodySm,
    fontWeight: '500',
  },
  signOutBtn: {
    marginHorizontal: Spacing.lg,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutLabel: {
    ...Typography.body,
    fontWeight: '600',
  },
});
