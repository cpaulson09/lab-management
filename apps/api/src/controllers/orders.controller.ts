import {
  idSchema,
  orderCompleteSchema,
  orderCreateSchema,
  orderStatusSchema,
  paginationInputSchema,
} from "@lab/shared";
import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

const listInputSchema = paginationInputSchema.extend({
  patientId: idSchema.optional(),
  status: orderStatusSchema.optional(),
});

/** tRPC procedures for orders. Each one checks input and calls the service. */
export const ordersController = router({
  list: publicProcedure
    .input(listInputSchema)
    .query(({ ctx, input }) => ctx.services.orderService.list(input)),

  get: publicProcedure
    .input(z.object({ orderId: idSchema }))
    .query(({ ctx, input }) => ctx.services.orderService.get(input.orderId)),

  create: publicProcedure
    .input(orderCreateSchema)
    .mutation(({ ctx, input }) => ctx.services.orderService.create(input)),

  complete: publicProcedure
    .input(orderCompleteSchema)
    .mutation(({ ctx, input }) =>
      ctx.services.orderService.complete(input.orderId),
    ),
});
