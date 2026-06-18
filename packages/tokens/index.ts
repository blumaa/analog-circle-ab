/**
 * TS mirror of the semantic token layer — for JS contexts that can't read CSS vars
 * (e.g. Leaflet marker styling, canvas, charts). Values reference the CSS custom
 * properties so the single source of truth stays the CSS layer.
 */
export const token = {
  bg: "var(--color-bg)",
  bgDeep: "var(--color-bg-deep)",
  surfaceCard: "var(--color-surface-card)",
  textStrong: "var(--color-text-strong)",
  text: "var(--color-text)",
  textSoft: "var(--color-text-soft)",
  textFaint: "var(--color-text-faint)",
  textMuted: "var(--color-text-muted)",
  accent: "var(--color-accent)",
  accentBright: "var(--color-accent-bright)",
  onAccent: "var(--color-on-accent)",
  hairline: "var(--color-hairline)",
  whatsapp: "var(--color-whatsapp)",
  success: "var(--color-success)",
  error: "var(--color-error)",
  info: "var(--color-info)",
} as const;

/** Raw hex values for non-DOM contexts (map pins, etc.) that can't resolve CSS vars. */
export const rawColor = {
  navy800: "#1a1a2e",
  navy900: "#1a1a24",
  gold500: "#c9a84c",
  goldInk: "#1a1505",
  ivory50: "#f5f0e8",
} as const;

export type TokenName = keyof typeof token;
