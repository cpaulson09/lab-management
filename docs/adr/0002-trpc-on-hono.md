# 2. tRPC on Hono for the API

Status: Accepted

## Context

The web app and the API are both TypeScript, in one repo.
They share the Zod schemas and rules in `packages/shared`.
The API has about 12 calls (list, get, create, update, complete). One web app uses them.

## Decision

We use tRPC, served by Hono (`@hono/trpc-server`), not a REST API.

- Each controller is a tRPC router. Its input is a Zod schema from `packages/shared`.
- The web app imports the `AppRouter` type. It gets typed calls and typed results with no extra code.
- Hono is the HTTP server. It also serves the plain `/health` route and is easy to grow.

## Why not REST

- With REST, we would write the routes, a typed client and the response types by hand, or add OpenAPI and a code generator.
- With tRPC, a change to a service result shows up as a type error in the web app at once.
- The same Zod schema checks the form in the web app and the input in the API. No copy.

## Results

- Good: end-to-end types. Less glue code. One place for each schema.
- Good: router tests call the procedures directly (`createTestCaller`). No HTTP in the tests.
- Bad: the URLs are not nice for curl. A call is `GET /trpc/orders.list?input=...` with JSON in the query string.
- Bad: the web app must be TypeScript to get the types. Another client (a mobile app, a partner) gets no typed contract.
  If we need a public API later, we can add REST routes in Hono beside tRPC, or add an OpenAPI adapter.
