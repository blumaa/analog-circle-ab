import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./Chip.module.css";

export type ChipTone = "rose";

interface ChipCommonProps {
  selected?: boolean;
  count?: number;
  /** Optional tone override. Currently supports "rose" (Need/Offer badge style). */
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
}

export interface ChipInteractiveProps
  extends ChipCommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ChipCommonProps> {
  /** When true the chip renders as a non-interactive <span>. Defaults to false. */
  static?: false;
}

export interface ChipStaticProps
  extends ChipCommonProps,
    Omit<HTMLAttributes<HTMLSpanElement>, keyof ChipCommonProps> {
  /** Render a display-only chip (no button role, no interactive semantics). */
  static: true;
}

export type ChipProps = ChipInteractiveProps | ChipStaticProps;

export function Chip(props: ChipProps) {
  if (props.static) {
    return <StaticChip {...props} />;
  }
  return <InteractiveChip {...props} />;
}

function StaticChip({
  selected = false,
  count,
  tone,
  className,
  children,
  static: _ignored,
  ...rest
}: ChipStaticProps) {
  const cls = [styles.chip, className].filter(Boolean).join(" ");
  return (
    <span
      data-selected={selected || undefined}
      data-tone={tone}
      className={cls}
      {...rest}
    >
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </span>
  );
}

function InteractiveChip({
  selected = false,
  count,
  tone,
  className,
  children,
  static: _ignored,
  ...rest
}: ChipInteractiveProps) {
  const cls = [styles.chip, className].filter(Boolean).join(" ");
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-selected={selected || undefined}
      data-tone={tone}
      className={cls}
      {...rest}
    >
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}
