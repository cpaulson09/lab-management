import {
  idSchema,
  labTestCreateSchema,
  labTestUpdateSchema,
  paginationInputSchema,
} from "@lab/shared";
import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

const listInputSchema = paginationInputSchema.extend({
  search: z.string().trim().max(200).optional(),
});

/** tRPC procedures for lab tests. Each one checks input and calls the service. */
export const labTestsController = router({
  list: publicProcedure
    .input(listInputSchema)
    .query(({ ctx, input }) => ctx.services.labTestService.list(input)),

  get: publicProcedure
    .input(z.object({ labTestId: idSchema }))
    .query(({ ctx, input }) =>
      ctx.services.labTestService.get(input.labTestId),
    ),

  create: publicProcedure
    .input(labTestCreateSchema)
    .mutation(({ ctx, input }) => ctx.services.labTestService.create(input)),

  update: publicProcedure
    .input(labTestUpdateSchema)
    .mutation(({ ctx, input }) => ctx.services.labTestService.update(input)),
});
