import { describe, expect, it } from "vitest";
import { formatBirthday, formatEventWhen, formatMonthYear, formatShortMonthYear, fromIsoDate, startOfWeek, toIsoDate } from "./dates";

describe("dates", () => {
  it("round-trips local iso dates", () => {
    expect(toIsoDate(fromIsoDate("2026-10-03"))).toBe("2026-10-03");
  });

  it("finds Monday", () => {
    expect(toIsoDate(startOfWeek(new Date(2026, 8, 27)))).toBe("2026-09-21");
    expect(toIsoDate(startOfWeek(new Date(2026, 8, 21)))).toBe("2026-09-21");
  });

  it("formats event when", () => {
    expect(formatEventWhen({ date: "2026-10-10", startTime: "11:00", endTime: "13:30" })).toBe("Sat 10 Oct · 11:00–13:30");
    expect(formatEventWhen({ date: "2026-10-10", startTime: "11:00", endTime: null })).toBe("Sat 10 Oct · 11:00");
    expect(formatEventWhen({ date: null, startTime: null, endTime: null })).toBe("Date to be picked by the group");
  });

  it("formats months", () => {
    expect(formatMonthYear(new Date(2026, 9, 1))).toBe("October 2026");
    expect(formatShortMonthYear("2026-03-15T10:00:00Z")).toBe("Mar 2026");
  });

  it("formats a birthday as day and month, ignoring the year", () => {
    expect(formatBirthday("1987-03-14")).toBe("14 March");
  });
});
