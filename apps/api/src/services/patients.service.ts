import type { Patient, PatientCreate, PatientUpdate } from "@lab/shared";
import type { Page } from "../db/paginate";
import { NotFoundError } from "../errors";
import type {
  PatientListParams,
  PatientRepository,
} from "../repositories/patients.repository";

/** What the service needs from storage. Unit tests pass a fake. */
export type PatientStore = Pick<
  PatientRepository,
  "list" | "findById" | "create" | "update"
>;

/** Business rules for patients. */
export class PatientService {
  constructor(private readonly repository: PatientStore) {}

  list(params: PatientListParams): Promise<Page<Patient>> {
    return this.repository.list(params);
  }

  async get(patientId: number): Promise<Patient> {
    const found = await this.repository.findById(patientId);
    if (!found) throw new NotFoundError("Patient", patientId);
    return found;
  }

  create(input: PatientCreate): Promise<Patient> {
    return this.repository.create(input);
  }

  async update(input: PatientUpdate): Promise<Patient> {
    const updated = await this.repository.update(input);
    if (!updated) throw new NotFoundError("Patient", input.patientId);
    return updated;
  }
}
