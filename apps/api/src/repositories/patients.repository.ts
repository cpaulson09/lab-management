import type { Patient, PatientCreate, PatientUpdate } from "@lab/shared";
import { asc, count, eq, or, type SQL, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { type Page, type PageParams, paginate } from "../db/paginate";
import { patient } from "../db/schema";

type PatientRow = typeof patient.$inferSelect;

export type PatientListParams = PageParams & {
  /** Matches part of the first or last name, any case. */
  search?: string;
};

function toPatient(row: PatientRow): Patient {
  return {
    patientId: row.patient_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
  };
}

/** Escapes LIKE wildcards so the search text matches as plain text. */
function containsPattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

function nameMatches(search: string | undefined): SQL | undefined {
  const text = search?.trim();
  if (!text) return undefined;
  const pattern = containsPattern(text.toLowerCase());
  return or(
    sql`lower(${patient.first_name}) like ${pattern} escape '\\'`,
    sql`lower(${patient.last_name}) like ${pattern} escape '\\'`,
  );
}

/** The only code that reads and writes the patient table. */
export class PatientRepository {
  constructor(readonly db: Db) {}

  /** One page of patients, sorted by last name, then first name. */
  async list(params: PatientListParams): Promise<Page<Patient>> {
    const where = nameMatches(params.search);
    return paginate(params, {
      items: async (limit, offset) => {
        const rows = await this.db
          .select()
          .from(patient)
          .where(where)
          .orderBy(
            asc(patient.last_name),
            asc(patient.first_name),
            asc(patient.patient_id),
          )
          .limit(limit)
          .offset(offset);
        return rows.map(toPatient);
      },
      count: async () => {
        const [row] = await this.db
          .select({ total: count() })
          .from(patient)
          .where(where);
        return row?.total ?? 0;
      },
    });
  }

  async findById(id: number): Promise<Patient | null> {
    const [row] = await this.db
      .select()
      .from(patient)
      .where(eq(patient.patient_id, id))
      .limit(1);
    return row ? toPatient(row) : null;
  }

  async create(input: PatientCreate): Promise<Patient> {
    const [row] = await this.db
      .insert(patient)
      .values({
        first_name: input.firstName,
        last_name: input.lastName,
        date_of_birth: input.dateOfBirth,
        phone: input.phone ?? null,
        email: input.email ?? null,
      })
      .returning();
    if (!row) throw new Error("Insert into patient returned no row");
    return toPatient(row);
  }

  /** Replaces the patient's fields. Returns null when no patient has this id. */
  async update(input: PatientUpdate): Promise<Patient | null> {
    const [row] = await this.db
      .update(patient)
      .set({
        first_name: input.firstName,
        last_name: input.lastName,
        date_of_birth: input.dateOfBirth,
        phone: input.phone ?? null,
        email: input.email ?? null,
      })
      .where(eq(patient.patient_id, input.patientId))
      .returning();
    return row ? toPatient(row) : null;
  }
}
