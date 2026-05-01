import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthContext } from '@/context/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadow, ComponentTokens } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const styles = makeStyles(c);

  const { signIn } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo() {
    setEmail('alex@mindloom.app');
    setPassword('password');
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
          {/* Logo / wordmark */}
          <View style={styles.logoArea}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>M</Text>
            </View>
            <Text style={styles.wordmark}>mindloom</Text>
            <Text style={styles.tagline}>Your shared world, in detail.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                placeholder="you@example.com"
                placeholderTextColor={c.textDisabled}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, passwordFocused && styles.inputFocused]}
                placeholder="••••••••"
                placeholderTextColor={c.textDisabled}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
            </View>

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Sign in */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={c.primaryForeground} size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => router.push('/register')} style={styles.inlineAction}>
                <Text style={styles.inlineActionText}>Create account</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={fillDemo} style={styles.inlineAction}>
                <Text style={styles.inlineActionText}>Use demo account</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/register?mode=reset')}
              style={styles.demoRow}
            >
              <Text style={styles.demoText}>Forgot password?</Text>
            </TouchableOpacity>
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
    wordmark: {
      ...Typography.h2,
      color: c.text,
      letterSpacing: -0.5,
    },
    tagline: {
      ...Typography.body,
      color: c.textSecondary,
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
    cardTitle: {
      ...Typography.h3,
      color: c.text,
      marginBottom: Spacing.xs,
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
    demoRow: {
      alignItems: 'center',
      paddingVertical: Spacing.xs,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    inlineAction: {
      flex: 1,
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
