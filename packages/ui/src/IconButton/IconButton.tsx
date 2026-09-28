import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import styles from "./IconButton.module.css";

export type IconButtonVariant = "chip" | "tint" | "ghost" | "danger" | "gold";
export type IconButtonSize = 22 | 26 | 28 | 30 | 32 | 36 | 38 | 40;
export type IconButtonShape = "round" | "square";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible name. */
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  /** Set for toggle buttons (bookmark, favourite). */
  pressed?: boolean;
}

export function IconButton({
  label,
  icon,
  variant = "chip",
  size = 30,
  shape = "round",
  pressed,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-pressed={pressed || undefined}
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}

interface IconLinkOwnProps<C extends ElementType> {
  /** Link component, e.g. react-router's Link. Defaults to <a>. */
  as?: C;
  /** Accessible name. */
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
}

export type IconLinkProps<C extends ElementType = "a"> = IconLinkOwnProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof IconLinkOwnProps<C> | "children">;

/** An IconButton look for navigation (routes, mailto:, tel:, external pages). */
export function IconLink<C extends ElementType = "a">({
  as,
  label,
  icon,
  variant = "chip",
  size = 30,
  shape = "round",
  className,
  ...rest
}: IconLinkProps<C>) {
  const Component: ElementType = as ?? "a";
  return (
    <Component
      aria-label={label}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </Component>
  );
}
