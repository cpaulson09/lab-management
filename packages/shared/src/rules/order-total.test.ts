import { describe, expect, it } from "vitest";
import { orderTotal } from "./order-total";

describe("orderTotal", () => {
  it("returns the price of one item", () => {
    expect(orderTotal([{ price: 25 }])).toBe(25);
  });

  it("adds many items", () => {
    expect(orderTotal([{ price: 25 }, { price: 40.5 }, { price: 12.25 }])).toBe(
      77.75,
    );
  });

  it("rounds float noise", () => {
    expect(orderTotal([{ price: 0.1 }, { price: 0.2 }])).toBe(0.3);
  });

  it("throws on zero items", () => {
    expect(() => orderTotal([])).toThrow("at least one item");
  });
});
