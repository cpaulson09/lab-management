# Lab Orders Lite: Plan

We build in small steps, in order. After each step, the app runs and the tests pass.

## What we picked

- **Repo:** pnpm workspaces. 3 parts: `apps/api`, `apps/web`, `packages/shared`.
- **API:** Hono + tRPC.
- **Database:** SQLite + Drizzle.
- **Web:** React + Vite + React Router + Tailwind + shadcn/ui.
- **API layers:** controller → service → repository. See "API layers" below.
- **Tests:** Vitest. Unit tests for the rules and services. Router tests for the API.
- **Money:** dollars, rounded to 2 places by one helper.
- **Status:** Pending → Completed. Completed is final.
- **Ready date:** business days only (skip weekends, no holidays). The longest test wins.
- **Old orders:** keep the price and turnaround from when the order was placed.
- **Lists:** pages of 20 rows, with Prev / Next.
- **Skipped:** login, delete, editing an order, test results, UI tests.

## API layers

The API has 3 layers. Each layer talks only to the layer below it.

1. **Controller** (tRPC router): reads the request, checks the input with Zod, calls a service. No business rules. No SQL.
2. **Service**: the business rules. For example: snapshot the prices, find the ready date, block a second "complete". It uses the rule functions from `packages/shared`. No SQL.
3. **Repository**: the only layer that talks to the database (Drizzle). No business rules.

Folders are grouped by layer:

```
apps/api/
  src/
    controllers/
      patients.controller.ts       list, get, create, update
      lab-tests.controller.ts      list, create, update
      orders.controller.ts         list, get, create, complete
    services/
      patients.service.ts
      lab-tests.service.ts
      orders.service.ts
    repositories/
      patients.repository.ts
      lab-tests.repository.ts
      orders.repository.ts
    db/
      schema.ts                    the 4 tables
      client.ts                    opens SQLite
      migrations/
      seed.ts                      fake starter data
      paginate.ts                  the paging helper
    trpc/
      trpc.ts                      tRPC setup
      context.ts                   gives each request the services
      router.ts                    joins the 3 controllers
    container.ts                   makes the repositories and services, and connects them
    app.ts                         builds the Hono app (tests use this)
    server.ts                      starts the server
  test/
    createTestDb.ts                fresh in-memory database for each test
```

Why grouped by layer: with 3 features, it keeps the 3 layers very easy to see. With many more features, we would move to one folder per feature.

How it is tested (each test file sits next to the file it tests):
- Services: unit tests with a fake repository. No database. Fast.
- Controllers: router tests through the real service and repository, on an in-memory database.

## Data

4 tables. Table names are singular. Each primary key is `<table>_id`. A foreign key has the same name as the key it points to.

**patient**
- `patient_id` integer, primary key
- `first_name` text
- `last_name` text
- `date_of_birth` text (`YYYY-MM-DD`)
- `phone` text, optional
- `email` text, optional
- `created_at` text (ISO time)

**lab_test**
- `lab_test_id` integer, primary key
- `code` text, unique (e.g. `CBC`)
- `name` text
- `price` real (dollars)
- `turnaround_days` integer (business days, at least 1)

**order** (a reserved word in SQL: Drizzle quotes it for us, but raw SQL must write `"order"`)
- `order_id` integer, primary key (shown as `#1048`)
- `patient_id` → `patient.patient_id`
- `status` text (`Pending` or `Completed`)
- `placed_at` text (ISO time)
- `ready_date` text (`YYYY-MM-DD`, set when placed)
- `total` real (set when placed, rounded to 2 places)
- `completed_at` text, optional

**order_item**
- `order_item_id` integer, primary key
- `order_id` → `order.order_id`
- `lab_test_id` → `lab_test.lab_test_id`
- `price` real (copied from the catalog when the order is placed)
- `turnaround_days` integer (copied from the catalog when the order is placed)
- unique (`order_id`, `lab_test_id`): the same test cannot be in an order twice

A patient has many orders. An order has many order items. Each order item points to one lab test.

The Drizzle tables live in `apps/api/src/db/schema.ts`. Only the repositories use them.

## Web structure

