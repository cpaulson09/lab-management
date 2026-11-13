import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../test/createTestDb";
import { must } from "../../test/must";
import { lab_test, order, order_item, patient } from "./schema";

describe("schema", () => {
  it("inserts and reads a patient", async () => {
    const db = createTestDb();
    const created = must(
      (
        await db
          .insert(patient)
          .values({
            first_name: "Ada",
            last_name: "Lovelace",
            date_of_birth: "1985-12-10",
            email: "ada@example.com",
          })
          .returning()
      )[0],
    );

    const found = await db
      .select()
      .from(patient)
      .where(eq(patient.patient_id, created.patient_id));

    expect(found).toEqual([
      {
        patient_id: created.patient_id,
        first_name: "Ada",
        last_name: "Lovelace",
        date_of_birth: "1985-12-10",
        phone: null,
        email: "ada@example.com",
        created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      },
    ]);
  });

  it("gives each call its own empty database", async () => {
    const first = createTestDb();
    await first.insert(patient).values({
      first_name: "A",
      last_name: "B",
      date_of_birth: "2000-01-01",
    });
    expect(await createTestDb().select().from(patient)).toEqual([]);
  });

  it("enforces foreign keys", async () => {
    const db = createTestDb();
    await expect(
      db.insert(order).values({
        patient_id: 999,
        placed_at: "2026-01-05T10:00:00.000Z",
        ready_date: "2026-01-06",
        total: 10,
      }),
    ).rejects.toThrow(/FOREIGN KEY/);
  });

  it("blocks the same test twice in one order", async () => {
    const db = createTestDb();
    const p = must(
      (
        await db
          .insert(patient)
          .values({
            first_name: "A",
            last_name: "B",
            date_of_birth: "2000-01-01",
          })
          .returning()
      )[0],
    );
    const t = must(
      (
        await db
          .insert(lab_test)
          .values({
            code: "CBC",
            name: "Complete Blood Count",
            price: 25,
            turnaround_days: 1,
          })
          .returning()
      )[0],
    );
    const o = must(
      (
        await db
          .insert(order)
          .values({
            patient_id: p.patient_id,
            placed_at: "2026-01-05T10:00:00.000Z",
            ready_date: "2026-01-06",
            total: 25,
          })
          .returning()
      )[0],
    );
    const item = {
      order_id: o.order_id,
      lab_test_id: t.lab_test_id,
      price: 25,
      turnaround_days: 1,
    };
    await db.insert(order_item).values(item);
    await expect(db.insert(order_item).values(item)).rejects.toThrow(/UNIQUE/);
  });

  it("blocks a duplicate lab test code", async () => {
    const db = createTestDb();
    const cbc = {
      code: "CBC",
      name: "Complete Blood Count",
      price: 25,
      turnaround_days: 1,
    };
    await db.insert(lab_test).values(cbc);
    await expect(db.insert(lab_test).values(cbc)).rejects.toThrow(/UNIQUE/);
  });
});
