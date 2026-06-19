/**
 * Design token reference — visual catalogue of all primitive and semantic tokens.
 * Sections: Colors, Spacing, Radii, Typography, Shadows, Motion.
 *
 * Values are resolved at render time via getComputedStyle so swatches always
 * reflect the live CSS custom properties loaded by the Storybook preview.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read a CSS custom property from :root at render time. */
function useTokenValue(token: string): string {
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
    setValue(raw);
  }, [token]);
  return value;
}

// ---------------------------------------------------------------------------
// Sub-components (internal to this story file, not exported from the package)
// ---------------------------------------------------------------------------

interface SwatchProps {
  token: string;
  label?: string;
}

function ColorSwatch({ token, label }: SwatchProps) {
  const value = useTokenValue(token);
  const nameLabel = label ?? token;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        minWidth: "9rem",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "3.5rem",
          borderRadius: "var(--radius-md)",
          background: `var(${token})`,
          border: "1px solid var(--alpha-hairline)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--family-body)",
          fontSize: "var(--font-xs)",
          color: "var(--ivory-100)",
          wordBreak: "break-all",
        }}
      >
        {nameLabel}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--muted-400)",
          wordBreak: "break-all",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

interface SpacingRowProps {
  token: string;
}

function SpacingRow({ token }: SpacingRowProps) {
  const value = useTokenValue(token);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--ivory-100)",
          width: "9rem",
          flexShrink: 0,
        }}
      >
        {token}
      </span>
      <div
        style={{
          height: "var(--space-4)",
          width: `var(${token})`,
          background: "var(--gold-500)",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--muted-400)",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

interface RadiusBoxProps {
  token: string;
}

function RadiusBox({ token }: RadiusBoxProps) {
  const value = useTokenValue(token);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-2)",
      }}
    >
      <div
        style={{
          width: "4.5rem",
          height: "4.5rem",
          background: "var(--navy-600)",
          border: "1px solid var(--alpha-hairline)",
          borderRadius: `var(${token})`,
        }}
      />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--ivory-100)",
          textAlign: "center",
        }}
      >
        {token}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--muted-400)",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

interface ShadowBoxProps {
  token: string;
}

function ShadowBox({ token }: ShadowBoxProps) {
  const value = useTokenValue(token);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <div
        style={{
          width: "8rem",
          height: "5rem",
          background: "var(--navy-700)",
          borderRadius: "var(--radius-md)",
          boxShadow: `var(${token})`,
        }}
      />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--ivory-100)",
        }}
      >
        {token}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--muted-400)",
          wordBreak: "break-all",
          maxWidth: "12rem",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

interface TypographySampleProps {
  family: string;
  familyToken: string;
  sampleText: string;
}

function TypographySample({ family, familyToken, sampleText }: TypographySampleProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        padding: "var(--space-4)",
        background: "var(--navy-700)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--alpha-hairline)",
      }}
    >
      <span
        style={{
          fontFamily: `var(${familyToken})`,
          fontSize: "var(--font-xl)",
          color: "var(--ivory-50)",
          lineHeight: 1.2,
        }}
      >
        {sampleText}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--muted-400)",
        }}
      >
        {familyToken} — {family}
      </span>
    </div>
  );
}

interface FontSizeRowProps {
  token: string;
  sampleText?: string;
}

function FontSizeRow({ token, sampleText = "The Analog Circle" }: FontSizeRowProps) {
  const value = useTokenValue(token);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "var(--space-4)",
        padding: "var(--space-2) 0",
        borderBottom: "1px solid var(--alpha-hairline-soft)",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--muted-400)",
          width: "10rem",
          flexShrink: 0,
        }}
      >
        {token}
        {value ? ` (${value})` : ""}
      </span>
      <span
        style={{
          fontFamily: "var(--family-body)",
          fontSize: `var(${token})`,
          color: "var(--ivory-100)",
          lineHeight: 1.3,
        }}
      >
        {sampleText}
      </span>
    </div>
  );
}

