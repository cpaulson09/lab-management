import {
  idSchema,
  paginationInputSchema,
  patientCreateSchema,
  patientUpdateSchema,
} from "@lab/shared";
import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

const patientListInputSchema = paginationInputSchema.extend({
  search: z.string().trim().max(100).optional(),
});

/** tRPC procedures for patients. Each one checks input and calls the service. */
export const patientsController = router({
  list: publicProcedure
    .input(patientListInputSchema)
    .query(({ ctx, input }) => ctx.services.patientService.list(input)),

  get: publicProcedure
    .input(z.object({ patientId: idSchema }))
    .query(({ ctx, input }) =>
      ctx.services.patientService.get(input.patientId),
    ),

  create: publicProcedure
    .input(patientCreateSchema)
    .mutation(({ ctx, input }) => ctx.services.patientService.create(input)),

  update: publicProcedure
    .input(patientUpdateSchema)
    .mutation(({ ctx, input }) => ctx.services.patientService.update(input)),
});
