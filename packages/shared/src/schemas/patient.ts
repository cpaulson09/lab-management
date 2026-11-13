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

export const patientCreateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  dateOfBirth: isoDateSchema,
  phone: z.string().trim().max(30).optional(),
  email: z.email().optional(),
});
export type PatientCreate = z.infer<typeof patientCreateSchema>;

export const patientUpdateSchema = patientCreateSchema.extend({
  patientId: idSchema,
});
export type PatientUpdate = z.infer<typeof patientUpdateSchema>;
