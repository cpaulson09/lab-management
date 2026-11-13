import type { LabTestRepository } from "../repositories/lab-tests.repository";
import type { OrderRepository } from "../repositories/orders.repository";
import type { PatientRepository } from "../repositories/patients.repository";

export type OrderServiceDeps = {
  orders: OrderRepository;
  patients: PatientRepository;
  labTests: LabTestRepository;
  /** The clock. Tests pass a fixed time. */
  now: () => Date;
};

/** Business rules for orders. Step 3 fills this in. */
export class OrderService {
  constructor(readonly deps: OrderServiceDeps) {}
}