interface MotionRowProps {
  token: string;
}

function MotionRow({ token }: MotionRowProps) {
  const value = useTokenValue(token);
  const boxRef = useRef<HTMLDivElement>(null);

  function runDemo() {
    const el = boxRef.current;
    if (!el) return;
    el.style.transform = "translateX(120px)";
    el.style.transition = `transform var(${token}) var(--ease-lux)`;
    setTimeout(() => {
      el.style.transform = "translateX(0)";
    }, 500);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "var(--space-3) 0",
        cursor: "pointer",
      }}
      onClick={runDemo}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") runDemo();
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--ivory-100)",
          width: "9rem",
          flexShrink: 0,
        }}
      >
        {token}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-xs)",
          color: "var(--muted-400)",
          width: "5rem",
          flexShrink: 0,
        }}
      >
        {value || "—"}
      </span>
      <div
        ref={boxRef}
        style={{
          width: "2rem",
          height: "2rem",
          background: "var(--gold-500)",
          borderRadius: "var(--radius-sm)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--family-body)",
          fontSize: "var(--font-xs)",
          color: "var(--muted-400)",
        }}
      >
        click to demo
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section
      style={{
        marginBottom: "var(--space-7)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--family-display)",
          fontSize: "var(--font-lg)",
          color: "var(--gold-400)",
          fontWeight: "var(--weight-semi)" as React.CSSProperties["fontWeight"],
          margin: "0 0 var(--space-1) 0",
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          width: "3rem",
          height: "1px",
          background: "var(--alpha-hairline)",
          marginBottom: "var(--space-5)",
        }}
      />
      {children}
    </section>
  );
}

interface SubsectionProps {
  label: string;
  children: React.ReactNode;
}

function Subsection({ label, children }: SubsectionProps) {
  return (
    <div style={{ marginBottom: "var(--space-5)" }}>
      <h3
        style={{
          fontFamily: "var(--family-eyebrow)",
          fontSize: "var(--font-eyebrow)",
          color: "var(--muted-400)",
          fontWeight: "var(--weight-semi)" as React.CSSProperties["fontWeight"],
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          margin: "0 0 var(--space-3) 0",
        }}
      >
        {label}
      </h3>
      {children}
    </div>
  );
}

function SwatchGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-4)",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Token SSOT lists
// ---------------------------------------------------------------------------

const PRIMITIVE_COLOR_GROUPS: Array<{ group: string; tokens: string[] }> = [
  {
    group: "Navy / Surface",
    tokens: ["--navy-950", "--navy-900", "--navy-800", "--navy-700", "--navy-600"],
  },
  {
    group: "Gold / Accent",
    tokens: ["--gold-300", "--gold-400", "--gold-500", "--gold-600", "--gold-ink"],
  },
  {
    group: "Ivory / Text",
    tokens: ["--ivory-50", "--ivory-100", "--ivory-200", "--ivory-300"],
  },
  {
    group: "Muted / Neutral",
    tokens: ["--muted-400", "--muted-500"],
  },
  {
    group: "Status",
    tokens: [
      "--green-200",
      "--green-300",
      "--green-400",
      "--green-500",
      "--red-300",
      "--red-400",
      "--blue-400",
    ],
  },
  {
    group: "Sage (Interest)",
    tokens: ["--sage-500", "--sage-alpha", "--sage-border"],
  },
  {
    group: "Rose / Pink",
    tokens: ["--rose-300", "--rose-alpha", "--need-bg", "--need-ink", "--need-line"],
  },
  {
    group: "Indigo",
    tokens: ["--indigo-300", "--indigo-alpha"],
  },
  {
    group: "Sky",
    tokens: ["--sky-300", "--sky-alpha"],
  },
  {
    group: "Alpha / Glass",
    tokens: [
      "--alpha-glass",
      "--alpha-hairline",
      "--alpha-hairline-soft",
      "--alpha-gold-glow",
      "--alpha-accent-55",
      "--alpha-accent-45",
      "--alpha-accent-25",
      "--alpha-accent-22",
      "--alpha-accent-15",
      "--alpha-accent-08",
      "--alpha-ink-88",
      "--alpha-ink-78",
      "--alpha-ink-62",
      "--alpha-ink-48",
      "--alpha-ink-16",
      "--alpha-dark-25",
    ],
  },
  {
    group: "Soft Controls",
    tokens: ["--control-soft-bg", "--control-soft-ink", "--control-soft-line"],
  },
  {
    group: "Card Surfaces",
    tokens: ["--member-card-bg", "--food-card-bg", "--member-media-bg"],
  },
  {
    group: "WhatsApp",
    tokens: ["--whatsapp-alpha", "--whatsapp-border"],
  },
];

