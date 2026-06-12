/** Shared design tokens — imported by tailwind.config.js and navigation theme. */
const light = {
  primary: "#004D40",
  secondary: "#4A148C",
  accent: "#D4AF37",
  surface: "#FAFAFA",
  card: "#FFFFFF",
  ink: "#212121",
  muted: "#757575",
  onPrimary: "#FFFFFF",
  onAccent: "#212121",
  error: "#D32F2F",
  success: "#388E3C",
  border: "#E0E0E0",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E0E0E0",
};

const dark = {
  primary: "#00695C",
  secondary: "#6A1B9A",
  accent: "#E6C547",
  surface: "#121212",
  card: "#1E1E1E",
  ink: "#F5F5F5",
  muted: "#B0B0B0",
  onPrimary: "#FFFFFF",
  onAccent: "#212121",
  error: "#EF5350",
  success: "#66BB6A",
  border: "#2C2C2C",
  tabBar: "#1E1E1E",
  tabBarBorder: "#2C2C2C",
};

module.exports = {
  light,
  dark,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
};
