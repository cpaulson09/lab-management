import { describe, expect, it } from "vitest";
import { labTestCreateSchema } from "./lab-test";
import { latestDateOfBirth, patientCreateSchema } from "./patient";

const ann = { firstName: "Ann", lastName: "Lee", dateOfBirth: "1990-05-05" };

function firstMessage(result: { error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message;
}

describe("patientCreateSchema", () => {
  it("accepts a normal patient", () => {
    expect(patientCreateSchema.safeParse(ann).success).toBe(true);
  });

  it("rejects a date of birth in the future", () => {
    const result = patientCreateSchema.safeParse({
      ...ann,
      dateOfBirth: "2999-01-01",
    });
    expect(firstMessage(result)).toBe("Date of birth cannot be in the future");
  });

  it("rejects a date of birth before 1900", () => {
    const result = patientCreateSchema.safeParse({
      ...ann,
      dateOfBirth: "0099-05-05",
    });
    expect(firstMessage(result)).toBe("Use a date in 1900 or later");
  });

  it("accepts today's date in every time zone", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(
      patientCreateSchema.safeParse({ ...ann, dateOfBirth: today }).success,
    ).toBe(true);
  });

  it("gives a plain message for a name that is too long", () => {
    const result = patientCreateSchema.safeParse({
      ...ann,
      firstName: "a".repeat(101),
    });
    expect(firstMessage(result)).toBe("Use 100 characters or fewer");
  });
});

describe("latestDateOfBirth", () => {
  it("is today in UTC+14", () => {
    expect(latestDateOfBirth(new Date("2026-11-12T09:59:00Z"))).toBe(
      "2026-11-12",
    );
    expect(latestDateOfBirth(new Date("2026-11-12T10:00:00Z"))).toBe(
      "2026-11-13",
    );
  });
});

describe("labTestCreateSchema", () => {
  it("gives a plain message for a code that is too long", () => {
    const result = labTestCreateSchema.safeParse({
      code: "X".repeat(21),
      name: "Test",
      price: 1,
      turnaroundDays: 1,
    });
    expect(firstMessage(result)).toBe("Use 20 characters or fewer");
  });
});
