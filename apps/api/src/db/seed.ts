import { pathToFileURL } from "node:url";
import { roundMoney } from "@lab/shared";
import { sql } from "drizzle-orm";
import { type Db, databasePath, openDb } from "./client";
import { lab_test, order, order_item, patient } from "./schema";

const LAB_TESTS = [
  { code: "CBC", name: "Complete Blood Count", price: 25, turnaround_days: 1 },
  {
    code: "BMP",
    name: "Basic Metabolic Panel",
    price: 32.5,
    turnaround_days: 1,
  },
  {
    code: "CMP",
    name: "Comprehensive Metabolic Panel",
    price: 45,
    turnaround_days: 2,
  },
  { code: "LIPID", name: "Lipid Panel", price: 38.75, turnaround_days: 2 },
  { code: "A1C", name: "Hemoglobin A1c", price: 29.99, turnaround_days: 2 },
  {
    code: "TSH",
    name: "Thyroid Stimulating Hormone",
    price: 41.25,
    turnaround_days: 3,
  },
  { code: "UA", name: "Urinalysis", price: 18, turnaround_days: 1 },
  {
    code: "VITD",
    name: "Vitamin D, 25-Hydroxy",
    price: 59.5,
    turnaround_days: 5,
  },
];

const FIRST_NAMES = [
  "Olivia",
  "Liam",
  "Emma",
  "Noah",
  "Ava",
  "Elijah",
  "Sophia",
  "James",
  "Isabella",
  "Mateo",
  "Mia",
  "Lucas",
  "Amara",
  "Kenji",
  "Priya",
  "Diego",
  "Fatima",
  "Hiro",
  "Zara",
  "Omar",
  "Chloe",
  "Ethan",
  "Leila",
  "Samuel",
  "Nora",
  "Ravi",
  "Grace",
  "Tomas",
  "Ingrid",
  "Kwame",
  "Lucia",
  "Felix",
];
const LAST_NAMES = [
  "Nguyen",
  "Garcia",
  "Smith",
  "Patel",
  "Johnson",
  "Kim",
  "Okafor",
  "Brown",
  "Rossi",
  "Hernandez",
  "Cohen",
  "Williams",
  "Tanaka",
  "Silva",
  "Martin",
  "Ahmed",
  "Larsen",
  "Lopez",
  "Novak",
  "Davis",
  "Moreau",
  "Singh",
  "Clark",
  "Mendes",
  "Walker",
  "Ivanova",
  "Young",
  "Haddad",
  "Reyes",
  "Baker",
  "Osei",
  "Fischer",
];

function makePatients() {
  return FIRST_NAMES.map((first, i) => {
    const last = LAST_NAMES[i] ?? "Doe";
    const year = 1950 + ((i * 7) % 55);
    const month = String((i % 12) + 1).padStart(2, "0");
    const day = String(((i * 3) % 28) + 1).padStart(2, "0");
    return {
      first_name: first,
      last_name: last,
      date_of_birth: `${year}-${month}-${day}`,
      phone:
        i % 4 === 3
          ? null
          : `(555) 01${String(i).padStart(2, "0")}-${String(1000 + i * 37).slice(-4)}`,
      email: i % 5 === 4 ? null : `${first}.${last}@example.com`.toLowerCase(),
      created_at: new Date(Date.UTC(2026, 0, 1 + i, 9, 0, 0)).toISOString(),
    };
  });
}

/**
 * Seed-only helper: adds business days (skips Sat/Sun) to a YYYY-MM-DD date.
 * The real rule lives in @lab/shared (step 1); the API uses that one.
 */
function addBusinessDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  let left = days;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) left--;
  }
  return d.toISOString().slice(0, 10);
}

/** [patient index, test codes, placed_at, completed_at or null] */
const ORDERS: [number, string[], string, string | null][] = [
  [0, ["CBC", "BMP"], "2026-02-02T14:05:00.000Z", "2026-02-03T16:00:00.000Z"],
  [1, ["LIPID", "A1C"], "2026-02-04T09:30:00.000Z", "2026-02-06T11:15:00.000Z"],
  [2, ["TSH"], "2026-02-06T15:45:00.000Z", null],
  [3, ["CMP", "VITD", "UA"], "2026-02-09T10:20:00.000Z", null],
  [4, ["CBC"], "2026-02-10T08:10:00.000Z", "2026-02-11T13:40:00.000Z"],
  [0, ["A1C", "LIPID", "CMP"], "2026-02-12T12:00:00.000Z", null],
  [7, ["UA", "BMP"], "2026-02-13T16:25:00.000Z", null],
];

/** Clears every table, then inserts the starter data. Safe to run again. */
export function seed(db: Db) {
  db.transaction((tx) => {
    tx.delete(order_item).run();
    tx.delete(order).run();
    tx.delete(patient).run();
    tx.delete(lab_test).run();
    // Restart ids at 1 so each run gives the same data.
    tx.run(sql`delete from sqlite_sequence`);

    const tests = tx.insert(lab_test).values(LAB_TESTS).returning().all();
    const byCode = new Map(tests.map((t) => [t.code, t]));
    const patients = tx
      .insert(patient)
      .values(makePatients())
      .returning()
      .all();

    for (const [patientIndex, codes, placedAt, completedAt] of ORDERS) {
      const items = codes.map((code) => {
        const test = byCode.get(code);
        if (!test) throw new Error(`Unknown test code ${code}`);
        return test;
      });
      const patientId = patients[patientIndex]?.patient_id;
      if (patientId === undefined)
        throw new Error(`No patient ${patientIndex}`);
      const longest = Math.max(...items.map((t) => t.turnaround_days));
      const [created] = tx
        .insert(order)
        .values({
          patient_id: patientId,
          status: completedAt ? "Completed" : "Pending",
          placed_at: placedAt,
          ready_date: addBusinessDays(placedAt.slice(0, 10), longest),
          total: roundMoney(items.reduce((sum, t) => sum + t.price, 0)),
          completed_at: completedAt,
        })
        .returning()
        .all();
      if (!created) throw new Error("Order insert returned nothing");
      tx.insert(order_item)
        .values(
          items.map((t) => ({
            order_id: created.order_id,
            lab_test_id: t.lab_test_id,
            price: t.price,
            turnaround_days: t.turnaround_days,
          })),
        )
        .run();
    }
  });
}

// Run only when called as a script (pnpm db:seed), not when a test imports it.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const path = databasePath();
  const { db, sqlite } = openDb(path);
  seed(db);
  sqlite.close();
  console.log(`Seeded ${path}`);
}
