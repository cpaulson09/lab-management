import type { Db } from "../db/client";

/** The only code that reads and writes the patients table(s). Step 3 fills this in. */
export class PatientRepository {
  constructor(readonly db: Db) {}
}
