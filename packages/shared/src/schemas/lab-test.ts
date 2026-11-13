import { z } from "zod";
import { idSchema, moneySchema } from "./common";

export const labTestSchema = z.object({
  labTestId: idSchema,
  code: z.string().min(1),
  name: z.string().min(1),
  price: moneySchema,
  turnaroundDays: z.number().int().min(1),
});
export type LabTest = z.infer<typeof labTestSchema>;

export const labTestCreateSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(20).toUpperCase(),
  name: z.string().trim().min(1, "Name is required").max(200),
  price: moneySchema,
  turnaroundDays: z
    .number()
    .int()
    .min(1, "Turnaround is at least 1 business day"),
});
export type LabTestCreate = z.infer<typeof labTestCreateSchema>;

export const labTestUpdateSchema = labTestCreateSchema.extend({
  labTestId: idSchema,
});
export type LabTestUpdate = z.infer<typeof labTestUpdateSchema>;
