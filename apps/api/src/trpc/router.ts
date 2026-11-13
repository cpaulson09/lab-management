import { labTestsController } from "../controllers/lab-tests.controller";
import { ordersController } from "../controllers/orders.controller";
import { patientsController } from "../controllers/patients.controller";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok" as const })),
  patients: patientsController,
  labTests: labTestsController,
  orders: ordersController,
});

export type AppRouter = typeof appRouter;
