import {
  completeOrder,
  estimateReadyDate,
  OrderAlreadyCompletedError,
  type OrderCreate,
  orderTotal,
} from "@lab/shared";
import type { Page } from "../db/paginate";
import { BusinessRuleError, NotFoundError } from "../errors";
import type { LabTestRepository } from "../repositories/lab-tests.repository";
import type {
  OrderDetail,
  OrderListParams,
  OrderListRow,
  OrderRepository,
} from "../repositories/orders.repository";
import type { PatientRepository } from "../repositories/patients.repository";

/** What the service needs from storage. Unit tests pass fakes. */
export type OrderStore = Pick<
  OrderRepository,
  "create" | "findById" | "list" | "markCompleted"
>;

export type OrderServiceDeps = {
  orders: OrderStore;
  patients: Pick<PatientRepository, "findById">;
  labTests: Pick<LabTestRepository, "findByIds">;
  /** The clock. Tests pass a fixed time. */
  now: () => Date;
};

/** Business rules for orders. */
export class OrderService {
  constructor(private readonly deps: OrderServiceDeps) {}

  list(params: OrderListParams): Promise<Page<OrderListRow>> {
    return this.deps.orders.list(params);
  }

  async get(orderId: number): Promise<OrderDetail> {
    const found = await this.deps.orders.findById(orderId);
    if (!found) throw new NotFoundError("Order", orderId);
    return found;
  }

  /**
   * Places an order. Each item keeps a copy of the test's price and
   * turnaround (the snapshot), so later catalog changes do not touch it.
   */
  async create(input: OrderCreate): Promise<OrderDetail> {
    const { patientId, labTestIds } = input;
    if (labTestIds.length === 0) {
      throw new BusinessRuleError("Pick at least one test");
    }
    if (new Set(labTestIds).size !== labTestIds.length) {
      throw new BusinessRuleError("A test can be in an order only once");
    }

    const patient = await this.deps.patients.findById(patientId);
    if (!patient) throw new NotFoundError("Patient", patientId);

    const found = await this.deps.labTests.findByIds(labTestIds);
    const byId = new Map(found.map((t) => [t.labTestId, t]));
    const missing = labTestIds.filter((id) => !byId.has(id));
    if (missing.length > 0) {
      throw new NotFoundError("Lab test", missing.join(", "));
    }

    const items = labTestIds.map((id) => {
      const test = byId.get(id);
      if (!test) throw new NotFoundError("Lab test", id);
      return {
        labTestId: id,
        price: test.price,
        turnaroundDays: test.turnaroundDays,
      };
    });
    const placedAt = this.deps.now();

    return this.deps.orders.create({
      patientId,
      status: "Pending",
      placedAt: placedAt.toISOString(),
      readyDate: estimateReadyDate(placedAt, items),
      total: orderTotal(items),
      items,
    });
  }

  /** Pending → Completed. Completed is final: a second call throws. */
  async complete(orderId: number): Promise<OrderDetail> {
    const current = await this.get(orderId);
    const completed = completeOrder(current, this.deps.now());
    const changed = await this.deps.orders.markCompleted(
      orderId,
      completed.completedAt ?? this.deps.now().toISOString(),
    );
    // Another request completed it between our read and write.
    if (!changed) throw new OrderAlreadyCompletedError(orderId);
    return this.get(orderId);
  }
}
