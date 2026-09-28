import styles from "./Avatar.module.css";

export type AvatarSize = 20 | 22 | 24 | 26 | 28 | 30 | 36 | 42 | 44 | 46 | 92;
export type AvatarTone = 1 | 2 | 3 | 4;

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  /** Fill colour 1–4. Defaults to one derived from the name. */
  tone?: AvatarTone;
  className?: string;
  /** Set when the name is shown next to the avatar, so it isn't announced twice. */
  decorative?: boolean;
}

/** Stable 1–4 fill index for a name, so a member keeps one colour everywhere. */
export function avatarTone(name: string): AvatarTone {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 4) + 1) as AvatarTone;
}

export function Avatar({ src, name, size = 30, tone, className, decorative = false }: AvatarProps) {
  const cls = [styles.avatar, className].filter(Boolean).join(" ");
  if (src) {
    return (
      <span data-size={size} className={cls}>
        <img src={src} alt={decorative ? "" : name} className={styles.image} />
      </span>
    );
  }
  return (
    <span
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": name })}
      data-size={size} data-tone={tone ?? avatarTone(name)} className={cls}>
      <span aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</span>
    </span>
  );
}
