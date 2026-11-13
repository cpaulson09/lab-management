# Lab Orders Lite

A small clinic app for patients, a lab test catalog, and orders. Each order shows its total cost and estimated ready date. Everything is TypeScript.

## Run it

Needs Node 24+ and pnpm 11.

```bash
pnpm start
```

Open http://localhost:5173 (API on :3000). `pnpm start` installs, migrates, seeds an empty database, and starts both apps, skipping steps that are already done.

Other commands: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm db:seed` (wipes and reseeds the SQLite file at `apps/api/data/lab.db`).

## Architecture

```
apps/api/         Hono + tRPC + Drizzle (SQLite)
apps/web/         React + Vite + TanStack Query + Tailwind + shadcn/ui
packages/shared/  Zod schemas + pure business rules, used by both apps
docs/             PLAN.md (every decision) and adr/ (decision records)
```

- **Shared rules.** Total, business days, ready date and "complete" are pure functions in `packages/shared`. The API uses them to save an order; the web app uses the same ones for a live preview, so both always match.
- **API in 3 layers.** Controllers (tRPC: validate, call a service) → services (business rules) → repositories (the only code that touches the database). `container.ts` wires them, so tests can pass fake repositories or a fixed clock. Services throw plain errors; one middleware maps them to tRPC codes.
- **Data.** `patient ─< order ─< order_item >─ lab_test`. Each `order_item` copies the test's price and turnaround when the order is placed, so catalog edits never change past orders.
- **Web.** 3 pages (Patients, Catalog, Orders) with dialogs and a side panel. Server data lives in TanStack Query, used only through each page's hooks. Filters and paging live in the URL. Forms use React Hook Form with the shared Zod schemas. No global store.
- **Rules.** Ready date = the longest test's turnaround, counted in business days (Mon–Fri) from the day after the order is placed. Status is `Pending → Completed`, and Completed is final.

## Testing

76 Vitest tests (`pnpm test`): unit tests on the shared rules and on services (fake repositories, fixed clock), and router tests through real services on a fresh in-memory SQLite database per test. No UI tests; the screens were checked by hand.

## Decisions and trade-offs

| Decision | Why | Cost |
|---|---|---|
| SQLite + Drizzle | No Docker; fast, isolated in-memory tests | Not a production database |
| tRPC, not REST | End-to-end types, shared schemas | Harder to call from curl |
| Dollars as floats, rounded to 2 places | Simple | Integer cents would be safer |
| Ready date in UTC, no holidays | One small, testable rule | Can look a day off late at night in the US |
| Folders grouped by layer | Clear with only 3 features | I would group by feature as it grows |

## Known limits and next steps

- Not built: login, delete, editing or cancelling an order, test results.
- The "New order" pickers load only the first 100 patients and tests. A bigger database needs a search picker.
- No UI tests. Next: a few component tests and one Playwright test of the main flow.
- Next features: holidays and time zones, money in cents, cancel and edit while `Pending`, results entry.

## How I used AI (Building process)

- **Planning:** I used a "grilling" skill to question me on scope, architecture and testing before any code. The answers are in `docs/PLAN.md`. I made each decision; for example, I chose tRPC, Hono, float dollars, business days, 2 statuses, folders grouped by layer, and the light theme.
- **Design:** a quick design mockup from a baseline screenshot, before the UI code.
- **Building:** the plan was split into steps. Steps that touch different folders ran at the same time in separate Claude Code sessions (for example rules, database and web parts). I reviewed each branch and its checks before merging.
- **What I changed:** <!-- TODO(Connor): add the parts you rewrote or reviewed by hand. -->
