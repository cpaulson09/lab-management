import { count } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../test/createTestDb";
import { lab_test, order, order_item, patient } from "./schema";
import { seed } from "./seed";

describe("seed", () => {
  it("fills every table and is safe to run twice", async () => {
    const db = createTestDb();
    const counts = async () => ({
      patient: (await db.select({ n: count() }).from(patient))[0]?.n,
      lab_test: (await db.select({ n: count() }).from(lab_test))[0]?.n,
      order: (await db.select({ n: count() }).from(order))[0]?.n,
      order_item: (await db.select({ n: count() }).from(order_item))[0]?.n,
    });

    seed(db);
    const first = await counts();
    seed(db);
    expect(await counts()).toEqual(first);
    expect(first.lab_test).toBe(8);
    expect(first.patient).toBeGreaterThan(20);
    expect(first.order).toBeGreaterThan(0);
  });
});
