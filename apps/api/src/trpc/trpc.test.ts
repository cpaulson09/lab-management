import { OrderAlreadyCompletedError } from "@lab/shared";
import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { BusinessRuleError, ConflictError, NotFoundError } from "../errors";
import type { Context } from "./context";
import { createCallerFactory, publicProcedure, router } from "./trpc";

const testRouter = router({
  fail: publicProcedure
    .input((v) => v as string)
    .query(({ input }) => {
      if (input === "notFound") throw new NotFoundError("Patient", 7);
      if (input === "conflict") throw new ConflictError("Code CBC is taken");
      if (input === "rule") throw new BusinessRuleError("Not allowed");
      if (input === "completed") throw new OrderAlreadyCompletedError(1048);
      throw new Error("boom");
    }),
});

const caller = createCallerFactory(testRouter)({} as Context);

async function codeOf(input: string) {
  try {
    await caller.fail(input);
  } catch (error) {
    if (error instanceof TRPCError) return [error.code, error.message];
  }
  return null;
}

describe("service error mapping", () => {
  it("maps each service error to a tRPC code and keeps the message", async () => {
    expect(await codeOf("notFound")).toEqual([
      "NOT_FOUND",
      "Patient 7 was not found",
    ]);
    expect(await codeOf("conflict")).toEqual(["CONFLICT", "Code CBC is taken"]);
    expect(await codeOf("rule")).toEqual(["BAD_REQUEST", "Not allowed"]);
    expect((await codeOf("completed"))?.[0]).toBe("BAD_REQUEST");
  });

  it("leaves unknown errors as INTERNAL_SERVER_ERROR", async () => {
    expect((await codeOf("boom"))?.[0]).toBe("INTERNAL_SERVER_ERROR");
  });
});
