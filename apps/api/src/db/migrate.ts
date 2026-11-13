import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { databasePath, openDb } from "./client";
import { MIGRATIONS_FOLDER } from "./migrations-folder";

const path = databasePath();
const { db, sqlite } = openDb(path);
migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
sqlite.close();
console.log(`Migrated ${path}`);
