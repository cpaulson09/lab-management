import { describe, expect, it } from "vitest";
import { estimateReadyDate } from "./ready-date";

describe("estimateReadyDate", () => {
  it("uses the longest turnaround (placed Thursday)", () => {
    const items = [{ turnaroundDays: 1 }, { turnaroundDays: 3 }];
    expect(estimateReadyDate("2026-11-12T10:00:00Z", items)).toBe("2026-11-17");
  });

  it("starts counting on Monday when placed on Saturday", () => {
    const items = [{ turnaroundDays: 1 }, { turnaroundDays: 3 }];
    expect(estimateReadyDate("2026-11-14T10:00:00Z", items)).toBe("2026-11-18");
  });

  it("throws on zero items", () => {
    expect(() => estimateReadyDate("2026-11-12T10:00:00Z", [])).toThrow(
      "at least one item",
    );
  });
});
