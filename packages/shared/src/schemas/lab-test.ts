import { z } from "zod";
import { idSchema, moneySchema } from "./common";

/**
 * The longest turnaround a lab test can have (about 1.5 years of business
 * days). Without a limit, a huge number makes the ready date math run for
 * minutes and blocks the API.
 */
export const MAX_TURNAROUND_DAYS = 365;

export const labTestSchema = z.object({
  labTestId: idSchema,
  code: z.string().min(1),
  name: z.string().min(1),
  price: moneySchema,
  turnaroundDays: z.number().int().min(1).max(MAX_TURNAROUND_DAYS),
});
export type LabTest = z.infer<typeof labTestSchema>;

export const labTestCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20, "Use 20 characters or fewer")
    .toUpperCase(),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(200, "Use 200 characters or fewer"),
  price: moneySchema,
  turnaroundDays: z
    .number()
    .int()
    .min(1, "Turnaround is at least 1 business day")
    .max(
      MAX_TURNAROUND_DAYS,
      `Turnaround is at most ${MAX_TURNAROUND_DAYS} business days`,
    ),
});
export type LabTestCreate = z.infer<typeof labTestCreateSchema>;

export const labTestUpdateSchema = labTestCreateSchema.extend({
  labTestId: idSchema,
});
export type LabTestUpdate = z.infer<typeof labTestUpdateSchema>;
