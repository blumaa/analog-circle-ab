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
          border: "1px solid var(--color-border)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--family-body)",
          fontSize: "var(--font-12)",
          color: "var(--color-text)",
          wordBreak: "break-all",
        }}
      >
        {nameLabel}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-muted-2)",
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
          fontSize: "var(--font-12)",
          color: "var(--color-text)",
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
          background: "var(--color-accent)",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-muted-2)",
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
          background: "var(--color-chip)",
          border: "1px solid var(--color-border)",
          borderRadius: `var(${token})`,
        }}
      />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-text)",
          textAlign: "center",
        }}
      >
        {token}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-muted-2)",
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
          background: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          boxShadow: `var(${token})`,
        }}
      />
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-text)",
        }}
      >
        {token}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-muted-2)",
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
        background: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          fontFamily: `var(${familyToken})`,
          fontSize: "var(--font-24)",
          color: "var(--color-text)",
          lineHeight: 1.2,
        }}
      >
        {sampleText}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-muted-2)",
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
        borderBottom: "1px solid var(--color-border-shell)",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-muted-2)",
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
          color: "var(--color-text)",
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
    el.style.transition = `transform var(${token}) var(--motion-ease)`;
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
          fontSize: "var(--font-12)",
          color: "var(--color-text)",
          width: "9rem",
          flexShrink: 0,
        }}
      >
        {token}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "var(--font-12)",
          color: "var(--color-muted-2)",
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
          background: "var(--color-accent)",
          borderRadius: "var(--radius-sm)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--family-body)",
          fontSize: "var(--font-12)",
          color: "var(--color-muted-2)",
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
          fontSize: "var(--font-18)",
          color: "var(--color-accent-text)",
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
          background: "var(--color-border)",
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
          fontFamily: "var(--text-eyebrow-family)",
          fontSize: "var(--text-eyebrow-size)",
          color: "var(--color-muted-2)",
          fontWeight: "var(--weight-semi)" as React.CSSProperties["fontWeight"],
          textTransform: "uppercase",
          letterSpacing: "var(--text-eyebrow-tracking)",
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
    group: "Ink",
    tokens: [
      "--ink-950", "--ink-900", "--ink-850", "--ink-800", "--ink-750", "--ink-700", "--ink-650",
      "--ink-600", "--ink-550", "--ink-500", "--ink-450", "--ink-400", "--ink-350",
    ],
  },
  {
    group: "Mist",
    tokens: [
      "--mist-50", "--mist-100", "--mist-200", "--mist-250", "--mist-300", "--mist-400",
      "--mist-500", "--mist-600",
    ],
  },
  {
    group: "Gold",
    tokens: [
      "--gold-300", "--gold-400", "--gold-500", "--gold-550", "--gold-700", "--gold-750",
      "--gold-800", "--gold-850", "--gold-900",
    ],
  },
  {
    group: "Status",
    tokens: ["--green-300", "--green-700", "--green-850", "--pink-300", "--red-300", "--rose-800"],
  },
  {
    group: "Avatar",
    tokens: ["--avatar-gold", "--avatar-green", "--avatar-lilac", "--avatar-peach"],
  },
  { group: "Misc", tokens: ["--rust-600", "--scrim-68"] },
];

const SEMANTIC_COLOR_GROUPS: Array<{ group: string; tokens: string[] }> = [
  {
    group: "Surfaces",
    tokens: [
      "--color-bg", "--color-bg-deep", "--color-bg-shell", "--color-sheet", "--color-surface",
      "--color-surface-2", "--color-chip", "--color-segmented", "--color-track-off-sheet",
      "--color-overlay",
    ],
  },
  {
    group: "Lines",
    tokens: ["--color-border", "--color-border-2", "--color-border-shell", "--color-handle"],
  },
  {
    group: "Gold",
    tokens: [
      "--color-accent", "--color-accent-text", "--color-accent-bright", "--color-wordmark",
      "--color-accent-tint", "--color-accent-tint-strong", "--color-accent-edge",
      "--color-tag-edge", "--color-accent-card-edge", "--color-on-accent",
    ],
  },
  {
    group: "Text",
    tokens: [
      "--color-text", "--color-text-2", "--color-text-3", "--color-muted", "--color-muted-2",
      "--color-placeholder", "--color-radio-off", "--color-knob-off",
    ],
  },
  {
    group: "Status",
    tokens: [
      "--color-success", "--color-success-track", "--color-success-edge", "--color-birthday",
      "--color-birthday-edge", "--color-danger", "--color-danger-edge", "--color-logo",
      "--color-focus-ring",
    ],
  },
  {
    group: "Avatar",
    tokens: [
      "--color-avatar-1", "--color-avatar-2", "--color-avatar-3", "--color-avatar-4",
      "--color-on-avatar",
    ],
  },
];

