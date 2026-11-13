import { OrderAlreadyCompletedError } from "@lab/shared";
import { initTRPC, type TRPC_ERROR_CODE_KEY, TRPCError } from "@trpc/server";
import { BusinessRuleError, ConflictError, NotFoundError } from "../errors";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

function errorCodeFor(error: unknown): TRPC_ERROR_CODE_KEY | null {
  if (error instanceof NotFoundError) return "NOT_FOUND";
  if (error instanceof ConflictError) return "CONFLICT";
  if (error instanceof BusinessRuleError) return "BAD_REQUEST";
  if (error instanceof OrderAlreadyCompletedError) return "BAD_REQUEST";
  return null;
}

/** Turns service errors into tRPC errors with the right code and message. */
const mapServiceErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (!result.ok) {
    const cause = result.error.cause;
    const code = errorCodeFor(cause);
    if (code && cause instanceof Error) {
      throw new TRPCError({ code, message: cause.message, cause });
    }
  }
  return result;
});

export const router = t.router;
export const publicProcedure = t.procedure.use(mapServiceErrors);
export const createCallerFactory = t.createCallerFactory;
