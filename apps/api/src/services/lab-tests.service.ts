import {
  type LabTest,
  type LabTestCreate,
  type LabTestUpdate,
  roundMoney,
} from "@lab/shared";
import type { Page } from "../db/paginate";
import { ConflictError, NotFoundError } from "../errors";
import type {
  LabTestListParams,
  LabTestRepository,
} from "../repositories/lab-tests.repository";

/** What the service needs from storage. Unit tests pass a fake. */
export type LabTestStore = Pick<
  LabTestRepository,
  "list" | "findById" | "findByCode" | "create" | "update"
>;

/** Business rules for the lab test catalog. */
export class LabTestService {
  constructor(private readonly repository: LabTestStore) {}

  list(params: LabTestListParams): Promise<Page<LabTest>> {
    return this.repository.list(params);
  }

  async get(labTestId: number): Promise<LabTest> {
    const labTest = await this.repository.findById(labTestId);
    if (!labTest) throw new NotFoundError("Lab test", labTestId);
    return labTest;
  }

  async create(input: LabTestCreate): Promise<LabTest> {
    await this.assertCodeIsFree(input.code);
    return this.repository.create({ ...input, price: roundMoney(input.price) });
  }

  /**
   * Changes the catalog only. Orders keep the price and turnaround they
   * copied when they were placed, so no order changes here.
   */
  async update(input: LabTestUpdate): Promise<LabTest> {
    await this.get(input.labTestId);
    await this.assertCodeIsFree(input.code, input.labTestId);
    const updated = await this.repository.update({
      ...input,
      price: roundMoney(input.price),
    });
    if (!updated) throw new NotFoundError("Lab test", input.labTestId);
    return updated;
  }

  /** Each code belongs to one lab test. The DB unique index is the backstop. */
  private async assertCodeIsFree(code: string, ownId?: number): Promise<void> {
    const existing = await this.repository.findByCode(code);
    if (existing && existing.labTestId !== ownId) {
      throw new ConflictError(`Lab test code ${code} is already in use`);
    }
  }
}
