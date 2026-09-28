import type { Member } from "../data/types";

export type ContactKind = "whatsapp" | "phone" | "email" | "social";

export interface Contact {
  kind: ContactKind;
  label: string;
  href: string;
  /** Human-readable value for profile rows. */
  value: string;
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** The member's contact channels in display order, skipping ones they haven't set. */
export function memberContacts(member: Member): Contact[] {
  const contacts: Contact[] = [];
  if (member.whatsappUrl) {
    contacts.push({ kind: "whatsapp", label: "WhatsApp", href: member.whatsappUrl, value: member.phone ?? "Message" });
  }
  if (member.phone) {
    contacts.push({ kind: "phone", label: "Phone", href: `tel:${member.phone.replace(/\s+/g, "")}`, value: member.phone });
  }
  contacts.push({ kind: "email", label: "Email", href: `mailto:${member.email}`, value: member.email });
  if (member.social) {
    contacts.push({ kind: "social", label: "Social", href: member.social, value: stripProtocol(member.social) });
  }
  return contacts;
}

const DOT = "•";

/** Keeps the first three characters (the country code) and the last two digits. */
function maskPhone(value: string): string {
  const total = value.replace(/\D/g, "").length;
  let seen = 0;
  return value.replace(/\d/g, (digit, offset: number) => {
    seen += 1;
    return offset < 3 || seen > total - 2 ? digit : DOT;
  });
}

/** Keeps the first two letters and the domain. A fixed mask length hides the name's length. */
function maskEmail(value: string): string {
  const at = value.indexOf("@");
  return at < 0 ? value : `${value.slice(0, 2)}${DOT.repeat(3)}${value.slice(at)}`;
}

/** The display value with private details hidden, shown until the viewer taps to reveal. */
export function maskContact({ kind, value }: Pick<Contact, "kind" | "value">): string {
  if (kind === "email") return maskEmail(value);
  if (kind === "phone" || kind === "whatsapp") return maskPhone(value);
  return value;
}
