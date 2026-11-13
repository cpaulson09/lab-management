import { TRPCClientError } from "@trpc/client";

/** The tRPC error code (for example "CONFLICT"), or null for other errors. */
export function apiErrorCode(error: unknown): string | null {
  if (!(error instanceof TRPCClientError)) return null;
  const code = (error.data as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : null;
}

/**
 * A message that is safe to show in a toast.
 * - Service errors carry a plain sentence: show it.
 * - No tRPC code means the API did not answer (stopped, network down): say so.
 * - Zod input errors carry raw JSON (starts with "[") and server crashes carry
 *   internal text: show a general message instead.
 */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    const code = apiErrorCode(error);
    if (code === null) {
      return "Could not reach the API. Check that it is running, then try again.";
    }
    if (code !== "INTERNAL_SERVER_ERROR" && !error.message.startsWith("[")) {
      return error.message;
    }
  }
  return "Something went wrong. Please try again.";
}
