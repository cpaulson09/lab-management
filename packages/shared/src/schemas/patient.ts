import { z } from "zod";
import { idSchema, isoDateSchema, isoDateTimeSchema } from "./common";

export const patientSchema = z.object({
  patientId: idSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: isoDateSchema,
  phone: z.string().nullable(),
  email: z.email().nullable(),
  createdAt: isoDateTimeSchema,
});
export type Patient = z.infer<typeof patientSchema>;

/** The earliest date of birth we accept. */
export const MIN_DATE_OF_BIRTH = "1900-01-01";

/**
 * The latest date of birth we accept, as `YYYY-MM-DD`: today in the time zone
 * that is furthest ahead (UTC+14), so a baby born "today" is valid anywhere.
 */
export function latestDateOfBirth(now: Date = new Date()): string {
  return new Date(now.getTime() + 14 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

/** A real date of birth: `YYYY-MM-DD`, from 1900 up to today. */
export const dateOfBirthSchema = z.iso
  .date({ error: "Enter a date of birth" })
  .refine((date) => date >= MIN_DATE_OF_BIRTH, "Use a date in 1900 or later")
  .refine(
    (date) => date <= latestDateOfBirth(),
    "Date of birth cannot be in the future",
  );

export const patientCreateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "Use 100 characters or fewer"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Use 100 characters or fewer"),
  dateOfBirth: dateOfBirthSchema,
  phone: z.string().trim().max(30, "Use 30 characters or fewer").optional(),
  email: z.email().optional(),
});
export type PatientCreate = z.infer<typeof patientCreateSchema>;

export const patientUpdateSchema = patientCreateSchema.extend({
  patientId: idSchema,
});
export type PatientUpdate = z.infer<typeof patientUpdateSchema>;
