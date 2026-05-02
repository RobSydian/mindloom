import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { t } from '@/constants/i18n';
import { Colors, ComponentTokens, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthContext } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getSignupPasswordErrorKey,
  SIGNUP_PASSWORD_MIN_LENGTH,
} from '@/lib/auth/password-policy';
import { getAuthErrorKey } from '@/lib/errors/auth-errors';

export default function RegisterScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isResetMode = mode === 'reset';
  const title = useMemo(
    () => (isResetMode ? t('reset.title') : t('register.title')),
    [isResetMode]
  );

  const { register, sendPasswordReset } = useAuthContext();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorIsPasswordPolicy, setErrorIsPasswordPolicy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  async function handleRegister() {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !trimmedEmail || !password) {
      setErrorIsPasswordPolicy(false);
      setError(t('register.error.missingFields'));
      return;
    }
    const passwordPolicyKey = getSignupPasswordErrorKey(password);
    if (passwordPolicyKey) {
      setErrorIsPasswordPolicy(true);
      setError(t(passwordPolicyKey, { min: SIGNUP_PASSWORD_MIN_LENGTH }));
      return;
    }
    if (password !== confirmPassword) {
      setErrorIsPasswordPolicy(false);
      setError(t('register.error.passwordMismatch'));
      return;
    }
    setErrorIsPasswordPolicy(false);
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await register(trimmedEmail, password, trimmedUsername);
      router.replace('/');
    } catch (e: unknown) {
      setErrorIsPasswordPolicy(false);
      setError(t(getAuthErrorKey(e)));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setErrorIsPasswordPolicy(false);
      setError(t('reset.error.missingEmail'));
      return;
    }
    setErrorIsPasswordPolicy(false);
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await sendPasswordReset(email.trim().toLowerCase());
      setMessage(t('reset.success.sentAffirmative'));
    } catch (e: unknown) {
      setErrorIsPasswordPolicy(false);
      setError(t(getAuthErrorKey(e)));
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
            <Text style={styles.title}>{title}</Text>

            {!isResetMode ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('register.username')}</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder={t('register.usernamePlaceholder')}
                    placeholderTextColor={c.textDisabled}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('register.email')}</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('register.emailPlaceholder')}
                    placeholderTextColor={c.textDisabled}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('register.password')}</Text>
                  <Text style={styles.passwordHint}>{t('register.passwordRulesHint')}</Text>
                  <View style={[styles.passwordRow, passwordFocused && styles.passwordRowFocused]}>
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder={t('register.passwordPlaceholder')}
                      placeholderTextColor={c.textDisabled}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      textContentType="newPassword"
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

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('register.confirmPassword')}</Text>
                  <View style={[styles.passwordRow, confirmFocused && styles.passwordRowFocused]}>
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setConfirmFocused(true)}
                      onBlur={() => setConfirmFocused(false)}
                      placeholder={t('register.confirmPasswordPlaceholder')}
                      placeholderTextColor={c.textDisabled}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="password"
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={
                        showConfirmPassword ? t('common.hidePassword') : t('common.showPassword')
                      }
                      onPress={() => setShowConfirmPassword((v) => !v)}
                      style={styles.passwordReveal}
                      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    >
                      <IconSymbol
                        name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                        size={22}
                        color={c.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('register.email')}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('register.emailPlaceholder')}
                  placeholderTextColor={c.textDisabled}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            )}

            {error ? (
              errorIsPasswordPolicy ? (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              ) : (
                <Text style={styles.errorText}>{error}</Text>
              )
            ) : null}
            {message ? <Text style={styles.messageText}>{message}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
              onPress={isResetMode ? handleReset : handleRegister}
            >
              {isLoading ? (
                <ActivityIndicator color={c.primaryForeground} />
              ) : (
                <Text style={styles.buttonText}>
                  {isResetMode ? t('reset.submit') : t('register.submit')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkRow}>
              <Text style={styles.linkText}>{t('register.backToLogin')}</Text>
            </TouchableOpacity>
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
    title: {
      ...Typography.h3,
      color: c.text,
      marginBottom: Spacing.xs,
    },
    fieldGroup: { gap: Spacing.xs },
    label: { ...Typography.label, color: c.textSecondary },
    passwordHint: {
      ...Typography.caption,
      color: c.textSecondary,
      marginBottom: Spacing.xs,
    },
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
    errorBanner: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1,
      backgroundColor: c.destructiveSubtle,
      borderColor: c.destructive,
    },
    errorBannerText: {
      ...Typography.bodySm,
      fontWeight: '500',
      color: c.destructiveForeground,
    },
    errorText: { ...Typography.bodySm, color: c.destructive },
    messageText: { ...Typography.bodySm, color: c.success },
    button: {
      height: ComponentTokens.button.lg.height,
      borderRadius: ComponentTokens.button.lg.borderRadius,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.xs,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      color: c.primaryForeground,
      fontSize: ComponentTokens.button.lg.fontSize,
      fontWeight: '600',
    },
    linkRow: { alignItems: 'center', paddingVertical: Spacing.xs },
    linkText: { ...Typography.bodySm, color: c.primary },
  });
}