3 pages: Patients, Catalog and Orders. Add, edit, new order and order detail open in a dialog or side panel on their page.

```
apps/web/src/
  components/
    ui/                  shadcn parts
    shared/              parts many pages use (Pagination, StatusBadge)
    layout/              AppShell, SideNav
  pages/
    Patients/
      Patients.tsx
      PatientTable.tsx
      PatientForm.tsx    dialog
      usePatients.ts
    Catalog/
      Catalog.tsx
      LabTestTable.tsx
      LabTestForm.tsx    dialog
      useLabTests.ts
    Orders/
      Orders.tsx
      OrderTable.tsx
      OrderFilters.tsx
      NewOrder.tsx       dialog
      TestPicker.tsx
      OrderSummary.tsx
      OrderDetail.tsx    side panel, open state in the URL (?open=1048)
      useOrders.ts
      useOrderFilters.ts
  lib/
    trpc.ts
  app/
    providers.tsx
    routes.tsx           /patients, /catalog, /orders
  main.tsx
```

State:
- Server data: TanStack Query (through tRPC). Screens use it only through the page's hooks.
- Filters and page number: in the URL.
- Forms: React Hook Form + Zod.
- Small UI state: `useState`.
- No global store. If one is needed later, it goes in `src/stores/`, and only the hooks change.

## Look

Light theme. Design: https://claude.ai/artifact/Gb1v9EkveH1jq6qSaL7nF4 ("Light theme" row).

| Name | Color | Use |
|---|---|---|
| background | `#f3f7f0` | Page |
| card | `#ffffff` | Panels, tables, inputs |
| primary | `#0f2a2c` | Side nav, main buttons, text |
| secondary | `#e3f9a6` | Active nav, Completed badge, highlights |
| link | `#1d5c4f` | Links |
| muted text | `#56676a` | Helper text, table headers |
| border | `#dbe5d8` | Lines |

- Main buttons are dark green with lime text.
- Lime is only a fill. Never use lime for text on a light background. It is too pale to read.
- Font: Figtree.
- Baseline screenshot: [design/baseline.png](design/baseline.png).

## Order and parallel work

Some steps need others first. Steps on the same line can run at the same time, because they touch different folders.

```
            ┌─ 1. Rules ───────┐
0. Skeleton ┼─ 2. Database ────┼─ 3. API ─ 4. Screens ─ 5. README ─ 6. Bug fixes
            └─ 4a. Web parts ──┘
```

| When | What runs at the same time |
|---|---|
| First | 0. Skeleton (alone: everything needs it) |
| After 0 | 1. Rules, 2. Database, 4a. Shared web parts |
| After 1 + 2 | 3. API (patients and lab tests first, then orders) |
| After 3 | 4. Screens: Patients, Catalog and Orders |
| Last | 5. README, then 6. Bug fixes |

## Steps

**0. Skeleton**
Set up the repo with 3 parts: `apps/api`, `apps/web` and `packages/shared`. The web page asks the API "are you ok?" and shows the answer. Add the green theme and the shadcn/ui parts (button, input, select, table, card, badge, dialog, toast). `pnpm dev` starts everything.

**1. Rules (no database, no screens)**
Write the business rules as small functions. Test each one.
- Add up the order total (rounded to 2 places).
- Count business days (skip weekends).
- Find the ready date (the longest test wins).
- Mark an order completed (only once).

**2. Database**
Make the tables: patients, lab tests, orders, order items. Add fake starter data. Add a helper that splits lists into pages.

**3. API**
Build one feature at a time: patients, then lab tests, then orders. For each feature, build the repository, then the service, then the controller. Test the service with a fake repository. Test the controller against a temporary database in memory.

**4. Screens**
Build 3 pages with Tailwind:
- Patients (list, search, pages, add/edit dialog)
- Catalog (list, pages, add/edit dialog)
- Orders (list, filters, pages, new order dialog with a live total and ready date, detail panel with a "Mark completed" button)

**5. README**
Explain how to run the app, how it is built, and what we skipped and why.

**6. Bug fixes**
Run the app from a fresh copy. Click every page. Fix what breaks.
