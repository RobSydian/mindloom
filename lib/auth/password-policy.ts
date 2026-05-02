import type { TranslationKey } from '@/constants/i18n';

/** Minimum length for new passwords (client-side policy; Firebase Auth may enforce its own minimum). */
export const SIGNUP_PASSWORD_MIN_LENGTH = 8;

/** Allowed non-alphanumeric symbols for signup passwords. */
export const SIGNUP_PASSWORD_SPECIALS = '!$%&' as const;

export type SignupPasswordPolicyKey = Extract<
  TranslationKey,
  | 'register.error.passwordTooShort'
  | 'register.error.passwordInvalidChars'
  | 'register.error.passwordNeedsLetter'
  | 'register.error.passwordNeedsDigit'
  | 'register.error.passwordNeedsSpecial'
>;

/**
 * Returns an i18n key under `register.error.*` when the password does not meet policy, or null if OK.
 * Policy: only letters, digits, and !$%&; at least 8 chars; at least one letter, one digit, one of !$%&.
 */
export function getSignupPasswordErrorKey(password: string): SignupPasswordPolicyKey | null {
  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
    return 'register.error.passwordTooShort';
  }
  if (!/^[A-Za-z0-9!$%&]+$/.test(password)) {
    return 'register.error.passwordInvalidChars';
  }
  if (!/[A-Za-z]/.test(password)) {
    return 'register.error.passwordNeedsLetter';
  }
  if (!/[0-9]/.test(password)) {
    return 'register.error.passwordNeedsDigit';
  }
  if (!/[!$%&]/.test(password)) {
    return 'register.error.passwordNeedsSpecial';
  }
  return null;
}