const SPACING_TOKENS = [
  "--space-1", "--space-1-5", "--space-2", "--space-2-5", "--space-3", "--space-3-5",
  "--space-4", "--space-4-5", "--space-5", "--space-6", "--space-7", "--space-8", "--space-9",
];

const RADIUS_TOKENS = [
  "--radius-sm", "--radius-seg", "--radius-md", "--radius-lg", "--radius-xl", "--radius-2xl",
  "--radius-3xl", "--radius-pill",
];

const SEMANTIC_RADIUS_TOKENS = [
  "--radius-card", "--radius-card-hero", "--radius-list", "--radius-input", "--radius-segment",
  "--radius-sheet", "--radius-control",
];

const FONT_FAMILY_TOKENS: Array<{ familyToken: string; family: string; sample: string }> = [
  { familyToken: "--family-display", family: "Playfair Display", sample: "The Analog Circle" },
  { familyToken: "--family-body", family: "DM Sans", sample: "Community gatherings" },
];

const FONT_SIZE_TOKENS = [
  "--font-10", "--font-11", "--font-12", "--font-13", "--font-14", "--font-15", "--font-16",
  "--font-17", "--font-18", "--font-22", "--font-24", "--font-26", "--font-28",
];

const FONT_WEIGHT_TOKENS = [
  { token: "--weight-regular", label: "Regular (400)" },
  { token: "--weight-medium", label: "Medium (500)" },
  { token: "--weight-semi", label: "Semi-bold (600)" },
  { token: "--weight-bold", label: "Bold (700)" },
];

const SHADOW_TOKENS = ["--glow-gold"];

const SEMANTIC_SHADOW_TOKENS = ["--elevation-fab"];

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
            fontFamily: "var(--text-eyebrow-family)",
            fontSize: "var(--text-eyebrow-size)",
            color: "var(--color-accent)",
            textTransform: "uppercase",
            letterSpacing: "var(--text-eyebrow-tracking)",
            margin: "0 0 var(--space-2) 0",
          }}
        >
          Design System
        </p>
        <h1
          style={{
            fontFamily: "var(--family-display)",
            fontSize: "var(--font-28)",
            color: "var(--color-text)",
            margin: "0 0 var(--space-3) 0",
            lineHeight: 1.1,
          }}
        >
          Token Reference
        </h1>
        <p
          style={{
            fontSize: "var(--font-14)",
            color: "var(--color-muted)",
            margin: 0,
            maxWidth: "36rem",
          }}
        >
          Two-tier token system: <strong style={{ color: "var(--color-text-2)" }}>Primitives</strong> are
          raw, context-free values. <strong style={{ color: "var(--color-text-2)" }}>Semantic</strong> tokens
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
                  fontSize: "var(--font-12)",
                  color: "var(--color-muted-2)",
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
                  fontSize: "var(--font-12)",
                  color: "var(--color-muted-2)",
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
              background: "var(--color-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
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
                    fontSize: "var(--font-18)",
                    fontWeight: `var(${token})` as React.CSSProperties["fontWeight"],
                    color: "var(--color-text)",
                  }}
                >
                  Aa
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "var(--font-12)",
                    color: "var(--color-muted-2)",
                  }}
                >
                  {token}
                </span>
                <span
                  style={{
                    fontFamily: "var(--family-body)",
                    fontSize: "var(--font-12)",
                    color: "var(--color-text-3)",
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
            fontSize: "var(--font-12)",
            color: "var(--color-muted-2)",
            marginBottom: "var(--space-4)",
          }}
        >
          Ease function: <code>--ease-lux</code> (cubic-bezier 0.22, 1, 0.36, 1). Click a row to demo.
        </p>
        <div
          style={{
            padding: "var(--space-4)",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
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
