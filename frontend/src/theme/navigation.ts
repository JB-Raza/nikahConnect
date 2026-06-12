import tokens from "./tokens.js";

type Scheme = "light" | "dark";

/** Navigation-only colors — use className everywhere else. */
export function getNavTheme(scheme: Scheme | null | undefined) {
  const colors = scheme === "dark" ? tokens.dark : tokens.light;

  return {
    headerBg: colors.card,
    headerTint: colors.ink,
    contentBg: colors.surface,
    statusBar: scheme === "dark" ? ("light" as const) : ("dark" as const),
  };
}

export { tokens };
