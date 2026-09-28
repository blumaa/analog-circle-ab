import type { ReactNode } from "react";
import styles from "./Eyebrow.module.css";

export interface EyebrowProps {
  /** "legend" titles a fieldset, e.g. "PUBLISH TO". */
  as?: "h2" | "h3" | "p" | "span" | "legend";
  /** muted = Playfair section label; gold = DM Sans page kicker. */
  tone?: "muted" | "gold";
  size?: 10 | 11;
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Uppercase label: "BIO", "PUBLISH TO", "ADMIN". */
export function Eyebrow({ as: Tag = "h2", tone = "muted", size = 11, id, className, children }: EyebrowProps) {
  return (
    <Tag id={id} data-tone={tone} data-size={size} className={[styles.eyebrow, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
