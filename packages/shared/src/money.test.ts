import { describe, expect, it } from "vitest";
import { roundMoney } from "./money";

describe("roundMoney", () => {
  it("rounds float noise to 2 places", () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });

  it("rounds half up", () => {
    expect(roundMoney(1.005)).toBe(1.01);
  });
});
