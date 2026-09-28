import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import styles from "./Button.module.css";

/**
 * primary = solid gold. secondary = chip fill. outline = transparent with border.
 * tint = gold tint (RSVP, "More details"). danger = red text on danger edge.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "tint" | "danger";
/** sm 32, md 38 (toolbar), lg 50 (CTA). */
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", leftIcon, fullWidth = false, type = "button", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {leftIcon && (
        <span className={styles.icon} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
    </button>
  );
});

interface ButtonLinkOwnProps<C extends ElementType> {
  /** Link component, e.g. react-router's Link. Defaults to <a>. */
  as?: C;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export type ButtonLinkProps<C extends ElementType = "a"> = ButtonLinkOwnProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof ButtonLinkOwnProps<C>>;

/** Navigation that looks like a Button. */
export function ButtonLink<C extends ElementType = "a">({
  as,
  variant = "primary",
  size = "md",
  leftIcon,
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonLinkProps<C>) {
  const Component: ElementType = as ?? "a";
  return (
    <Component
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {leftIcon && (
        <span className={styles.icon} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
    </Component>
  );
}
