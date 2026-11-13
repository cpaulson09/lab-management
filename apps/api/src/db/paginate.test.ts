import { asc, count } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../../test/createTestDb";
import type { Db } from "./client";
import { paginate } from "./paginate";
import { patient } from "./schema";

describe("paginate", () => {
  let db: Db;

  beforeEach(async () => {
    db = createTestDb();
    await db.insert(patient).values(
      Array.from({ length: 45 }, (_, i) => ({
        first_name: `First${i + 1}`,
        last_name: "Test",
        date_of_birth: "2000-01-01",
      })),
    );
  });

  const listPatients = (page: number, pageSize?: number) =>
    paginate(
      { page, pageSize },
      {
        items: (limit, offset) =>
          db
            .select()
            .from(patient)
            .orderBy(asc(patient.patient_id))
            .limit(limit)
            .offset(offset),
        count: async () => {
          const [row] = await db.select({ n: count() }).from(patient);
          return row?.n ?? 0;
        },
      },
    );

  it("returns the first page", async () => {
    const result = await listPatients(1);
    expect(result.total).toBe(45);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.items).toHaveLength(20);
    expect(result.items[0]?.first_name).toBe("First1");
  });

  it("returns a short last page", async () => {
    const result = await listPatients(3);
    expect(result.items.map((p) => p.first_name)).toEqual([
      "First41",
      "First42",
      "First43",
      "First44",
      "First45",
    ]);
    expect(result.total).toBe(45);
  });

  it("returns no items past the end, with the right total", async () => {
    const result = await listPatients(4);
    expect(result).toEqual({ items: [], total: 45, page: 4, pageSize: 20 });
  });

  it("uses a custom page size", async () => {
    const result = await listPatients(2, 10);
    expect(result.items[0]?.first_name).toBe("First11");
    expect(result.items).toHaveLength(10);
  });

  it("treats a page below 1 as page 1", async () => {
    const result = await listPatients(0);
    expect(result.page).toBe(1);
    expect(result.items[0]?.first_name).toBe("First1");
  });
});
