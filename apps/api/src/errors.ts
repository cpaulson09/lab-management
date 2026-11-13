/**
 * Errors that services throw. The tRPC layer turns each one into the right
 * error code (see `trpc/trpc.ts`), so services never import tRPC.
 */

/** The thing asked for does not exist. → NOT_FOUND */
export class NotFoundError extends Error {
  constructor(entity: string, id: number | string) {
    super(`${entity} ${id} was not found`);
    this.name = "NotFoundError";
  }
}

/** The change clashes with data that already exists, e.g. a duplicate code. → CONFLICT */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/** The request breaks a business rule. → BAD_REQUEST */
export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}
