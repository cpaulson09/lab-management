import type { LabTest, LabTestCreate, LabTestUpdate } from "@lab/shared";
import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../errors";
import { LabTestService, type LabTestStore } from "./lab-tests.service";

/** An in-memory stand-in for the repository. No database. */
function fakeStore(seed: LabTest[] = []) {
  const rows = new Map(seed.map((t) => [t.labTestId, { ...t }]));
  let nextId = Math.max(0, ...rows.keys()) + 1;
  const store: LabTestStore = {
    list: async () => ({
      items: [...rows.values()],
      total: rows.size,
      page: 1,
      pageSize: 20,
    }),
    findById: async (id) => rows.get(id) ?? null,
    findByCode: async (code) =>
      [...rows.values()].find((t) => t.code === code) ?? null,
    create: async (input: LabTestCreate) => {
      const row = { ...input, labTestId: nextId++ };
      rows.set(row.labTestId, row);
      return row;
    },
    update: async (input: LabTestUpdate) => {
      if (!rows.has(input.labTestId)) return null;
      rows.set(input.labTestId, { ...input });
      return { ...input };
    },
  };
  return { store, rows };
}

const cbc: LabTest = {
  labTestId: 1,
  code: "CBC",
  name: "Complete blood count",
  price: 25,
  turnaroundDays: 1,
};
const lipid: LabTest = {
  labTestId: 2,
  code: "LIPID",
  name: "Lipid panel",
  price: 40,
  turnaroundDays: 2,
};

describe("LabTestService", () => {
  it("get returns the lab test", async () => {
    const service = new LabTestService(fakeStore([cbc]).store);
    expect(await service.get(1)).toEqual(cbc);
  });

  it("get throws NotFoundError for an unknown id", async () => {
    const service = new LabTestService(fakeStore().store);
    await expect(service.get(99)).rejects.toThrow(NotFoundError);
    await expect(service.get(99)).rejects.toThrow("Lab test 99 was not found");
  });

  it("update throws NotFoundError for an unknown id", async () => {
    const service = new LabTestService(fakeStore().store);
    await expect(service.update({ ...cbc, labTestId: 99 })).rejects.toThrow(
      NotFoundError,
    );
  });

  it("create throws ConflictError when the code is taken", async () => {
    const { store, rows } = fakeStore([cbc]);
    const service = new LabTestService(store);
    await expect(
      service.create({
        code: "CBC",
        name: "Other",
        price: 1,
        turnaroundDays: 1,
      }),
    ).rejects.toThrow(ConflictError);
    expect(rows.size).toBe(1);
  });

  it("update throws ConflictError when another test has the code", async () => {
    const { store, rows } = fakeStore([cbc, lipid]);
    const service = new LabTestService(store);
    await expect(service.update({ ...lipid, code: "CBC" })).rejects.toThrow(
      ConflictError,
    );
    expect(rows.get(2)?.code).toBe("LIPID");
  });

  it("update keeps the test's own code without a conflict", async () => {
    const service = new LabTestService(fakeStore([cbc]).store);
    const updated = await service.update({ ...cbc, name: "CBC with diff" });
    expect(updated.name).toBe("CBC with diff");
  });

  it("rounds the price to 2 places on create and update", async () => {
    const { store, rows } = fakeStore();
    const service = new LabTestService(store);
    const created = await service.create({
      code: "A1C",
      name: "Hemoglobin A1c",
      price: 19.999,
      turnaroundDays: 1,
    });
    expect(created.price).toBe(20);
    await service.update({ ...created, price: 1.005 });
    expect(rows.get(created.labTestId)?.price).toBe(1.01);
  });
});
