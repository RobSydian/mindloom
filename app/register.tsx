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
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, ComponentTokens, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthContext } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RegisterScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isResetMode = mode === 'reset';
  const title = useMemo(
    () => (isResetMode ? 'Reset password' : 'Create account'),
    [isResetMode]
  );

  const { register, sendPasswordReset } = useAuthContext();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!email.trim() || !password || !displayName.trim()) {
      setError('Display name, email, and password are required.');
      return;
    }
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await register(email.trim(), password, displayName.trim());
      router.replace('/group-onboarding');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setError('Please enter your email first.');
      return;
    }
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setMessage('If this email is registered, a reset link has been sent.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not send reset email.');
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
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Alex"
                  placeholderTextColor={c.textDisabled}
                />
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={c.textDisabled}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {!isResetMode ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={c.textDisabled}
                  secureTextEntry
                />
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
                  {isResetMode ? 'Send reset email' : 'Create account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkRow}>
              <Text style={styles.linkText}>Back to login</Text>
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