const SEMANTIC_COLOR_GROUPS: Array<{ group: string; tokens: string[] }> = [
  {
    group: "Surfaces",
    tokens: [
      "--color-bg",
      "--color-bg-deep",
      "--color-surface-card",
      "--color-surface-raised",
    ],
  },
  {
    group: "Text",
    tokens: [
      "--color-text-strong",
      "--color-text",
      "--color-text-soft",
      "--color-text-faint",
      "--color-text-muted",
      "--color-text-muted-2",
      "--color-text-heading",
    ],
  },
  {
    group: "Accent / Brand",
    tokens: [
      "--color-accent",
      "--color-accent-bright",
      "--color-accent-soft",
      "--color-on-accent",
      "--color-accent-glow",
      "--color-accent-line",
      "--color-accent-line-strong",
      "--color-accent-line-22",
      "--color-accent-line-15",
      "--color-accent-surface",
      "--color-accent-border",
    ],
  },
  {
    group: "Lines & Borders",
    tokens: ["--color-hairline", "--color-hairline-soft"],
  },
  {
    group: "Ink on Dark",
    tokens: [
      "--color-ink-strong",
      "--color-ink-muted",
      "--color-ink-faint",
      "--color-control-line",
      "--color-control-ink",
    ],
  },
  {
    group: "Status",
    tokens: [
      "--color-success",
      "--color-success-bright",
      "--color-success-soft",
      "--color-error",
      "--color-error-soft",
      "--color-info",
    ],
  },
  {
    group: "WhatsApp",
    tokens: [
      "--color-whatsapp",
      "--color-whatsapp-soft",
      "--color-whatsapp-border",
      "--color-whatsapp-ink",
    ],
  },
  {
    group: "Interest Chips (Sage)",
    tokens: [
      "--color-interest-bg",
      "--color-interest-border",
      "--color-interest-ink",
    ],
  },
  {
    group: "Icon Tile Tints",
    tokens: [
      "--color-tile-rose",
      "--color-tile-rose-ink",
      "--color-tile-indigo",
      "--color-tile-indigo-ink",
      "--color-tile-sky",
      "--color-tile-sky-ink",
    ],
  },
  {
    group: "Need-Rose Badge",
    tokens: ["--color-need-bg", "--color-need-ink", "--color-need-line"],
  },
  {
    group: "Soft Controls",
    tokens: [
      "--color-control-soft-bg",
      "--color-control-soft-ink",
      "--color-control-soft-line",
    ],
  },
  {
    group: "Navigation",
    tokens: [
      "--color-nav-inactive",
      "--color-nav-active",
      "--color-nav-bg",
      "--color-nav-border",
    ],
  },
  {
    group: "Cards",
    tokens: [
      "--color-member-card-bg",
      "--color-member-media-bg",
      "--color-food-card-bg",
      "--color-food-detail-ink",
    ],
  },
  {
    group: "Focus",
    tokens: ["--color-focus-ring"],
  },
  {
    group: "Input / Tab",
    tokens: ["--color-input-bg", "--color-tab-inactive"],
  },
];

const SPACING_TOKENS = [
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-7",
  "--space-8",
  "--space-9",
  "--space-control-sm",
  "--space-control",
];

