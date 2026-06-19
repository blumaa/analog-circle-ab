import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "success" | "danger" | "whatsapp" | "soft";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
  /**
   * When true (default) the button uses the 999px pill radius.
   * Pass false to use var(--radius-md) (~12px) — e.g. the sign-out button.
   */
  pill?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    leftIcon,
    iconOnly = false,
    fullWidth = false,
    pill = true,
    type = "button",
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-icon-only={iconOnly || undefined}
      data-pill={pill ? undefined : "false"}
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {iconOnly ? (
        <span className={styles.icon} aria-hidden="true">
          {children}
        </span>
      ) : (
        <>
          {leftIcon && (
            <span className={styles.icon} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {children}
        </>
      )}
    </button>
  );
});
