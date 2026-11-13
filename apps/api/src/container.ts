import type { Db } from "./db/client";
import { LabTestRepository } from "./repositories/lab-tests.repository";
import { OrderRepository } from "./repositories/orders.repository";
import { PatientRepository } from "./repositories/patients.repository";
import { LabTestService } from "./services/lab-tests.service";
import { OrderService } from "./services/orders.service";
import { PatientService } from "./services/patients.service";

/**
 * Builds the app's layers in one place: database → repositories → services.
 * Controllers get the services through the tRPC context.
 */
export function createContainer(db: Db, now: () => Date = () => new Date()) {
  const patientRepository = new PatientRepository(db);
  const labTestRepository = new LabTestRepository(db);
  const orderRepository = new OrderRepository(db);

  return {
    patientService: new PatientService(patientRepository),
    labTestService: new LabTestService(labTestRepository),
    orderService: new OrderService({
      orders: orderRepository,
      patients: patientRepository,
      labTests: labTestRepository,
      now,
    }),
  };
}

export type Services = ReturnType<typeof createContainer>;
