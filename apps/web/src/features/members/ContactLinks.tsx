import type { ReactNode } from "react";
import { AtSign, Mail, MessageCircle, Phone } from "lucide-react";
import { IconLink } from "@analog/ui";
import type { ContactKind, Contact } from "../../lib/contacts";
import styles from "./ContactLinks.module.css";

export const CONTACT_ICON: Record<ContactKind, (size: number) => ReactNode> = {
  whatsapp: (size) => <MessageCircle size={size} strokeWidth={1.75} />,
  phone: (size) => <Phone size={size} strokeWidth={1.75} />,
  email: (size) => <Mail size={size} strokeWidth={1.75} />,
  social: (size) => <AtSign size={size} strokeWidth={1.75} />,
};

const external = (href: string) => /^https?:/.test(href);

export interface ContactLinksProps {
  contacts: Contact[];
  /** Appended to each label: "Email Ada B.". */
  name: string;
}

/** Round 30px contact buttons. External pages open in a new tab. */
export function ContactLinks({ contacts, name }: ContactLinksProps) {
  return (
    <div className={styles.links}>
      {contacts.map((c) => (
        <IconLink
          key={c.kind}
          label={`${c.label} ${name}`}
          href={c.href}
          icon={CONTACT_ICON[c.kind](14)}
          size={30}
          {...(external(c.href) ? { target: "_blank", rel: "noreferrer" } : {})}
        />
      ))}
    </div>
  );
}
