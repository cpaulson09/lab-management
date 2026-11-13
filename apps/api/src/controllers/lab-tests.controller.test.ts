import type { LabTestCreate } from "@lab/shared";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createTestCaller } from "../../test/createTestCaller";
import { must } from "../../test/must";
import { lab_test, order, order_item, patient } from "../db/schema";

const cbc: LabTestCreate = {
  code: "CBC",
  name: "Complete blood count",
  price: 25,
  turnaroundDays: 1,
};

async function errorCode(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    if (error instanceof TRPCError) return error.code;
    throw error;
  }
  return null;
}

describe("labTests controller", () => {
  it("creates a lab test, then gets it", async () => {
    const { caller } = createTestCaller();
    const created = await caller.labTests.create({
      ...cbc,
      code: " cbc ",
      price: 25.499,
    });
    expect(created).toMatchObject({ code: "CBC", price: 25.5 });
    expect(await caller.labTests.get({ labTestId: created.labTestId })).toEqual(
      created,
    );
  });

  it("updates a lab test", async () => {
    const { caller } = createTestCaller();
    const created = await caller.labTests.create(cbc);
    const updated = await caller.labTests.update({
      ...created,
      name: "CBC with differential",
      price: 30,
      turnaroundDays: 2,
    });
    expect(updated).toEqual({
      labTestId: created.labTestId,
      code: "CBC",
      name: "CBC with differential",
      price: 30,
      turnaroundDays: 2,
    });
    expect(await caller.labTests.get({ labTestId: created.labTestId })).toEqual(
      updated,
    );
  });

  it("lists by code with paging and a total", async () => {
    const { caller } = createTestCaller();
    for (const code of ["TSH", "A1C", "CBC", "LIPID", "BMP"]) {
      await caller.labTests.create({ ...cbc, code, name: `Test ${code}` });
    }
    const first = await caller.labTests.list({ page: 1, pageSize: 2 });
    expect(first.items.map((t) => t.code)).toEqual(["A1C", "BMP"]);
    expect(first).toMatchObject({ total: 5, page: 1, pageSize: 2 });
    const last = await caller.labTests.list({ page: 3, pageSize: 2 });
    expect(last.items.map((t) => t.code)).toEqual(["TSH"]);
    const defaults = await caller.labTests.list({});
    expect(defaults).toMatchObject({ total: 5, page: 1, pageSize: 20 });
  });

  it("searches code and name, ignoring case", async () => {
    const { caller } = createTestCaller();
    await caller.labTests.create(cbc);
    await caller.labTests.create({
      ...cbc,
      code: "LIPID",
      name: "Lipid panel",
    });
    await caller.labTests.create({ ...cbc, code: "TSH", name: "Thyroid 100%" });

    const byCode = await caller.labTests.list({ search: "lip" });
    expect(byCode.items.map((t) => t.code)).toEqual(["LIPID"]);
    expect(byCode.total).toBe(1);

    const byName = await caller.labTests.list({ search: "BLOOD" });
    expect(byName.items.map((t) => t.code)).toEqual(["CBC"]);

    const literalPercent = await caller.labTests.list({ search: "%" });
    expect(literalPercent.items.map((t) => t.code)).toEqual(["TSH"]);

    const blank = await caller.labTests.list({ search: "  " });
    expect(blank.total).toBe(3);
  });

  it("rejects a duplicate code with CONFLICT", async () => {
    const { caller } = createTestCaller();
    await caller.labTests.create(cbc);
    const other = await caller.labTests.create({ ...cbc, code: "TSH" });
    expect(await errorCode(caller.labTests.create(cbc))).toBe("CONFLICT");
    expect(
      await errorCode(caller.labTests.update({ ...other, code: "cbc" })),
    ).toBe("CONFLICT");
  });

  it("rejects bad input", async () => {
    const { caller } = createTestCaller();
    expect(
      await errorCode(caller.labTests.create({ ...cbc, turnaroundDays: 0 })),
    ).toBe("BAD_REQUEST");
    expect(await errorCode(caller.labTests.create({ ...cbc, price: -1 }))).toBe(
      "BAD_REQUEST",
    );
    expect(await errorCode(caller.labTests.create({ ...cbc, code: " " }))).toBe(
      "BAD_REQUEST",
    );
    expect(await errorCode(caller.labTests.list({ pageSize: 0 }))).toBe(
      "BAD_REQUEST",
    );
  });

  it("returns NOT_FOUND for an unknown id", async () => {
    const { caller } = createTestCaller();
    expect(await errorCode(caller.labTests.get({ labTestId: 999 }))).toBe(
      "NOT_FOUND",
    );
    expect(
      await errorCode(caller.labTests.update({ ...cbc, labTestId: 999 })),
    ).toBe("NOT_FOUND");
  });

  it("changes the catalog price without touching orders", async () => {
    const { caller, db } = createTestCaller();
    const test = await caller.labTests.create(cbc);
    const [p] = await db
      .insert(patient)
      .values({
        first_name: "Ada",
        last_name: "Lane",
        date_of_birth: "1990-01-01",
      })
      .returning();
    const [o] = await db
      .insert(order)
      .values({
        patient_id: must(p).patient_id,
        placed_at: "2026-11-02T10:00:00.000Z",
        ready_date: "2026-11-03",
        total: 25,
      })
      .returning();
    await db.insert(order_item).values({
      order_id: must(o).order_id,
      lab_test_id: test.labTestId,
      price: 25,
      turnaround_days: 1,
    });

    await caller.labTests.update({ ...test, price: 99, turnaroundDays: 5 });

    const [item] = await db
      .select()
      .from(order_item)
      .where(eq(order_item.lab_test_id, test.labTestId));
    expect(item).toMatchObject({ price: 25, turnaround_days: 1 });
    const [catalog] = await db
      .select()
      .from(lab_test)
      .where(eq(lab_test.lab_test_id, test.labTestId));
    expect(catalog?.price).toBe(99);
  });
});
