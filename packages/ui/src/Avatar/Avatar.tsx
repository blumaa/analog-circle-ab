import type { CSSProperties } from "react";
import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "rounded";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  /**
   * 'circle' (default) — fixed circular avatar with a gold ring.
   * 'rounded' — rectangular portrait that fills its container width with
   * --radius-card corners (size variants are ignored for this shape).
   */
  shape?: AvatarShape;
  /** Aspect ratio for the 'rounded' portrait, e.g. "1 / 1" or "3 / 4". */
  aspect?: string;
  className?: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  shape = "circle",
  aspect = "1 / 1",
  className,
}: AvatarProps) {
  const hasSrc = src != null && src !== "";
  const style: CSSProperties | undefined =
    shape === "rounded" ? { aspectRatio: aspect } : undefined;

  return (
    <div
      data-size={size}
      data-shape={shape}
      style={style}
      className={[styles.avatar, className].filter(Boolean).join(" ")}
    >
      {hasSrc ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <span role="img" aria-label={name} className={styles.initials}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
