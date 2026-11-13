import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { configureSqlite, type Db } from "../src/db/client";
import { MIGRATIONS_FOLDER } from "../src/db/migrations-folder";
import { schema } from "../src/db/schema";

/** A fresh, migrated, in-memory database. Each call is its own database. */
export function createTestDb(): Db {
  const sqlite = configureSqlite(new Database(":memory:"));
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return db;
}
