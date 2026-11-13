import { createContainer } from "../src/container";
import type { Db } from "../src/db/client";
import { createContext } from "../src/trpc/context";
import { appRouter } from "../src/trpc/router";
import { createCallerFactory } from "../src/trpc/trpc";
import { createTestDb } from "./createTestDb";

/**
 * A tRPC caller wired to real services and repositories on a fresh in-memory database.
 * Use it for controller (router) tests. `now` fixes the clock for date rules.
 */
export function createTestCaller(options: { db?: Db; now?: () => Date } = {}) {
  const db = options.db ?? createTestDb();
  const services = createContainer(db, options.now);
  const caller = createCallerFactory(appRouter)(createContext(services));
  return { caller, db, services };
}
