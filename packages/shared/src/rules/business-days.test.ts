import { describe, expect, it } from "vitest";
import { addBusinessDays } from "./business-days";

describe("addBusinessDays", () => {
  it("counts from a weekday", () => {
    // Tue 2026-11-10 + 2 → Thu 2026-11-12
    expect(addBusinessDays("2026-11-10", 2)).toBe("2026-11-12");
  });

  it("skips the weekend from a Friday", () => {
    // Fri 2026-11-13 + 1 → Mon 2026-11-16
    expect(addBusinessDays("2026-11-13", 1)).toBe("2026-11-16");
  });

  it("starts on Monday from a Saturday", () => {
    expect(addBusinessDays("2026-11-14", 1)).toBe("2026-11-16");
  });

  it("starts on Monday from a Sunday", () => {
    expect(addBusinessDays("2026-11-15", 1)).toBe("2026-11-16");
  });

  it("crosses a month boundary", () => {
    // Fri 2026-11-27 + 3 → Mon 30, Tue 1, Wed 2
    expect(addBusinessDays("2026-11-27", 3)).toBe("2026-12-02");
  });

  it("uses the UTC day of an ISO time", () => {
    expect(addBusinessDays(new Date("2026-11-12T23:30:00Z"), 1)).toBe(
      "2026-11-13",
    );
    expect(addBusinessDays("2026-11-12T23:30:00-05:00", 1)).toBe("2026-11-16");
  });

  it("returns the same day for 0", () => {
    expect(addBusinessDays("2026-11-14", 0)).toBe("2026-11-14");
  });

  it("throws on a negative or fractional count", () => {
    expect(() => addBusinessDays("2026-11-12", -1)).toThrow();
    expect(() => addBusinessDays("2026-11-12", 1.5)).toThrow();
  });

  it("throws on an invalid date", () => {
    expect(() => addBusinessDays("not a date", 1)).toThrow("Invalid date");
  });
});
