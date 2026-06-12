const tokens = require("./src/theme/tokens.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: tokens.light.primary,
        "primary-dark": tokens.dark.primary,
        secondary: tokens.light.secondary,
        "secondary-dark": tokens.dark.secondary,
        accent: tokens.light.accent,
        "accent-dark": tokens.dark.accent,
        surface: tokens.light.surface,
        "surface-dark": tokens.dark.surface,
        card: tokens.light.card,
        "card-dark": tokens.dark.card,
        ink: tokens.light.ink,
        "ink-dark": tokens.dark.ink,
        muted: tokens.light.muted,
        "muted-dark": tokens.dark.muted,
        "on-primary": tokens.light.onPrimary,
        "on-accent": tokens.light.onAccent,
        error: tokens.light.error,
        "error-dark": tokens.dark.error,
        success: tokens.light.success,
        "success-dark": tokens.dark.success,
        border: tokens.light.border,
        "border-dark": tokens.dark.border,
      },
      spacing: tokens.spacing,
      borderRadius: tokens.radius,
      fontSize: {
        display: ["28px", { lineHeight: "36px", fontWeight: "700" }],
        headline: ["22px", { lineHeight: "28px", fontWeight: "600" }],
        title: ["18px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        label: ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
