import type { EventDetails } from "../data/types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date as "YYYY-MM-DD". */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parses "YYYY-MM-DD" as a local date (not UTC). */
export function fromIsoDate(iso: string): Date {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Monday 00:00 (local) of the week holding `now`. */
export function startOfWeek(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(d.getDate() + days);
  return next;
}

/** "Sat 10 Oct" */
export function formatDay(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** "Sat 10 Oct · 11:00–13:30", or "Date to be picked by the group". */
export function formatEventWhen(event: Pick<EventDetails, "date" | "startTime" | "endTime">): string {
  if (!event.date) return "Date to be picked by the group";
  const day = formatDay(fromIsoDate(event.date));
  if (!event.startTime) return day;
  return `${day} · ${event.startTime}${event.endTime ? `–${event.endTime}` : ""}`;
}

/** "October 2026" */
export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** "Mar 2026" */
export function formatShortMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/** "Mon 21 Sept – Sun 27 Sept" */
export function formatWeekRange(from: Date, to: Date): string {
  const f = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return `${f(from)} – ${f(to)}`;
}

/** "14 March". Birthday years may be placeholders, so they're never shown. */
export function formatBirthday(iso: string): string {
  return fromIsoDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}
