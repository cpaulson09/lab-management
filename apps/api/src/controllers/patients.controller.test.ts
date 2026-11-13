import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { createTestCaller } from "../../test/createTestCaller";

const grace = {
  firstName: "Grace",
  lastName: "Hopper",
  dateOfBirth: "1906-12-09",
  phone: "(555) 010-1234",
  email: "grace@example.com",
};

async function expectCode(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(TRPCError);
  expect((error as TRPCError).code).toBe(code);
}

describe("patients controller", () => {
  it("creates a patient, then gets it", async () => {
    const { caller } = createTestCaller();
    const created = await caller.patients.create(grace);

    expect(created).toMatchObject({ ...grace, patientId: expect.any(Number) });
    expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const fetched = await caller.patients.get({
      patientId: created.patientId,
    });
    expect(fetched).toEqual(created);
  });

  it("stores missing phone and email as null", async () => {
    const { caller } = createTestCaller();
    const created = await caller.patients.create({
      firstName: "Alan",
      lastName: "Turing",
      dateOfBirth: "1912-06-23",
    });
    expect(created.phone).toBeNull();
    expect(created.email).toBeNull();
  });

  it("updates a patient", async () => {
    const { caller } = createTestCaller();
    const created = await caller.patients.create(grace);

    const updated = await caller.patients.update({
      patientId: created.patientId,
      firstName: "Grace B.",
      lastName: "Hopper",
      dateOfBirth: "1906-12-09",
      email: "admiral@example.com",
    });

    expect(updated).toMatchObject({
      patientId: created.patientId,
      firstName: "Grace B.",
      email: "admiral@example.com",
      phone: null,
      createdAt: created.createdAt,
    });
    await expect(
      caller.patients.get({ patientId: created.patientId }),
    ).resolves.toEqual(updated);
  });

  it("lists patients a page at a time, sorted by last then first name", async () => {
    const { caller } = createTestCaller();
    for (let i = 25; i >= 1; i--) {
      const n = String(i).padStart(2, "0");
      await caller.patients.create({
        firstName: `First${n}`,
        lastName: `Last${n}`,
        dateOfBirth: "1980-01-01",
      });
    }

    const page1 = await caller.patients.list({ page: 1, pageSize: 10 });
    expect(page1.total).toBe(25);
    expect(page1.items[0]?.lastName).toBe("Last01");

    const page2 = await caller.patients.list({ page: 2, pageSize: 10 });
    expect(page2).toMatchObject({ total: 25, page: 2, pageSize: 10 });
    expect(page2.items.map((p) => p.lastName)).toEqual(
      Array.from({ length: 10 }, (_, k) => `Last${String(k + 11)}`),
    );

    const page3 = await caller.patients.list({ page: 3, pageSize: 10 });
    expect(page3.items).toHaveLength(5);

    const defaults = await caller.patients.list({});
    expect(defaults).toMatchObject({ page: 1, pageSize: 20 });
    expect(defaults.items).toHaveLength(20);
  });

  it("sorts by first name when last names are the same", async () => {
    const { caller } = createTestCaller();
    for (const firstName of ["Zoe", "Amy", "Max"]) {
      await caller.patients.create({
        firstName,
        lastName: "Smith",
        dateOfBirth: "1980-01-01",
      });
    }
    const page = await caller.patients.list({});
    expect(page.items.map((p) => p.firstName)).toEqual(["Amy", "Max", "Zoe"]);
  });

  it("searches first and last names, any case", async () => {
    const { caller } = createTestCaller();
    await caller.patients.create(grace);
    await caller.patients.create({
      firstName: "Hope",
      lastName: "Jones",
      dateOfBirth: "1970-05-05",
    });
    await caller.patients.create({
      firstName: "Alan",
      lastName: "Turing",
      dateOfBirth: "1912-06-23",
    });

    const byLast = await caller.patients.list({ search: "HOPP" });
    expect(byLast.total).toBe(1);
    expect(byLast.items[0]?.lastName).toBe("Hopper");

    const both = await caller.patients.list({ search: "hop" });
    expect(both.items.map((p) => p.firstName)).toEqual(["Grace", "Hope"]);
    expect(both.total).toBe(2);

    const none = await caller.patients.list({ search: "%" });
    expect(none.total).toBe(0);

    const blank = await caller.patients.list({ search: "  " });
    expect(blank.total).toBe(3);
  });

  it("rejects an empty first name", async () => {
    const { caller } = createTestCaller();
    await expectCode(
      caller.patients.create({ ...grace, firstName: "  " }),
      "BAD_REQUEST",
    );
  });

  it("rejects a bad date of birth", async () => {
    const { caller } = createTestCaller();
    await expectCode(
      caller.patients.create({ ...grace, dateOfBirth: "12/09/1906" }),
      "BAD_REQUEST",
    );
    await expectCode(
      caller.patients.create({ ...grace, dateOfBirth: "2026-02-30" }),
      "BAD_REQUEST",
    );
    await expectCode(
      caller.patients.create({ ...grace, dateOfBirth: "2999-01-01" }),
      "BAD_REQUEST",
    );
    await expectCode(
      caller.patients.create({ ...grace, dateOfBirth: "0099-01-01" }),
      "BAD_REQUEST",
    );
  });

  it("returns NOT_FOUND for an unknown id on get and update", async () => {
    const { caller } = createTestCaller();
    await expectCode(caller.patients.get({ patientId: 999 }), "NOT_FOUND");
    await expectCode(
      caller.patients.update({ ...grace, patientId: 999 }),
      "NOT_FOUND",
    );
  });
});
