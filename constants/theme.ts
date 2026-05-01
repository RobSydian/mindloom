import { Platform } from 'react-native';

// ─── Raw Palette ─────────────────────────────────────────────────────────────
// Never reference these directly in components. Use semantic tokens instead.
const Palette = {
  // Brand
  violet50: '#f5f3ff',
  violet100: '#ede9fe',
  violet200: '#ddd6fe',
  violet400: '#a78bfa',
  violet500: '#8b5cf6',
  violet600: '#7c3aed',
  violet700: '#6d28d9',
  violet900: '#2e1065',

  // Neutrals
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  black: '#000000',

  // Status
  green400: '#4ade80',
  green500: '#22c55e',
  green600: '#16a34a',
  green50: '#f0fdf4',

  amber400: '#fbbf24',
  amber500: '#f59e0b',
  amber600: '#d97706',
  amber50: '#fffbeb',

  red400: '#f87171',
  red500: '#ef4444',
  red600: '#dc2626',
  red50: '#fef2f2',

  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue50: '#eff6ff',

  // Dark mode surfaces
  dark900: '#0f0f12',
  dark800: '#18181f',
  dark700: '#1e1e28',
  dark600: '#25252f',
  dark500: '#2e2e3a',
  dark400: '#3d3d4e',
  dark300: '#5c5c72',
};

// ─── Semantic Color Tokens ────────────────────────────────────────────────────
export const Colors = {
  light: {
    // Page / surfaces
    background: Palette.gray50,
    surface: Palette.white,
    surfaceRaised: Palette.white,

    // Brand
    primary: Palette.violet600,
    primaryForeground: Palette.white,
    secondary: Palette.violet50,
    secondaryForeground: Palette.violet700,

    // Neutral UI
    muted: Palette.gray100,
    mutedForeground: Palette.gray500,
    accent: Palette.violet100,
    accentForeground: Palette.violet700,

    // Typography
    text: Palette.gray900,
    icon: Palette.gray500,
    textSecondary: Palette.gray500,
    textDisabled: Palette.gray300,
    textOnPrimary: Palette.white,

    // Status
    success: Palette.green500,
    successSubtle: Palette.green50,
    successForeground: Palette.green600,
    warning: Palette.amber500,
    warningSubtle: Palette.amber50,
    warningForeground: Palette.amber600,
    destructive: Palette.red500,
    destructiveSubtle: Palette.red50,
    destructiveForeground: Palette.red600,
    info: Palette.blue500,
    infoSubtle: Palette.blue50,
    infoForeground: Palette.blue600,

    // Structural
    border: Palette.gray200,
    separator: Palette.gray100,
    shadow: Palette.black,

    // Navigation / Tabs
    tint: Palette.violet600,
    tabActive: Palette.violet600,
    tabInactive: Palette.gray400,
    tabBackground: Palette.white,

    // Stars
    starFilled: Palette.amber400,
    starEmpty: Palette.gray200,
  },

  dark: {
    // Page / surfaces
    background: Palette.dark900,
    surface: Palette.dark800,
    surfaceRaised: Palette.dark700,

    // Brand
    primary: Palette.violet400,
    primaryForeground: Palette.dark900,
    secondary: Palette.dark600,
    secondaryForeground: Palette.violet200,

    // Neutral UI
    muted: Palette.dark700,
    mutedForeground: Palette.dark300,
    accent: Palette.dark500,
    accentForeground: Palette.violet200,

    // Typography
    text: Palette.gray50,
    icon: Palette.gray400,
    textSecondary: Palette.gray400,
    textDisabled: Palette.dark400,
    textOnPrimary: Palette.dark900,

    // Status
    success: Palette.green400,
    successSubtle: '#0d2818',
    successForeground: Palette.green400,
    warning: Palette.amber400,
    warningSubtle: '#2d1f00',
    warningForeground: Palette.amber400,
    destructive: Palette.red400,
    destructiveSubtle: '#2d0e0e',
    destructiveForeground: Palette.red400,
    info: Palette.blue400,
    infoSubtle: '#0d1f3d',
    infoForeground: Palette.blue400,

    // Structural
    border: Palette.dark500,
    separator: Palette.dark600,
    shadow: Palette.black,

    // Navigation / Tabs
    tint: Palette.violet400,
    tabActive: Palette.violet400,
    tabInactive: Palette.dark300,
    tabBackground: Palette.dark800,

    // Stars
    starFilled: Palette.amber400,
    starEmpty: Palette.dark500,
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;

// ─── Goal Status Color Map ────────────────────────────────────────────────────
export const GoalStatusColors = {
  light: {
    pending: { bg: Palette.gray100, fg: Palette.gray600 },
    in_progress: { bg: Palette.blue50, fg: Palette.blue600 },
    finished: { bg: Palette.green50, fg: Palette.green600 },
    blocked: { bg: Palette.red50, fg: Palette.red600 },
    cancelled: { bg: Palette.gray100, fg: Palette.gray400 },
  },
  dark: {
    pending: { bg: Palette.dark600, fg: Palette.gray400 },
    in_progress: { bg: '#0d1f3d', fg: Palette.blue400 },
    finished: { bg: '#0d2818', fg: Palette.green400 },
    blocked: { bg: '#2d0e0e', fg: Palette.red400 },
    cancelled: { bg: Palette.dark600, fg: Palette.dark300 },
  },
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const Typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  labelSm: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  tabLabel: { fontSize: 10, fontWeight: '500' as const, lineHeight: 14 },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const Shadow = {
  sm: Platform.select({
    ios: {
      shadowColor: Palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: Palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: Palette.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

// ─── Component Tokens ─────────────────────────────────────────────────────────
export const ComponentTokens = {
  button: {
    sm: { height: 32, paddingH: 12, fontSize: 13, borderRadius: Radius.md },
    md: { height: 40, paddingH: 16, fontSize: 14, borderRadius: Radius.md },
    lg: { height: 48, paddingH: 20, fontSize: 16, borderRadius: Radius.lg },
  },
  input: {
    height: 48,
    paddingH: Spacing.lg,
    paddingV: Spacing.md,
    borderRadius: Radius.md,
    fontSize: 15,
    borderWidth: 1,
  },
  tab: {
    height: 64,
    iconSize: 24,
    labelSize: 10,
    paddingBottom: 8,
  },
  listItem: {
    minHeight: 56,
    paddingH: Spacing.lg,
    paddingV: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    borderWidth: 1,
  },
  badge: {
    height: 20,
    paddingH: Spacing.sm,
    fontSize: 11,
    borderRadius: Radius.full,
  },
  statCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    minWidth: 140,
  },
  avatar: {
    sm: { size: 28, borderRadius: 14, fontSize: 12 },
    md: { size: 40, borderRadius: 20, fontSize: 16 },
    lg: { size: 56, borderRadius: 28, fontSize: 22 },
    xl: { size: 80, borderRadius: 40, fontSize: 32 },
  },
} as const;

// ─── Fonts ───────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