const RADIUS_TOKENS = [
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-card-lg",
  "--radius-food",
  "--radius-pill",
  "--radius-full",
];

const SEMANTIC_RADIUS_TOKENS = [
  "--radius-control",
  "--radius-input",
  "--radius-card",
  "--radius-tile",
];

const FONT_FAMILY_TOKENS: Array<{ familyToken: string; family: string; sample: string }> = [
  {
    familyToken: "--family-display",
    family: "Playfair Display",
    sample: "The Analog Circle",
  },
  {
    familyToken: "--family-body",
    family: "DM Sans",
    sample: "Community gatherings",
  },
  {
    familyToken: "--family-eyebrow",
    family: "Crimson Pro",
    sample: "UPCOMING EVENTS",
  },
];

const FONT_SIZE_TOKENS = [
  "--font-tab",
  "--font-eyebrow",
  "--font-xs",
  "--font-input",
  "--font-sm",
  "--font-md",
  "--font-wordmark",
  "--font-lg",
  "--font-page-h2",
  "--font-xl",
  "--font-welcome-h2",
  "--font-2xl",
  "--font-3xl",
];

const FONT_WEIGHT_TOKENS = [
  { token: "--weight-regular", label: "Regular (400)" },
  { token: "--weight-medium", label: "Medium (500)" },
  { token: "--weight-semi", label: "Semi-bold (600)" },
  { token: "--weight-bold", label: "Bold (700)" },
];

const SHADOW_TOKENS = [
  "--shadow-soft",
  "--shadow-lift",
  "--shadow-card-inset",
];

const SEMANTIC_SHADOW_TOKENS = [
  "--elevation-card",
  "--elevation-raised",
];

