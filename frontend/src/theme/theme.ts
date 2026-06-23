export const colors = {
  light: {
    background: '#f4f8fc',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    textPrimary: '#16202b',
    textSecondary: '#5a6b7a',
    primary: '#2486e0',
    primaryPressed: '#1a6fc0',
    // Tonal blue ramp for on-brand tints (chips, badges, soft fills).
    primary50: '#eef5fd',
    primary100: '#dbeafb',
    primary600: '#1a6fc0',
    primary700: '#155a9e',
    primarySoft: 'rgba(36, 134, 224, 0.10)',
    primaryTint: 'rgba(36, 134, 224, 0.18)',
    border: '#dbe5ef',
    dot: '#b8c6d6',
    textOnPrimary: '#ffffff',
    overlay: 'rgba(16, 24, 35, 0.36)',
    chipBackground: 'rgba(255, 255, 255, 0.9)',
    tabBarBackground: '#ffffff',
    tabBarBorder: '#dbe5ef',
    tabBarActive: '#2486e0',
    tabBarInactive: '#7c8a96',
    success: '#177245',
    warning: '#b26c18',
    danger: '#bb2f2f',
    cardBorder: '#e0e8f1',
    cardSurface: '#ffffff',
    chipSurfaceSoft: '#eef4fb',
    premiumSurface: '#fbf3e6',
    premiumBorder: '#eadcc2',
    premiumAccent: '#b26c18',
  },
  dark: {
    background: '#0a1420',
    surface: '#10202f',
    surfaceElevated: '#152a3d',
    textPrimary: '#e7eef6',
    textSecondary: '#a3b3c4',
    primary: '#3d99ee',
    primaryPressed: '#2f8ae0',
    primary50: '#16273a',
    primary100: '#1c3a52',
    primary600: '#5aa9f1',
    primary700: '#7cbcf4',
    primarySoft: 'rgba(61, 153, 238, 0.12)',
    primaryTint: 'rgba(61, 153, 238, 0.22)',
    border: '#243a50',
    dot: '#49617c',
    textOnPrimary: '#ffffff',
    overlay: 'rgba(4, 8, 14, 0.46)',
    chipBackground: 'rgba(16, 32, 47, 0.9)',
    tabBarBackground: '#ffffff',
    tabBarBorder: '#d9e1ea',
    tabBarActive: '#2486e0',
    tabBarInactive: '#7c8a96',
    success: '#2f9e63',
    warning: '#cf9036',
    danger: '#d35050',
    cardBorder: '#22384d',
    cardSurface: '#10202f',
    chipSurfaceSoft: '#16273a',
    premiumSurface: '#1d2a16',
    premiumBorder: '#3a4a26',
    premiumAccent: '#d6a04a',
  },
} as const;

export const gradients = {
  /** Subtle vertical brand gradient (lighter top → base) for a soft 3D button/tab look. */
  primary: ['#3d99ee', '#1c74cb'] as const,
  primaryPressed: ['#2f8ae0', '#155a9e'] as const,
  /** On-brand CTA gradient: a tight range around `primary` so it reads as one smooth blue. */
  button: ['#2f93ec', '#1f77cd'] as const,
  buttonPressed: ['#2079d2', '#155a9e'] as const,
  /** Gentle header band gradient — brand blue with a soft vertical lift (kept subtle). */
  header: ['#2a8ce8', '#1d75ce'] as const,
} as const;

/** Brand-tinted elevation presets for a consistent, premium sense of depth. */
export const shadow = {
  sm: {
    shadowColor: '#0c3d6b',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#0c3d6b',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  lg: {
    shadowColor: '#0c3d6b',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const sizing = {
  buttonHeight: 52,
  mediaMinHeight: 280,
  mediaMaxHeight: 430,
  headerHeight: 56,
  heroHeight: 430,
  iconButtonSize: 40,
  stickyActionHeight: 64,
} as const;

export const typography = {
  title: 30,
  titleMd: 22,
  subtitle: 16,
  body: 15,
  button: 16,
  caption: 13,
  label: 12,
} as const;

/** Line-height presets matched to the type scale for comfortable, premium reading rhythm. */
export const lineHeight = {
  title: 36,
  titleMd: 28,
  subtitle: 22,
  body: 22,
  caption: 18,
  label: 16,
} as const;

/** Tracking presets. Large display text tightens slightly; eyebrow/labels open up. */
export const letterSpacing = {
  tight: -0.5,
  snug: -0.2,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
} as const;
