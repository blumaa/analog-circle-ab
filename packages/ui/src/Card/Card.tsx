import {
  Children,
  isValidElement,
  type AnchorHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Card.module.css";

export type CardVariant = "default" | "active" | "accent";

export interface CardProps
  extends HTMLAttributes<HTMLElement>,
    Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> {
  variant?: CardVariant;
  /** Render the container as a different element/component (e.g. "a"). */
  as?: ElementType;
  children: ReactNode;
}

/**
 * Card container. Compose with `CardHeader`, `CardBody`, and `CardFooter`
 * (also reachable as `Card.Header` / `Card.Body` / `Card.Footer`) for
 * structured layouts. Plain children that are not section subcomponents are
 * rendered inside default body padding for backward compatibility.
 */
export function Card({ variant = "default", as, className, children, ...rest }: CardProps) {
  const Component: ElementType = as ?? "div";

  // Backward compat: if no child is a Card section, wrap everything in a
  // default-padded body so legacy `<Card>...</Card>` consumers keep their look.
  const usesSections = Children.toArray(children).some(
    (child) =>
      isValidElement(child) &&
      (child.type === CardHeader ||
        child.type === CardBody ||
        child.type === CardFooter),
  );

  return (
    <Component
      data-variant={variant}
      className={[styles.card, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {usesSections ? children : <CardBody>{children}</CardBody>}
    </Component>
  );
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardBodyProps extends CardSectionProps {
  /** "none" removes the default section padding; useful when an inner component supplies its own. */
  padding?: "default" | "none";
}

/** Top section with a bottom hairline divider. */
export function CardHeader({ className, children, ...rest }: CardSectionProps) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

/** Main content section with default padding. */
export function CardBody({ className, children, padding = "default", ...rest }: CardBodyProps) {
  return (
    <div
      className={[styles.body, className].filter(Boolean).join(" ")}
      data-padding={padding !== "default" ? padding : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Bottom section with a top hairline divider. */
export function CardFooter({ className, children, ...rest }: CardSectionProps) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
