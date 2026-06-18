import { ChevronRight, MessageCircle } from "lucide-react";
import { Card, CardBody } from "@analog/ui";
import styles from "./WhatsAppCard.module.css";

export function WhatsAppCard({ href }: { href: string }) {
  return (
    <Card
      as="a"
      variant="accent"
      href={href}
      target="_blank"
      rel="noreferrer"
      className={styles.link}
    >
      <CardBody className={styles.row}>
        <div className={styles.content}>
          <span className={styles.label}>
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp
          </span>
          <span className={styles.title}>Access your private WhatsApp group</span>
        </div>
        <ChevronRight className={styles.chevron} aria-hidden="true" />
      </CardBody>
    </Card>
  );
}
