import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import styles from "./Chip.module.css";

/** toggle = multi-select (tint + check); single = solid gold. */
export type ChipSelectStyle = "toggle" | "single";

interface ChipCommonProps {
  selected?: boolean;
  selectStyle?: ChipSelectStyle;
  /** Leading icon. Replaced by a check when a toggle chip is selected. */
  icon?: ReactNode;
  count?: number;
  children?: ReactNode;
  className?: string;
}

export interface ChipInteractiveProps
  extends ChipCommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ChipCommonProps> {
  static?: false;
}

export interface ChipStaticProps
  extends ChipCommonProps,
    Omit<HTMLAttributes<HTMLSpanElement>, keyof ChipCommonProps> {
  /** Display-only chip, no button semantics. */
  static: true;
}

export type ChipProps = ChipInteractiveProps | ChipStaticProps;

function ChipContent({ selected, selectStyle, icon, count, children }: ChipCommonProps) {
  const lead = selected && selectStyle === "toggle" ? <Check size={13} strokeWidth={2.5} /> : icon;
  return (
    <>
      {lead && (
        <span className={styles.icon} aria-hidden="true">
          {lead}
        </span>
      )}
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </>
  );
}

export function Chip(props: ChipProps) {
  const { selected = false, selectStyle = "toggle", icon, count, children, className } = props;
  const shared = {
    "data-selected": selected || undefined,
    "data-select-style": selectStyle,
    "data-has-lead": (selected && selectStyle === "toggle") || icon ? true : undefined,
    className: [styles.chip, className].filter(Boolean).join(" "),
  };
  const content = (
    <ChipContent selected={selected} selectStyle={selectStyle} icon={icon} count={count}>
      {children}
    </ChipContent>
  );

  if (props.static) {
    const { static: _s, selected: _a, selectStyle: _b, icon: _c, count: _d, children: _e, className: _f, ...rest } = props;
    return (
      <span {...rest} {...shared}>
        {content}
      </span>
    );
  }
  const { static: _s, selected: _a, selectStyle: _b, icon: _c, count: _d, children: _e, className: _f, ...rest } = props;
  return (
    <button type="button" aria-pressed={selected} {...rest} {...shared}>
      {content}
    </button>
  );
}
