import type { Patient } from "@lab/shared";
import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import { PatientService, type PatientStore } from "./patients.service";

const ada: Patient = {
  patientId: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  dateOfBirth: "1990-12-10",
  phone: null,
  email: null,
  createdAt: "2026-01-01T09:00:00.000Z",
};

/** An in-memory store with one patient. No database. */
function fakeStore(): PatientStore {
  const rows = new Map<number, Patient>([[ada.patientId, ada]]);
  return {
    list: async () => ({
      items: [...rows.values()],
      total: rows.size,
      page: 1,
      pageSize: 20,
    }),
    findById: async (id) => rows.get(id) ?? null,
    create: async (input) => ({
      ...ada,
      ...input,
      phone: input.phone ?? null,
      email: input.email ?? null,
      patientId: rows.size + 1,
    }),
    update: async (input) => {
      const current = rows.get(input.patientId);
      if (!current) return null;
      const next = {
        ...current,
        ...input,
        phone: input.phone ?? null,
        email: input.email ?? null,
      };
      rows.set(next.patientId, next);
      return next;
    },
  };
}

describe("PatientService", () => {
  it("get returns the patient", async () => {
    const service = new PatientService(fakeStore());
    await expect(service.get(1)).resolves.toEqual(ada);
  });

  it("get throws NotFoundError for an unknown id", async () => {
    const service = new PatientService(fakeStore());
    await expect(service.get(999)).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.get(999)).rejects.toThrow("Patient 999 was not found");
  });

  it("update returns the changed patient", async () => {
    const service = new PatientService(fakeStore());
    const updated = await service.update({
      patientId: 1,
      firstName: "Augusta",
      lastName: "King",
      dateOfBirth: "1990-12-10",
    });
    expect(updated.firstName).toBe("Augusta");
  });

  it("update throws NotFoundError for an unknown id", async () => {
    const service = new PatientService(fakeStore());
    await expect(
      service.update({
        patientId: 999,
        firstName: "No",
        lastName: "One",
        dateOfBirth: "2000-01-01",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
