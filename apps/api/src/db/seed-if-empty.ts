import { count } from "drizzle-orm";
import { databasePath, openDb } from "./client";
import { lab_test, patient } from "./schema";
import { seed } from "./seed";

/** Seeds the database only when it has no patients and no lab tests. Never wipes data. */
const path = databasePath();
const { db, sqlite } = openDb(path);

const [patients] = db.select({ n: count() }).from(patient).all();
const [labTests] = db.select({ n: count() }).from(lab_test).all();

if ((patients?.n ?? 0) === 0 && (labTests?.n ?? 0) === 0) {
  seed(db);
  console.log(`Seeded ${path}`);
} else {
  console.log(`Seed skipped: ${path} already has data`);
}

sqlite.close();
