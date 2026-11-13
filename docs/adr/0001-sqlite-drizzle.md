# 1. SQLite + Drizzle for the database

Status: Accepted

## Context

Lab Orders Lite is a take-home app. A reviewer must be able to clone it and run it fast.
The app has 4 small tables and one user at a time.
The tests must be fast and must not share state.

## Decision

We use SQLite (through `better-sqlite3`) with Drizzle ORM and `drizzle-kit` migrations.

- The database is one file: `apps/api/data/lab.db` (or the path in `DATABASE_URL`). Git ignores it.
- `pnpm db:migrate && pnpm db:seed` makes a full database with starter data.
- Each test calls `createTestDb()`. It gets a new, migrated database in memory. Tests do not share data.
- Foreign keys are on for every connection (`PRAGMA foreign_keys = ON`). SQLite has them off by default.
- Drizzle gives typed queries and makes the SQL migration from `schema.ts`.

## Why not Postgres

- Postgres needs Docker or a local install. A reviewer would need to set it up before the app runs.
- Tests on Postgres need a running server and a reset between tests. In-memory SQLite needs neither.
- The app does not need what Postgres adds (many writers at once, extensions, roles).

## Results

- Good: no setup step. Tests are fast and isolated.
- Bad: SQLite has fewer column types. Money is a `real` (dollars), and one helper rounds it to 2 places.
  Dates are text (`YYYY-MM-DD` and ISO time).
- Bad: `order` is a reserved word in SQL. Drizzle quotes it. Raw SQL must write `"order"`.
- If we need Postgres later, Drizzle has a Postgres driver. We change `schema.ts` imports and make new migrations.
  The repositories stay almost the same.
