import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import { schema } from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

export const DEFAULT_DATABASE_URL = "./data/lab.db";

/** Path to the database file. Relative paths are from apps/api. */
export function databasePath(): string {
  return process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
}

/** Turns on the settings every connection needs (foreign keys on). */
export function configureSqlite(sqlite: Database.Database): Database.Database {
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

/** Opens (and creates, if needed) the SQLite database file. */
export function openDb(path: string = databasePath()): {
  db: Db;
  sqlite: Database.Database;
} {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }
  const sqlite = configureSqlite(new Database(path));
  if (path !== ":memory:") {
    sqlite.pragma("journal_mode = WAL");
  }
  return { db: drizzle(sqlite, { schema }), sqlite };
}
