export const colors = {
  light: {
    background: '#f4f8fc',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    textPrimary: '#16202b',
    textSecondary: '#5a6b7a',
    primary: '#2486e0',
    primaryPressed: '#1a6fc0',
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
    background: '#09120e',
    surface: '#102019',
    surfaceElevated: '#152a21',
    textPrimary: '#e7f0eb',
    textSecondary: '#a3b5ad',
    primary: '#36a66d',
    primaryPressed: '#2e915f',
    border: '#243b31',
    dot: '#496157',
    textOnPrimary: '#ffffff',
    overlay: 'rgba(4, 10, 7, 0.42)',
    chipBackground: 'rgba(16, 32, 25, 0.9)',
    tabBarBackground: '#ffffff',
    tabBarBorder: '#d9e3de',
    tabBarActive: '#177245',
    tabBarInactive: '#7c8a84',
    success: '#177245',
    warning: '#b26c18',
    danger: '#bb2f2f',
    cardBorder: '#dfe8e3',
    cardSurface: '#ffffff',
    chipSurfaceSoft: '#eff5f1',
    premiumSurface: '#1f2a16',
    premiumBorder: '#3a4a26',
    premiumAccent: '#d6a04a',
  },
} as const;

export const gradients = {
  /** Subtle vertical brand gradient (lighter top → base) for a soft 3D button/tab look. */
  primary: ['#3d99ee', '#1c74cb'] as const,
  primaryPressed: ['#2f8ae0', '#155a9e'] as const,
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
