import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { createTestCaller } from "../../test/createTestCaller";

/** Thursday. */
const now = () => new Date("2026-11-12T10:00:00Z");

async function errorCode(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    if (error instanceof TRPCError) return error.code;
    throw error;
  }
  return null;
}

/** A caller with 2 patients and 3 lab tests. */
async function setup() {
  const { caller } = createTestCaller({ now });
  const ada = await caller.patients.create({
    firstName: "Ada",
    lastName: "Lovelace",
    dateOfBirth: "1990-12-10",
  });
  const alan = await caller.patients.create({
    firstName: "Alan",
    lastName: "Turing",
    dateOfBirth: "1985-06-23",
  });
  const cbc = await caller.labTests.create({
    code: "CBC",
    name: "Complete blood count",
    price: 25.1,
    turnaroundDays: 1,
  });
  const lipid = await caller.labTests.create({
    code: "LIPID",
    name: "Lipid panel",
    price: 40.2,
    turnaroundDays: 3,
  });
  const tsh = await caller.labTests.create({
    code: "TSH",
    name: "Thyroid stimulating hormone",
    price: 10,
    turnaroundDays: 2,
  });
  return { caller, ada, alan, cbc, lipid, tsh };
}

describe("orders controller", () => {
  it("creates an order with snapshot items, total and ready date, then gets it", async () => {
    const { caller, ada, cbc, lipid } = await setup();
    const created = await caller.orders.create({
      patientId: ada.patientId,
      labTestIds: [cbc.labTestId, lipid.labTestId],
    });
    expect(created).toMatchObject({
      patientId: ada.patientId,
      patientFirstName: "Ada",
      patientLastName: "Lovelace",
      status: "Pending",
      placedAt: "2026-11-12T10:00:00.000Z",
      readyDate: "2026-11-17",
      total: 65.3,
      completedAt: null,
    });
    expect(created.items).toEqual([
      {
        orderItemId: expect.any(Number),
        orderId: created.orderId,
        labTestId: cbc.labTestId,
        code: "CBC",
        name: "Complete blood count",
        price: 25.1,
        turnaroundDays: 1,
      },
      {
        orderItemId: expect.any(Number),
        orderId: created.orderId,
        labTestId: lipid.labTestId,
        code: "LIPID",
        name: "Lipid panel",
        price: 40.2,
        turnaroundDays: 3,
      },
    ]);
    expect(await caller.orders.get({ orderId: created.orderId })).toEqual(
      created,
    );
  });

  it("rejects duplicate test ids and an empty list", async () => {
    const { caller, ada, cbc } = await setup();
    expect(
      await errorCode(
        caller.orders.create({
          patientId: ada.patientId,
          labTestIds: [cbc.labTestId, cbc.labTestId],
        }),
      ),
    ).toBe("BAD_REQUEST");
    expect(
      await errorCode(
        caller.orders.create({ patientId: ada.patientId, labTestIds: [] }),
      ),
    ).toBe("BAD_REQUEST");
    expect((await caller.orders.list({})).total).toBe(0);
  });

  it("returns NOT_FOUND for an unknown patient, test or order", async () => {
    const { caller, ada, cbc } = await setup();
    expect(
      await errorCode(
        caller.orders.create({ patientId: 999, labTestIds: [cbc.labTestId] }),
      ),
    ).toBe("NOT_FOUND");
    expect(
      await errorCode(
        caller.orders.create({ patientId: ada.patientId, labTestIds: [999] }),
      ),
    ).toBe("NOT_FOUND");
    expect(await errorCode(caller.orders.get({ orderId: 999 }))).toBe(
      "NOT_FOUND",
    );
    expect((await caller.orders.list({})).total).toBe(0);
  });

  it("keeps the saved price when the catalog price changes later", async () => {
    const { caller, ada, cbc } = await setup();
    const created = await caller.orders.create({
      patientId: ada.patientId,
      labTestIds: [cbc.labTestId],
    });
    await caller.labTests.update({ ...cbc, price: 99, turnaroundDays: 5 });
    const saved = await caller.orders.get({ orderId: created.orderId });
    expect(saved.total).toBe(25.1);
    expect(saved.readyDate).toBe("2026-11-13");
    expect(saved.items[0]).toMatchObject({ price: 25.1, turnaroundDays: 1 });
  });

  it("lists newest first, filters by patient and status, and pages", async () => {
    const { caller, ada, alan, cbc, lipid, tsh } = await setup();
    const first = await caller.orders.create({
      patientId: ada.patientId,
      labTestIds: [cbc.labTestId],
    });
    const second = await caller.orders.create({
      patientId: alan.patientId,
      labTestIds: [lipid.labTestId, tsh.labTestId],
    });
    const third = await caller.orders.create({
      patientId: ada.patientId,
      labTestIds: [tsh.labTestId, cbc.labTestId],
    });
    await caller.orders.complete({ orderId: first.orderId });

    const all = await caller.orders.list({});
    expect(all).toMatchObject({ total: 3, page: 1, pageSize: 20 });
    expect(all.items.map((o) => o.orderId)).toEqual([
      third.orderId,
      second.orderId,
      first.orderId,
    ]);
    expect(all.items[1]).toEqual({
      orderId: second.orderId,
      patientId: alan.patientId,
      patientFirstName: "Alan",
      patientLastName: "Turing",
      testNames: ["Lipid panel", "Thyroid stimulating hormone"],
      status: "Pending",
      placedAt: "2026-11-12T10:00:00.000Z",
      readyDate: "2026-11-17",
      total: 50.2,
      completedAt: null,
    });

    const adas = await caller.orders.list({ patientId: ada.patientId });
    expect(adas.total).toBe(2);
    expect(adas.items.map((o) => [o.orderId, o.total])).toEqual([
      [third.orderId, 35.1],
      [first.orderId, 25.1],
    ]);

    const pending = await caller.orders.list({ status: "Pending" });
    expect(pending.items.map((o) => o.orderId)).toEqual([
      third.orderId,
      second.orderId,
    ]);
    const done = await caller.orders.list({
      status: "Completed",
      patientId: ada.patientId,
    });
    expect(done.items.map((o) => o.orderId)).toEqual([first.orderId]);
    expect(
      (
        await caller.orders.list({
          status: "Completed",
          patientId: alan.patientId,
        })
      ).total,
    ).toBe(0);

    const page2 = await caller.orders.list({ page: 2, pageSize: 2 });
    expect(page2).toMatchObject({ total: 3, page: 2, pageSize: 2 });
    expect(page2.items.map((o) => o.orderId)).toEqual([first.orderId]);
  });

  it("completes an order once; the second time is BAD_REQUEST", async () => {
    const { caller, ada, cbc } = await setup();
    const created = await caller.orders.create({
      patientId: ada.patientId,
      labTestIds: [cbc.labTestId],
    });
    const completed = await caller.orders.complete({
      orderId: created.orderId,
    });
    expect(completed).toMatchObject({
      status: "Completed",
      completedAt: "2026-11-12T10:00:00.000Z",
    });
    expect(
      await errorCode(caller.orders.complete({ orderId: created.orderId })),
    ).toBe("BAD_REQUEST");
    expect(await errorCode(caller.orders.complete({ orderId: 999 }))).toBe(
      "NOT_FOUND",
    );
  });
});
