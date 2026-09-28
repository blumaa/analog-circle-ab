import type { Member, Post } from "../data/types";
import { firstName } from "./names";

/** Deterministic id so generation is idempotent across clients. */
export function birthdayPostId(memberId: string, year: number): string {
  return `birthday-${memberId}-${year}`;
}

function isBirthdayToday(birthday: string, today: Date): boolean {
  const [, month, day] = birthday.split("-").map(Number);
  return month === today.getMonth() + 1 && day === today.getDate();
}

/** Member docs written before the opt-in existed lack the field; they count as opted in. */
export function wantsBirthdayPost(member: Member): boolean {
  return member.birthdayPost !== false;
}

/** Automated birthday posts due today that don't exist yet. */
export function birthdayPostsDue(members: Member[], existingPostIds: Set<string>, today: Date): Post[] {
  const year = today.getFullYear();
  const startOfDay = new Date(year, today.getMonth(), today.getDate()).toISOString();
  return members
    .filter((m) => m.birthday && isBirthdayToday(m.birthday, today))
    .filter((m) => wantsBirthdayPost(m) && !existingPostIds.has(birthdayPostId(m.id, year)))
    .map((m) => ({
      id: birthdayPostId(m.id, year),
      type: "birthday",
      title: `HBD ${firstName(m.name)}!`,
      body: "",
      imageUrl: null,
      authorId: m.id,
      publishedTo: ["square"],
      createdAt: startOfDay,
      updatedAt: null,
      pinned: false,
      reactions: {},
      commentCount: 0,
      event: null,
      celebrantId: m.id,
    }));
}
