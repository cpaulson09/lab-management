import type { OrderStatus } from "../schemas/order";

export class OrderAlreadyCompletedError extends Error {
  constructor(orderId: number) {
    super(`Order #${orderId} is already completed`);
    this.name = "OrderAlreadyCompletedError";
  }
}

/** Marks a Pending order as Completed. Completed is final: a second call throws. */
export function completeOrder<
  T extends {
    orderId: number;
    status: OrderStatus;
    completedAt: string | null;
  },
>(order: T, now: Date = new Date()): T {
  if (order.status === "Completed") {
    throw new OrderAlreadyCompletedError(order.orderId);
  }
  return { ...order, status: "Completed", completedAt: now.toISOString() };
}
