import { Avatar, type AvatarSize } from "../Avatar/Avatar";
import styles from "./AvatarStack.module.css";

export interface AvatarStackPerson {
  name: string;
  src?: string | null;
}

export interface AvatarStackProps {
  people: AvatarStackPerson[];
  size?: 22 | 30;
  /** Show at most this many; the rest become a "+n" chip. */
  max?: number;
  label?: string;
  className?: string;
}

/** Overlapping avatars with a ring matching the surface behind them. */
export function AvatarStack({ people, size = 22, max = 5, label, className }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div role="group" aria-label={label} data-size={size} className={[styles.stack, className].filter(Boolean).join(" ")}>
      {shown.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} name={p.name} src={p.src} size={size as AvatarSize} className={styles.item} />
      ))}
      {extra > 0 && <span className={[styles.item, styles.more].join(" ")}>+{extra}</span>}
    </div>
  );
}
