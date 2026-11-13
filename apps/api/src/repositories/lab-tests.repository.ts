import type { Db } from "../db/client";

/** The only code that reads and writes the lab_tests table(s). Step 3 fills this in. */
export class LabTestRepository {
  constructor(readonly db: Db) {}
}
