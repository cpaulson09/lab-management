import { z } from "zod";
import {
  idSchema,
  isoDateSchema,
  isoDateTimeSchema,
  moneySchema,
} from "./common";

export const ORDER_STATUSES = ["Pending", "Completed"] as const;
export const orderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderItemSchema = z.object({
  orderItemId: idSchema,
  orderId: idSchema,
  labTestId: idSchema,
  /** Copied from the catalog when the order is placed. */
  price: moneySchema,
  /** Copied from the catalog when the order is placed. */
  turnaroundDays: z.number().int().min(1),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  orderId: idSchema,
  patientId: idSchema,
  status: orderStatusSchema,
  placedAt: isoDateTimeSchema,
  readyDate: isoDateSchema,
  total: moneySchema,
  completedAt: isoDateTimeSchema.nullable(),
});
export type Order = z.infer<typeof orderSchema>;

export const orderCreateSchema = z.object({
  patientId: idSchema,
  labTestIds: z
    .array(idSchema)
    .min(1, "Pick at least one test")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "A test can be in an order only once",
    ),
});
export type OrderCreate = z.infer<typeof orderCreateSchema>;

export const orderCompleteSchema = z.object({
  orderId: idSchema,
});
export type OrderComplete = z.infer<typeof orderCompleteSchema>;
