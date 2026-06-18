/** "2026-07-04" + times -> "Sat 4 July · 16:00-19:00" */
export function formatEventWhen(dateIso: string, start: string, end: string): string {
  const d = new Date(`${dateIso}T00:00:00`);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  return `${weekday} ${day} ${month} · ${start}-${end}`;
}

/** "2026-07-04" -> "July 2026" */
export function formatMonthYear(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00`);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
