import { Label } from "../Label/Label";
import styles from "./Header.module.css";

export interface HeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
}

/** Page intro block: uppercase eyebrow + display title + supporting description. */
export function Header({ title, eyebrow, description }: HeaderProps) {
  return (
    <header className={styles.header}>
      {eyebrow && <Label>{eyebrow}</Label>}
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
