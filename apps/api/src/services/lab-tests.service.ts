import type { LabTestRepository } from "../repositories/lab-tests.repository";

/** Business rules for lab tests. Step 3 fills this in. */
export class LabTestService {
  constructor(readonly repository: LabTestRepository) {}
}
