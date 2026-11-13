import { TRPCClientError } from "@trpc/client";

/** The tRPC error code (for example "CONFLICT"), or null for other errors. */
export function apiErrorCode(error: unknown): string | null {
  if (!(error instanceof TRPCClientError)) return null;
  const code = (error.data as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : null;
}

/**
 * A message that is safe to show in a toast. Service errors carry a plain
 * sentence. Zod input errors carry raw JSON (starts with "["), so they get a
 * general message instead.
 */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError && !error.message.startsWith("[")) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
