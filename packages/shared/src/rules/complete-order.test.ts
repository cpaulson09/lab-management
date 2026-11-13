import { describe, expect, it } from "vitest";
import type { Order } from "../schemas/order";
import { completeOrder, OrderAlreadyCompletedError } from "./complete-order";

const pending: Order = {
  orderId: 1048,
  patientId: 1,
  status: "Pending",
  placedAt: "2026-11-12T10:00:00.000Z",
  readyDate: "2026-11-17",
  total: 65,
  completedAt: null,
};

describe("completeOrder", () => {
  it("marks a pending order completed", () => {
    const now = new Date("2026-11-17T09:30:00.000Z");
    const done = completeOrder(pending, now);
    expect(done).toEqual({
      ...pending,
      status: "Completed",
      completedAt: "2026-11-17T09:30:00.000Z",
    });
    expect(pending.status).toBe("Pending");
  });

  it("throws if the order is already completed", () => {
    const done = completeOrder(pending);
    expect(() => completeOrder(done)).toThrow(OrderAlreadyCompletedError);
    expect(() => completeOrder(done)).toThrow(
      "Order #1048 is already completed",
    );
  });
});
