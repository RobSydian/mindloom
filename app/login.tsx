import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthContext } from '@/context/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadow, ComponentTokens } from '@/constants/theme';
import { t } from '@/constants/i18n';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAuthErrorKey } from '@/lib/errors/auth-errors';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);

  const { signIn, signOut, user, sendPasswordReset } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError(t('login.error.missingCredentials'));
      return;
    }
    setError(null);
    setResetSuccess(false);
    setIsLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (e: unknown) {
      setError(t(getAuthErrorKey(e)));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendReset() {
    if (!email.trim()) {
      setError(t('reset.error.missingEmail'));
      return;
    }
    setError(null);
    setResetSuccess(false);
    setIsLoading(true);
    try {
      await sendPasswordReset(email.trim().toLowerCase());
      setResetSuccess(true);
    } catch (e: unknown) {
      setError(t(getAuthErrorKey(e)));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearSession() {
    setError(null);
    try {
      await signOut();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to sign out.');
    }
  }

  function exitForgotMode() {
    setForgotMode(false);
    setResetSuccess(false);
    setError(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoArea}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>M</Text>
            </View>
            <Text style={styles.brandTitle}>{t('login.brandTitle')}</Text>
            <Text style={styles.taglineSecondary}>{t('login.taglineSecondary')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeadline}>{t('login.welcomeMindloomer')}</Text>

            {resetSuccess ? (
              <View style={[styles.banner, { backgroundColor: c.successSubtle, borderColor: c.success }]}>
                <Text style={[styles.bannerText, { color: c.successForeground }]}>
                  {t('reset.success.sentAffirmative')}
                </Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('login.email')}</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                placeholder={t('login.emailPlaceholder')}
                placeholderTextColor={c.textDisabled}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType={forgotMode ? 'done' : 'next'}
              />
            </View>

            {!forgotMode ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('login.password')}</Text>
                <View style={[styles.passwordRow, passwordFocused && styles.passwordRowFocused]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('login.passwordPlaceholder')}
                    placeholderTextColor={c.textDisabled}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? t('common.hidePassword') : t('common.showPassword')
                    }
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.passwordReveal}
                    hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                  >
                    <IconSymbol
                      name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={22}
                      color={c.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={forgotMode ? handleSendReset : handleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={c.primaryForeground} size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {forgotMode ? t('reset.submit') : t('login.signIn')}
                </Text>
              )}
            </TouchableOpacity>

            {!forgotMode ? (
              <>
                <TouchableOpacity
                  onPress={() => router.push('/register')}
                  style={styles.centerLink}
                >
                  <Text style={styles.inlineActionText}>{t('login.createAccount')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setForgotMode(true);
                    setError(null);
                    setResetSuccess(false);
                  }}
                  style={styles.centerLink}
                >
                  <Text style={styles.demoText}>{t('login.forgotPassword')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={exitForgotMode} style={styles.centerLink}>
                <Text style={styles.inlineActionText}>{t('login.backToSignIn')}</Text>
              </TouchableOpacity>
            )}

            {user ? (
              <TouchableOpacity onPress={handleClearSession} style={styles.centerLink}>
                <Text style={[styles.demoText, { opacity: 0.7 }]}>
                  {t('login.signOutCurrent', { email: user.email || user.displayName })}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    kav: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xxxl,
    },
    logoArea: {
      alignItems: 'center',
      marginBottom: Spacing.xxxl,
      gap: Spacing.sm,
    },
    logoMark: {
      width: 64,
      height: 64,
      borderRadius: Radius.xl,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xs,
      ...Shadow.md,
    },
    logoMarkText: {
      color: c.primaryForeground,
      fontSize: 32,
      fontWeight: '700',
    },
    brandTitle: {
      ...Typography.h2,
      color: c.text,
      letterSpacing: -0.5,
    },
    taglineSecondary: {
      ...Typography.body,
      color: c.textSecondary,
      textAlign: 'center',
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      padding: Spacing.xl,
      gap: Spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      ...Shadow.md,
    },
    cardHeadline: {
      ...Typography.h3,
      color: c.text,
      marginBottom: Spacing.xs,
    },
    banner: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1,
    },
    bannerText: {
      ...Typography.bodySm,
      textAlign: 'center',
    },
    fieldGroup: {
      gap: Spacing.xs,
    },
    label: {
      ...Typography.label,
      color: c.textSecondary,
    },
    input: {
      height: ComponentTokens.input.height,
      backgroundColor: c.muted,
      borderRadius: ComponentTokens.input.borderRadius,
      borderWidth: ComponentTokens.input.borderWidth,
      borderColor: c.border,
      paddingHorizontal: ComponentTokens.input.paddingH,
      color: c.text,
      fontSize: ComponentTokens.input.fontSize,
    },
    inputFocused: {
      borderColor: c.primary,
      backgroundColor: c.surface,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: ComponentTokens.input.height,
      backgroundColor: c.muted,
      borderRadius: ComponentTokens.input.borderRadius,
      borderWidth: ComponentTokens.input.borderWidth,
      borderColor: c.border,
      paddingRight: Spacing.xs,
    },
    passwordRowFocused: {
      borderColor: c.primary,
      backgroundColor: c.surface,
    },
    passwordInput: {
      flex: 1,
      height: ComponentTokens.input.height,
      paddingHorizontal: ComponentTokens.input.paddingH,
      color: c.text,
      fontSize: ComponentTokens.input.fontSize,
    },
    passwordReveal: {
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 44,
      minHeight: 44,
    },
    errorText: {
      ...Typography.bodySm,
      color: c.destructive,
    },
    button: {
      height: ComponentTokens.button.lg.height,
      backgroundColor: c.primary,
      borderRadius: ComponentTokens.button.lg.borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.xs,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: c.primaryForeground,
      fontSize: ComponentTokens.button.lg.fontSize,
      fontWeight: '600',
    },
    centerLink: {
      alignItems: 'center',
      paddingVertical: Spacing.xs,
    },
    inlineActionText: {
      ...Typography.bodySm,
      color: c.primary,
      fontWeight: '500',
    },
    demoText: {
      ...Typography.body,
      color: c.primary,
    },
  });
}
