import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import styles from "./ListGroup.module.css";

export interface ListGroupProps {
  "aria-label"?: string;
  className?: string;
  children: ReactNode;
}

/** Card of divided rows. Children are ListRow. */
export function ListGroup({ className, children, ...rest }: ListGroupProps) {
  return (
    <ul className={[styles.group, className].filter(Boolean).join(" ")} aria-label={rest["aria-label"]}>
      {children}
    </ul>
  );
}

export interface ListRowProps {
  label: ReactNode;
  /** Icon shown in a 32px gold tile. */
  icon?: ReactNode;
  /** Right-aligned value text, e.g. a count. */
  value?: ReactNode;
  /** Custom right-side control, e.g. a Toggle. Replaces the chevron. */
  trailing?: ReactNode;
  onClick?: () => void;
  /** Makes the row a link (mailto:, tel:, external pages). */
  href?: string;
  /** Opens href in a new tab. */
  external?: boolean;
  /** tile = 32px gold tile (menus); plain = bare gold icon (contact rows). */
  iconStyle?: "tile" | "plain";
  /** Show the chevron. Defaults to true when the row is clickable. */
  chevron?: boolean;
  highlighted?: boolean;
  className?: string;
}

export function ListRow({
  label,
  icon,
  value,
  trailing,
  onClick,
  href,
  external,
  iconStyle = "tile",
  chevron,
  highlighted,
  className,
}: ListRowProps) {
  const showChevron = !trailing && (chevron ?? Boolean(onClick));
  const body = (
    <>
      {icon && (
        <span className={styles.tile} data-icon-style={iconStyle} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{label}</span>
      {value !== undefined && <span className={styles.value}>{value}</span>}
      {trailing}
      {showChevron && <ChevronRight size={18} aria-hidden="true" className={styles.chevron} />}
    </>
  );
  return (
    <li className={[styles.item, className].filter(Boolean).join(" ")} data-highlighted={highlighted || undefined}>
      {href ? (
        <a className={styles.row} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {body}
        </a>
      ) : onClick ? (
        <button type="button" className={styles.row} onClick={onClick}>
          {body}
        </button>
      ) : (
        <div className={styles.row}>{body}</div>
      )}
    </li>
  );
}
