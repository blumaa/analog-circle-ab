import type { MouseEventHandler, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardBody } from "../Card/Card";
import styles from "./NavCard.module.css";

export interface NavCardProps {
  /** Leading icon (e.g. a lucide icon node). */
  icon: ReactNode;
  title: string;
  description?: string;
  /** Destination — rendered as an anchor. */
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * NavCard — a Card-composed navigation row: icon tile, title + description,
 * and a trailing chevron. Renders as an accessible anchor.
 */
export function NavCard({ icon, title, description, href, onClick }: NavCardProps) {
  return (
    <Card as="a" href={href} onClick={onClick} className={styles.navCard}>
      <CardBody className={styles.row}>
        <span className={styles.iconTile} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {description != null && (
            <span className={styles.description}>{description}</span>
          )}
        </span>
        <ChevronRight className={styles.chevron} aria-hidden="true" size={20} />
      </CardBody>
    </Card>
  );
}
