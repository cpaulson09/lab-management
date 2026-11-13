import {
  type LabTest,
  OrderAlreadyCompletedError,
  type Patient,
} from "@lab/shared";
import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type { NewOrder, OrderDetail } from "../repositories/orders.repository";
import { OrderService, type OrderStore } from "./orders.service";

const ada: Patient = {
  patientId: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  dateOfBirth: "1990-12-10",
  phone: null,
  email: null,
  createdAt: "2026-01-01T09:00:00.000Z",
};
const cbc: LabTest = {
  labTestId: 1,
  code: "CBC",
  name: "Complete blood count",
  price: 25.1,
  turnaroundDays: 1,
};
const lipid: LabTest = {
  labTestId: 2,
  code: "LIPID",
  name: "Lipid panel",
  price: 40.2,
  turnaroundDays: 3,
};

/** Thursday. */
const NOW = new Date("2026-11-12T10:00:00.000Z");

/** In-memory stand-ins for the repositories. No database. */
function setup() {
  const orders = new Map<number, OrderDetail>();
  const saved: NewOrder[] = [];
  const catalog = new Map([cbc, lipid].map((t) => [t.labTestId, { ...t }]));
  const store: OrderStore = {
    create: async (input) => {
      saved.push(input);
      const orderId = orders.size + 1;
      const detail: OrderDetail = {
        orderId,
        patientId: input.patientId,
        status: input.status,
        placedAt: input.placedAt,
        readyDate: input.readyDate,
        total: input.total,
        completedAt: null,
        patientFirstName: ada.firstName,
        patientLastName: ada.lastName,
        items: input.items.map((item, i) => ({
          ...item,
          orderItemId: i + 1,
          orderId,
          code: "X",
          name: "X",
        })),
      };
      orders.set(orderId, detail);
      return detail;
    },
    findById: async (id) => orders.get(id) ?? null,
    list: async () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    }),
    markCompleted: async (id, completedAt) => {
      const current = orders.get(id);
      if (current?.status !== "Pending") return false;
      orders.set(id, { ...current, status: "Completed", completedAt });
      return true;
    },
  };
  const service = new OrderService({
    orders: store,
    patients: { findById: async (id) => (id === ada.patientId ? ada : null) },
    labTests: {
      findByIds: async (ids) =>
        ids.flatMap((id) => {
          const test = catalog.get(id);
          return test ? [test] : [];
        }),
    },
    now: () => NOW,
  });
  return { service, saved, catalog };
}

describe("OrderService", () => {
  it("create throws NotFoundError for an unknown patient", async () => {
    const { service, saved } = setup();
    await expect(
      service.create({ patientId: 99, labTestIds: [1] }),
    ).rejects.toThrow(new NotFoundError("Patient", 99));
    expect(saved).toHaveLength(0);
  });

  it("create throws NotFoundError naming every unknown test", async () => {
    const { service, saved } = setup();
    await expect(
      service.create({ patientId: 1, labTestIds: [1, 7, 8] }),
    ).rejects.toThrow("Lab test 7, 8 was not found");
    expect(saved).toHaveLength(0);
  });

  it("create copies price and turnaround onto each item", async () => {
    const { service, saved } = setup();
    await service.create({ patientId: 1, labTestIds: [2, 1] });
    expect(saved[0]?.items).toEqual([
      { labTestId: 2, price: 40.2, turnaroundDays: 3 },
      { labTestId: 1, price: 25.1, turnaroundDays: 1 },
    ]);
  });

  it("create sets total, ready date, status and placed time", async () => {
    const { service } = setup();
    const created = await service.create({ patientId: 1, labTestIds: [1, 2] });
    expect(created).toMatchObject({
      total: 65.3,
      // Thursday + 3 business days skips the weekend.
      readyDate: "2026-11-17",
      status: "Pending",
      placedAt: NOW.toISOString(),
      completedAt: null,
    });
  });

  it("get throws NotFoundError for an unknown order", async () => {
    const { service } = setup();
    await expect(service.get(5)).rejects.toThrow("Order 5 was not found");
  });

  it("complete works once, then throws OrderAlreadyCompletedError", async () => {
    const { service } = setup();
    const { orderId } = await service.create({ patientId: 1, labTestIds: [1] });
    const completed = await service.complete(orderId);
    expect(completed).toMatchObject({
      status: "Completed",
      completedAt: NOW.toISOString(),
    });
    await expect(service.complete(orderId)).rejects.toBeInstanceOf(
      OrderAlreadyCompletedError,
    );
  });

  it("complete throws NotFoundError for an unknown order", async () => {
    const { service } = setup();
    await expect(service.complete(5)).rejects.toBeInstanceOf(NotFoundError);
  });
});