const MOTION_TOKENS = ["--dur-quick", "--dur-fast"];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function TokensPage() {
  return (
    <div
      style={{
        padding: "var(--space-6)",
        background: "var(--color-bg)",
        minHeight: "100vh",
        fontFamily: "var(--family-body)",
      }}
    >
      <header style={{ marginBottom: "var(--space-7)" }}>
        <p
          style={{
            fontFamily: "var(--family-eyebrow)",
            fontSize: "var(--font-eyebrow)",
            color: "var(--color-accent)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            margin: "0 0 var(--space-2) 0",
          }}
        >
          Design System
        </p>
        <h1
          style={{
            fontFamily: "var(--family-display)",
            fontSize: "var(--font-2xl)",
            color: "var(--color-text-heading)",
            margin: "0 0 var(--space-3) 0",
            lineHeight: 1.1,
          }}
        >
          Token Reference
        </h1>
        <p
          style={{
            fontSize: "var(--font-sm)",
            color: "var(--color-text-muted)",
            margin: 0,
            maxWidth: "36rem",
          }}
        >
          Two-tier token system: <strong style={{ color: "var(--ivory-200)" }}>Primitives</strong> are
          raw, context-free values. <strong style={{ color: "var(--ivory-200)" }}>Semantic</strong> tokens
          alias primitives to UI intent. Components consume only semantic tokens.
        </p>
      </header>

      {/* ---- COLORS ---- */}
      <Section title="Colors">
        <Subsection label="Primitives">
          {PRIMITIVE_COLOR_GROUPS.map(({ group, tokens }) => (
            <div key={group} style={{ marginBottom: "var(--space-5)" }}>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "var(--font-xs)",
                  color: "var(--muted-400)",
                  margin: "0 0 var(--space-3) 0",
                }}
              >
                {group}
              </p>
              <SwatchGrid>
                {tokens.map((t) => (
                  <ColorSwatch key={t} token={t} />
                ))}
              </SwatchGrid>
            </div>
          ))}
        </Subsection>

        <Subsection label="Semantic">
          {SEMANTIC_COLOR_GROUPS.map(({ group, tokens }) => (
            <div key={group} style={{ marginBottom: "var(--space-5)" }}>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "var(--font-xs)",
                  color: "var(--muted-400)",
                  margin: "0 0 var(--space-3) 0",
                }}
              >
                {group}
              </p>
              <SwatchGrid>
                {tokens.map((t) => (
                  <ColorSwatch key={t} token={t} />
                ))}
              </SwatchGrid>
            </div>
          ))}
        </Subsection>
      </Section>

      {/* ---- SPACING ---- */}
      <Section title="Spacing">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {SPACING_TOKENS.map((t) => (
            <SpacingRow key={t} token={t} />
          ))}
        </div>
      </Section>

      {/* ---- RADII ---- */}
      <Section title="Radii">
        <Subsection label="Primitives">
          <SwatchGrid>
            {RADIUS_TOKENS.map((t) => (
              <RadiusBox key={t} token={t} />
            ))}
          </SwatchGrid>
        </Subsection>
        <Subsection label="Semantic">
          <SwatchGrid>
            {SEMANTIC_RADIUS_TOKENS.map((t) => (
              <RadiusBox key={t} token={t} />
            ))}
          </SwatchGrid>
        </Subsection>
      </Section>

      {/* ---- TYPOGRAPHY ---- */}
      <Section title="Typography">
        <Subsection label="Font Families">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {FONT_FAMILY_TOKENS.map(({ familyToken, family, sample }) => (
              <TypographySample
                key={familyToken}
                familyToken={familyToken}
                family={family}
                sampleText={sample}
              />
            ))}
          </div>
        </Subsection>

        <Subsection label="Size Scale">
          <div
            style={{
              padding: "var(--space-4)",
              background: "var(--navy-700)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--alpha-hairline)",
            }}
          >
            {FONT_SIZE_TOKENS.map((t) => (
              <FontSizeRow key={t} token={t} />
            ))}
          </div>
        </Subsection>

        <Subsection label="Weights">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)" }}>
            {FONT_WEIGHT_TOKENS.map(({ token, label }) => (
              <div key={token} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <span
                  style={{
                    fontFamily: "var(--family-body)",
                    fontSize: "var(--font-lg)",
                    fontWeight: `var(${token})` as React.CSSProperties["fontWeight"],
                    color: "var(--ivory-100)",
                  }}
                >
                  Aa
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "var(--font-xs)",
                    color: "var(--muted-400)",
                  }}
                >
                  {token}
                </span>
                <span
                  style={{
                    fontFamily: "var(--family-body)",
                    fontSize: "var(--font-xs)",
                    color: "var(--ivory-300)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Subsection>
      </Section>

      {/* ---- SHADOWS / ELEVATION ---- */}
      <Section title="Shadows &amp; Elevation">
        <Subsection label="Primitives">
          <SwatchGrid>
            {SHADOW_TOKENS.map((t) => (
              <ShadowBox key={t} token={t} />
            ))}
          </SwatchGrid>
        </Subsection>
        <Subsection label="Semantic">
          <SwatchGrid>
            {SEMANTIC_SHADOW_TOKENS.map((t) => (
              <ShadowBox key={t} token={t} />
            ))}
          </SwatchGrid>
        </Subsection>
      </Section>

      {/* ---- MOTION ---- */}
      <Section title="Motion">
        <p
          style={{
            fontSize: "var(--font-xs)",
            color: "var(--muted-400)",
            marginBottom: "var(--space-4)",
          }}
        >
          Ease function: <code>--ease-lux</code> (cubic-bezier 0.22, 1, 0.36, 1). Click a row to demo.
        </p>
        <div
          style={{
            padding: "var(--space-4)",
            background: "var(--navy-700)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--alpha-hairline)",
          }}
        >
          {MOTION_TOKENS.map((t) => (
            <MotionRow key={t} token={t} />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story exports
// ---------------------------------------------------------------------------

const meta = {
  title: "Design System/Tokens",
  component: TokensPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Visual reference for all primitive and semantic design tokens. Values resolve from live CSS custom properties — what you see is what the components get.",
      },
    },
  },
} satisfies Meta<typeof TokensPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {};
