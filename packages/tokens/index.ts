/**
 * TS mirror of the semantic token layer — for JS contexts that can't use CSS classes
 * (charts, canvas). Values reference CSS custom properties so the CSS stays SSOT.
 */
export const token = {
  bg: "var(--color-bg)",
  bgDeep: "var(--color-bg-deep)",
  surface: "var(--color-surface)",
  surface2: "var(--color-surface-2)",
  border: "var(--color-border)",
  text: "var(--color-text)",
  text2: "var(--color-text-2)",
  muted: "var(--color-muted)",
  accent: "var(--color-accent)",
  accentText: "var(--color-accent-text)",
  accentBright: "var(--color-accent-bright)",
  onAccent: "var(--color-on-accent)",
  success: "var(--color-success)",
  danger: "var(--color-danger)",
} as const;

export type TokenName = keyof typeof token;
