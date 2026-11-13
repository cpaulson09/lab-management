import type { PatientRepository } from "../repositories/patients.repository";

/** Business rules for patients. Step 3 fills this in. */
export class PatientService {
  constructor(readonly repository: PatientRepository) {}
}
