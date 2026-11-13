import type { LabTest, LabTestCreate, LabTestUpdate } from "@lab/shared";
import { asc, count, eq, inArray, or, type SQL, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { type Page, type PageParams, paginate } from "../db/paginate";
import { lab_test } from "../db/schema";

type LabTestRow = typeof lab_test.$inferSelect;

export type LabTestListParams = PageParams & {
  /** Case-insensitive match on code or name. */
  search?: string;
};

function toLabTest(row: LabTestRow): LabTest {
  return {
    labTestId: row.lab_test_id,
    code: row.code,
    name: row.name,
    price: row.price,
    turnaroundDays: row.turnaround_days,
  };
}

/** `%text%` for LIKE, with `%`, `_` and `\` in the text matched as plain characters. */
function containsPattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/** SQLite LIKE ignores case for ASCII letters. */
function searchFilter(search: string | undefined): SQL | undefined {
  const text = search?.trim();
  if (!text) return undefined;
  const pattern = containsPattern(text);
  return or(
    sql`${lab_test.code} LIKE ${pattern} ESCAPE '\\'`,
    sql`${lab_test.name} LIKE ${pattern} ESCAPE '\\'`,
  );
}

/** The only code that reads and writes the lab_test table. */
export class LabTestRepository {
  constructor(readonly db: Db) {}

  /** One page of lab tests, sorted by code. */
  async list(params: LabTestListParams): Promise<Page<LabTest>> {
    const where = searchFilter(params.search);
    const page = await paginate(params, {
      items: (limit, offset) =>
        this.db
          .select()
          .from(lab_test)
          .where(where)
          .orderBy(asc(lab_test.code))
          .limit(limit)
          .offset(offset),
      count: async () => {
        const [row] = await this.db
          .select({ total: count() })
          .from(lab_test)
          .where(where);
        return row?.total ?? 0;
      },
    });
    return { ...page, items: page.items.map(toLabTest) };
  }

  async findById(id: number): Promise<LabTest | null> {
    const [row] = await this.db
      .select()
      .from(lab_test)
      .where(eq(lab_test.lab_test_id, id));
    return row ? toLabTest(row) : null;
  }

  /** The lab tests with these ids. Ids that do not exist are left out. */
  async findByIds(ids: number[]): Promise<LabTest[]> {
    if (ids.length === 0) return [];
    const rows = await this.db
      .select()
      .from(lab_test)
      .where(inArray(lab_test.lab_test_id, ids));
    return rows.map(toLabTest);
  }

  async findByCode(code: string): Promise<LabTest | null> {
    const [row] = await this.db
      .select()
      .from(lab_test)
      .where(eq(lab_test.code, code));
    return row ? toLabTest(row) : null;
  }

  async create(input: LabTestCreate): Promise<LabTest> {
    const [row] = await this.db
      .insert(lab_test)
      .values({
        code: input.code,
        name: input.name,
        price: input.price,
        turnaround_days: input.turnaroundDays,
      })
      .returning();
    if (!row) throw new Error("Insert into lab_test returned no row");
    return toLabTest(row);
  }

  /** Returns null when no lab test has this id. */
  async update(input: LabTestUpdate): Promise<LabTest | null> {
    const [row] = await this.db
      .update(lab_test)
      .set({
        code: input.code,
        name: input.name,
        price: input.price,
        turnaround_days: input.turnaroundDays,
      })
      .where(eq(lab_test.lab_test_id, input.labTestId))
      .returning();
    return row ? toLabTest(row) : null;
  }
}
