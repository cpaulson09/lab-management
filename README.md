# Lab Orders Lite

A small clinic app for **patients**, a **lab test catalog**, and **orders**.
An order is for one patient and has one or more tests. The app shows each order's total cost and its estimated ready date.

Everything is TypeScript: a React web app, a tRPC API, and a shared package for the business rules.

## Run it

You need **Node 24+** and **pnpm 11** (a `mise.toml` and `.nvmrc` pin them).

```bash
pnpm start
```

Then open http://localhost:5173. The API runs on http://localhost:3000.

`pnpm start` does each step only when it is needed:

1. Installs packages (skipped when they match the lockfile).
2. Runs database migrations (only new ones).
3. Seeds sample data (skipped when the database already has data).
4. Starts the API and the web app.

### Other commands

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the API and web app (no install, migrate or seed) |
| `pnpm test` | Runs all tests |
| `pnpm typecheck` | Type-checks every package |
| `pnpm lint` / `pnpm format` | Biome lint, or lint and fix |
| `pnpm db:migrate` | Applies new migrations |
| `pnpm db:seed` | **Wipes** the database and seeds it again |

The database is a SQLite file at `apps/api/data/lab.db`. Delete it to start from zero.

## How it is built

```
apps/
  api/        Hono + tRPC + Drizzle (SQLite)
  web/        React + Vite + React Router + TanStack Query + Tailwind + shadcn/ui
packages/
  shared/     Zod schemas + pure business rules, used by both apps
docs/
  PLAN.md     the build plan and every decision
  adr/        decision records (SQLite + Drizzle, tRPC on Hono)
```

### Shared package

`packages/shared` holds the Zod schemas and the business rules as small pure functions: `orderTotal`, `addBusinessDays`, `estimateReadyDate`, `completeOrder`.
The API uses them to save orders. The web app uses the same functions to show a live total and ready date before you submit, so the preview and the saved order always match.

### API: 3 layers

Each layer only talks to the layer below it.

| Layer | Folder | Job |
|---|---|---|
| Controller | `src/controllers/` | tRPC procedures. Check the input with Zod, call a service. No rules, no SQL. |
| Service | `src/services/` | The business rules. No SQL. |
| Repository | `src/repositories/` | The only code that talks to the database. No rules. |

- `src/container.ts` builds everything in one place: database → repositories → services. Tests can swap in a fake repository or a fixed clock.
- Services throw plain errors (`NotFoundError`, `ConflictError`, `BusinessRuleError`). One tRPC middleware turns them into the right error codes, so services never import tRPC.
- Creating an order runs in one database transaction.

Folders are grouped by layer because there are only 3 features. With many more features, I would group by feature (`features/orders/…`) instead.

### Data

4 tables. Table names are singular and each primary key is `<table>_id`.

```
patient ─< order ─< order_item >─ lab_test
```

`order_item` holds the copied price and turnaround. The table name `order` is a SQL reserved word: Drizzle quotes it, but raw SQL must write `"order"`.

### Web app

3 pages: Patients, Catalog, Orders. Add, edit, new order and order detail open as a dialog or side panel on their page.

```
src/
  components/ui/       shadcn parts
  components/shared/   parts many pages use (Pagination, StatusBadge…)
  components/layout/   app shell and side nav
  pages/<Page>/        the page, its parts, and its data hooks
  app/                 providers and routes
```

State:

| Kind | Tool |
|---|---|
| Server data | TanStack Query through tRPC. Components use it only through each page's hooks (`useOrders`, …). |
| Filters, search, page, open order | The URL, so links and the Back button work. |
| Forms | React Hook Form + the shared Zod schemas. |
| Small UI state | `useState` |

There is no global store. TanStack Query already holds the server data. If one is needed later, it goes in `src/stores/` and only the page hooks change.

## Decisions and trade-offs

| Decision | Why | Cost |
|---|---|---|
| SQLite + Drizzle | Clone and run with no Docker. In-memory tests are fast and isolated. | Not a production database. See `docs/adr/0001`. |
| tRPC instead of REST | End-to-end types and shared Zod schemas with little glue. | Harder to call from curl. Ties the client to TypeScript. See `docs/adr/0002`. |
| Money as dollar floats | Simple to read and store. One helper rounds every total to 2 places. | Integer cents would be safer. |
| Ready date in UTC | One clear rule, the same on server and client. | Late in the evening in US time zones it can look one day off. |
| Business days without holidays | Keeps the rule small and easy to test. | Holidays count as working days. |
| 2 statuses only | Enough for the filter and one real rule. | No "in progress" or "cancelled". |

## Known limits and what I would do next

- **Not built:** login, delete, editing a placed order, cancelling, entering test results.
- The patient and test pickers in "New order" load only the first 100 rows (the API's max page size). A bigger database needs a search picker.
- No UI tests. Next I would add a few component tests and one Playwright test for the main flow.
- Next features: holidays and time zones in the ready date, money in cents, cancel and edit while `Pending`, results entry, and an audit trail.

## How I used AI (Building process)

- **Planning:** I used a "grilling" skill to question me on scope, architecture and testing before any code. The answers are in `docs/PLAN.md`. I made each decision; for example, I chose tRPC, Hono, float dollars, business days, 2 statuses, folders grouped by layer, and the light theme.
- **Design:** a quick design mockup from a baseline screenshot, before the UI code.
- **Building:** the plan was split into steps. Steps that touch different folders ran at the same time in separate Claude Code sessions (for example rules, database and web parts). I reviewed each branch and its checks before merging.
- **What I changed:** <!-- TODO(Connor): add the parts you rewrote or reviewed by hand. -->
